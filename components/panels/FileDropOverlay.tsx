"use client";

import React, { useEffect, useState } from 'react';
import { useWorkflowStore } from '@/store/useWorkflowStore';
import { UploadCloud } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const FileDropOverlay = () => {
  const [isDragging, setIsDragging] = useState(false);
  const { setNodes, setEdges } = useWorkflowStore();

  useEffect(() => {
    let dragCounter = 0;

    const isFileOrTextDrop = (e: DragEvent) => {
      // Ignore internal React Flow template dragging
      if (e.dataTransfer?.types.includes('application/reactflow')) return false;
      return e.dataTransfer?.types.includes('Files') || e.dataTransfer?.types.includes('text/plain');
    };

    const handleDragEnter = (e: DragEvent) => {
      if (!isFileOrTextDrop(e)) return;
      e.preventDefault();
      dragCounter++;
      setIsDragging(true);
    };

    const handleDragLeave = (e: DragEvent) => {
      if (!isFileOrTextDrop(e)) return;
      e.preventDefault();
      dragCounter--;
      if (dragCounter === 0) {
        setIsDragging(false);
      }
    };

    const handleDragOver = (e: DragEvent) => {
      if (!isFileOrTextDrop(e)) return;
      e.preventDefault();
      if (e.dataTransfer) {
        e.dataTransfer.dropEffect = 'copy';
      }
    };

    const handleDrop = (e: DragEvent) => {
      if (!isFileOrTextDrop(e)) return;
      e.preventDefault();
      dragCounter = 0;
      setIsDragging(false);
      
      const processJSON = (jsonString: string) => {
        try {
          const obj = JSON.parse(jsonString);
          if (obj.nodes && Array.isArray(obj.nodes) && obj.edges && Array.isArray(obj.edges)) {
            setNodes(obj.nodes);
            setEdges(obj.edges);
          } else {
            alert("Invalid workflow structure: Missing 'nodes' or 'edges' array.");
          }
        } catch (err) {
          // Fail silently if they just dropped useless text
        }
      };

      if (e.dataTransfer?.files && e.dataTransfer.files.length > 0) {
        const file = e.dataTransfer.files[0];
        if (file.type === "application/json" || file.name.endsWith('.json')) {
          const reader = new FileReader();
          reader.onload = (event) => processJSON(event.target?.result as string);
          reader.readAsText(file);
          return;
        }
      } 
      
      const plainText = e.dataTransfer?.getData('text/plain');
      if (plainText) {
        processJSON(plainText);
      }
    };

    window.addEventListener('dragenter', handleDragEnter);
    window.addEventListener('dragleave', handleDragLeave);
    window.addEventListener('dragover', handleDragOver);
    window.addEventListener('drop', handleDrop);

    return () => {
      window.removeEventListener('dragenter', handleDragEnter);
      window.removeEventListener('dragleave', handleDragLeave);
      window.removeEventListener('dragover', handleDragOver);
      window.removeEventListener('drop', handleDrop);
    };
  }, [setNodes, setEdges]);

  return (
    <AnimatePresence>
      {isDragging && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[999] bg-black/60 backdrop-blur-md flex items-center justify-center p-8 pointer-events-none transition-colors"
        >
           <motion.div 
              initial={{ scale: 0.95, opacity: 0, y: 15 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 15 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
              className="bg-[#111] shadow-2xl w-full max-w-2xl h-[40vh] min-h-[300px] rounded-[32px] flex flex-col items-center justify-center border-2 border-dashed border-primary/50 relative overflow-hidden ring-[12px] ring-black/40"
           >
              {/* Decorative radial gradient glow */}
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(82,102,245,0.15),transparent_60%)] pointer-events-none" />
              
              <div className="bg-primary/20 p-5 rounded-full mb-6 ring-[10px] ring-primary/5 z-10 glass-panel border border-primary/30">
                <UploadCloud size={46} className="text-primary/90 animate-bounce" style={{ animationDuration: '2s' }} />
              </div>
              
              <h2 className="text-[28px] font-bold text-white tracking-tight mb-3 z-10 drop-shadow-sm">Upload Workflow Config</h2>
              
              <p className="text-text-muted text-[15px] font-medium tracking-wide z-10 text-center max-w-sm leading-relaxed">
                 Drop your exported <span className="text-primary-light font-mono text-[13px] px-1.5 py-0.5 bg-primary/10 rounded-md border border-primary/20 shadow-sm mx-0.5">.json</span> file anywhere to instantly generate the visual architecture.
              </p>
           </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
