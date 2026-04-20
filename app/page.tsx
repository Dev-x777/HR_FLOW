"use client";

import React, { useState, useRef, useEffect } from 'react';
import { WorkflowCanvas } from '@/components/canvas/WorkflowCanvas';
import { NodeSidebar } from '@/components/sidebar/NodeSidebar';
import { PropertiesPanel } from '@/components/panels/PropertiesPanel';
import { SimulationModal } from '@/components/sandbox/SimulationModal';
import { HelpModal } from '@/components/panels/HelpModal';
import { CommandPalette } from '@/components/panels/CommandPalette';
import { FileDropOverlay } from '@/components/panels/FileDropOverlay';
import { GitBranch, Play, Trash2, Undo2, Redo2, Download, Upload, LayoutDashboard, Search, HelpCircle } from 'lucide-react';
import { useWorkflowStore } from '@/store/useWorkflowStore';
import { getLayoutedNodes } from '@/lib/layout';

export default function HRWorkflowEditor() {
  const [sandboxOpen, setSandboxOpen] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const { 
    clearWorkflow, undo, redo, past, future, 
    nodes, edges, setNodes, setEdges 
  } = useWorkflowStore();

  const handleExport = () => {
    const jsonStr = JSON.stringify({ nodes, edges }, null, 2);
    // Explicitly using the File object forces Safari to respect the .json extension rather than attaching .txt
    const file = new File([jsonStr], `hr-workflow-${Date.now()}.json`, { type: 'application/json' });
    const url = URL.createObjectURL(file);
    const a = document.createElement('a');
    a.href = url;
    a.download = file.name;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const obj = JSON.parse(event.target?.result as string);
        if (obj.nodes && obj.edges) {
          setNodes(obj.nodes);
          setEdges(obj.edges);
        } else {
          alert('Invalid JSON format.');
        }
      } catch (err) {
        alert('Failed to parse JSON.');
      }
    };
    reader.readAsText(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleAutoLayout = () => {
    const layoutedNodes = getLayoutedNodes(nodes, edges);
    setNodes(layoutedNodes);
  };

  // Keyboard shortcuts for Undo/Redo
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
        if (e.shiftKey) redo();
        else undo();
      } else if ((e.ctrlKey || e.metaKey) && e.key === 'y') {
        redo();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [undo, redo]);

  return (
    <div className="flex flex-col h-screen w-full bg-canvas-bg overflow-hidden text-text-main text-sm">

      {/* Header */}
      <header className="h-14 border-b border-panel-border bg-panel-bg flex items-center justify-between px-5 z-20 shrink-0">
        <div className="flex items-center gap-2.5">
          <GitBranch size={18} className="text-primary" />
          <span className="font-semibold text-text-main tracking-tight">HR Workflow</span>
          <span className="text-text-muted text-xs ml-1">/ Designer</span>
        </div>

        <div className="flex items-center gap-2">
          
          <div className="flex items-center gap-1 border-r border-panel-border pr-2 mr-1">
            <button
               onClick={undo}
               disabled={past.length === 0}
               title="Undo (Ctrl+Z)"
               className="p-1.5 rounded-md text-text-muted hover:text-white hover:bg-white/5 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            >
               <Undo2 size={15} />
            </button>
            <button
               onClick={redo}
               disabled={future.length === 0}
               title="Redo (Ctrl+Y)"
               className="p-1.5 rounded-md text-text-muted hover:text-white hover:bg-white/5 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            >
               <Redo2 size={15} />
            </button>
          </div>

          <div className="h-4 w-px bg-panel-border/60 mx-1"></div>

          <button
            onClick={() => setHelpOpen(true)}
            title="Feature Walkthrough"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-md text-text-muted hover:text-white bg-black/20 hover:bg-white/10 border border-white/5 transition-colors text-xs font-medium mr-1"
          >
            <HelpCircle size={13} /> <span className="opacity-80">Help</span>
          </button>

          <button
            onClick={handleAutoLayout}
            title="Auto Layout"
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-text-muted hover:text-white hover:bg-white/5 transition-colors text-xs font-medium"
          >
            <LayoutDashboard size={13} /> Layout
          </button>

          <button
            onClick={handleExport}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-text-muted hover:text-white hover:bg-white/5 transition-colors text-xs font-medium"
          >
            <Download size={13} /> Export
          </button>

          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-text-muted hover:text-white hover:bg-white/5 transition-colors text-xs font-medium"
          >
            <Upload size={13} /> Import
          </button>
          <input type="file" accept=".json,application/json,text/plain" ref={fileInputRef} onChange={handleImport} className="hidden" />

          <button
            onClick={clearWorkflow}
            className="flex items-center gap-1.5 px-2.5 py-1.5 ml-1 rounded-md text-text-muted hover:text-red-400 hover:bg-red-400/8 transition-colors text-xs font-medium"
          >
            <Trash2 size={13} /> Clear
          </button>

          <button
            onClick={() => setSandboxOpen(true)}
            className="flex items-center gap-2 px-3.5 py-1.5 ml-1 rounded-md bg-primary hover:bg-primary-hover text-white font-medium transition-colors text-xs shadow-sm"
          >
            <Play size={13} fill="currentColor" />
            Simulate
          </button>
        </div>
      </header>

      {/* Workspace */}
      <div className="flex-1 flex overflow-hidden">
        <NodeSidebar className="shrink-0" />
        <div className="flex-1 relative">
          <WorkflowCanvas onSimulate={() => setSandboxOpen(true)} />
        </div>
        <PropertiesPanel className="shrink-0" />
      </div>

      <SimulationModal isOpen={sandboxOpen} onClose={() => setSandboxOpen(false)} />
      <HelpModal isOpen={helpOpen} onClose={() => setHelpOpen(false)} />
      <FileDropOverlay />
    </div>
  );
}
