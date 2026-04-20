"use client";

import React, { useEffect, useState, useRef } from 'react';
import { useWorkflowStore } from '@/store/useWorkflowStore';
import { getLayoutedNodes } from '@/lib/layout';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Play, LayoutDashboard, Trash2, Undo2, Redo2, Plus, Command } from 'lucide-react';
import { cn } from '@/lib/utils';

export const CommandPalette = ({ onSimulate }: { onSimulate: () => void }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);

  const { clearWorkflow, undo, redo, nodes, edges, setNodes, addNode } = useWorkflowStore();
  const wrapperRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const commands = [
    { id: 'sim', title: 'Simulate Workflow', icon: Play, action: () => { setIsOpen(false); setQuery(''); onSimulate(); } },
    { id: 'layout', title: 'Auto Layout Graph', icon: LayoutDashboard, action: () => { setIsOpen(false); setQuery(''); setNodes(getLayoutedNodes(nodes, edges)); } },
    { id: 'clear', title: 'Clear Canvas', icon: Trash2, action: () => { setIsOpen(false); setQuery(''); clearWorkflow(); } },
    { id: 'undo', title: 'Undo Last Action', icon: Undo2, action: () => { setIsOpen(false); setQuery(''); undo(); } },
    { id: 'redo', title: 'Redo Action', icon: Redo2, action: () => { setIsOpen(false); setQuery(''); redo(); } },
    { id: 'add-start', title: 'Add Start Node', icon: Plus, action: () => { setIsOpen(false); setQuery(''); addNode('start', { x: 150, y: 150 }); } },
    { id: 'add-task', title: 'Add Task Node', icon: Plus, action: () => { setIsOpen(false); setQuery(''); addNode('task', { x: 150, y: 150 }); } },
    { id: 'add-approval', title: 'Add Approval Node', icon: Plus, action: () => { setIsOpen(false); setQuery(''); addNode('approval', { x: 150, y: 150 }); } },
    { id: 'add-auto', title: 'Add Automated Action', icon: Plus, action: () => { setIsOpen(false); setQuery(''); addNode('automated', { x: 150, y: 150 }); } },
    { id: 'add-end', title: 'Add End Node', icon: Plus, action: () => { setIsOpen(false); setQuery(''); addNode('end', { x: 150, y: 150 }); } },
    { id: 'add-note', title: 'Add Sticky Note', icon: Plus, action: () => { setIsOpen(false); setQuery(''); addNode('note', { x: 150, y: 150 }); } },
  ].filter(c => c.title.toLowerCase().includes(query.toLowerCase()));

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Global shortcut to focus
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        inputRef.current?.focus();
        setIsOpen(true);
      }
    };
    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    e.stopPropagation(); // Prevent React Flow from intercepting keys
    
    if (!isOpen && e.key !== 'Escape') setIsOpen(true);
    
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => (prev + 1) % commands.length);
    }
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => (prev - 1 + commands.length) % commands.length);
    }
    if (e.key === 'Enter') {
      e.preventDefault();
      commands[selectedIndex]?.action();
    }
    if (e.key === 'Escape') {
      setIsOpen(false);
      setQuery('');
      (e.currentTarget as HTMLElement).blur();
    }
  };

  return (
    <div ref={wrapperRef} className="relative w-80 shadow-[0_10px_40px_rgba(0,0,0,0.5)] z-50 rounded-full group">
      <div className={cn(
        "flex items-center px-4 py-2 bg-black/60 backdrop-blur-md rounded-full border transition-all",
        isOpen ? "border-primary/50 ring-4 ring-primary/10" : "border-white/10 hover:border-white/20"
      )}>
        <Search size={14} className={cn("mr-2.5 transition-colors", isOpen ? "text-primary-light" : "text-text-muted group-hover:text-text-main")} />
        <input 
          ref={inputRef}
          value={query}
          onChange={e => { setQuery(e.target.value); setIsOpen(true); setSelectedIndex(0); }}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder="Command search..."
          className="w-full bg-transparent border-none outline-none text-text-main placeholder:text-text-muted/60 text-[13px] font-medium"
        />
        <div className="flex items-center justify-center px-1.5 py-0.5 bg-white/5 rounded border border-white/10 opacity-70 ml-2">
           <Command size={10} />
           <span className="text-[10px] font-mono ml-0.5 font-bold">K</span>
        </div>
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            key="palette-dropdown"
            initial={{ opacity: 0, scale: 0.95, y: -5 }} 
            animate={{ opacity: 1, scale: 1, y: 0 }} 
            exit={{ opacity: 0, scale: 0.95, y: -5 }}
            transition={{ duration: 0.15 }}
            className="absolute top-12 left-0 w-[350px] max-h-56 overflow-y-auto p-1.5 bg-[#111] border border-white/10 rounded-2xl shadow-[0_20px_60px_rgba(0,0,0,0.8)]"
          >
            {commands.length === 0 ? (
              <div className="p-4 text-center text-text-muted text-xs font-medium">No matching tools.</div>
            ) : (
              commands.map((cmd, idx) => (
                <div
                  key={cmd.id}
                  onClick={cmd.action}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer transition-colors",
                    selectedIndex === idx ? "bg-primary text-white shadow-md" : "text-text-muted hover:bg-white/5"
                  )}
                >
                  <cmd.icon size={13} className={selectedIndex === idx ? "text-white" : "text-text-muted/60"} />
                  <span className="text-[12px] font-medium tracking-wide">{cmd.title}</span>
                </div>
              ))
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
