"use client";

import React, { useState } from 'react';
import { useWorkflowStore } from '@/store/useWorkflowStore';
import { simulateWorkflow } from '@/api/mockApi';
import { Play, X, AlertTriangle, AlertCircle, CheckCircle2, Terminal } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

export const SimulationModal = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => {
  const { nodes, edges, validateWorkflow } = useWorkflowStore();
  
  const [isRunning, setIsRunning] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);
  const [errorStr, setErrorStr] = useState<string | null>(null);

  const handleSimulate = async () => {
    // 1. Local Validation
    const validation = validateWorkflow();
    if (!validation.valid) {
       setErrorStr('Validation Failed! Structural issues detected.');
       setLogs(validation.errors.map(e => `[STRUCTURAL ERROR] ${e}`));
       return;
    }
    
    setErrorStr(null);
    setIsRunning(true);
    setLogs(['Initiating pre-flight sequence...', 'Serializing graph payloads...']);

    // 2. Mock API call
    const payload = { nodes, edges };
    const res = await simulateWorkflow(payload);
    
    setIsRunning(false);
    
    // Animate logs appearing one by one for an elite feel
    setLogs([]);
    let i = 0;
    const interval = setInterval(() => {
      const nextLog = res.log[i];
      if (nextLog !== undefined) {
        setLogs(prev => [...prev, nextLog]);
      }
      i++;
      if (i >= res.log.length) clearInterval(interval);
    }, 200);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <React.Fragment>
          {/* Backdrop */}
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
            onClick={onClose}
          />
          
          {/* Modal */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.95, y: 20 }} 
            animate={{ opacity: 1, scale: 1, y: 0 }} 
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-2xl bg-panel-bg border border-white/10 shadow-2xl rounded-2xl overflow-hidden z-50 flex flex-col max-h-[85vh]"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-5 border-b border-panel-border bg-black/20">
              <div className="flex items-center gap-3">
                 <div className="bg-primary/20 p-2 rounded-lg border border-primary/30">
                    <Terminal size={18} className="text-primary" />
                 </div>
                 <div>
                    <h2 className="text-lg font-bold text-white tracking-tight leading-tight">Test Sandbox</h2>
                    <p className="text-xs text-text-muted">Simulate your HR workflow execution logs</p>
                 </div>
              </div>
              <button onClick={onClose} className="text-text-muted hover:text-white transition-colors bg-white/5 hover:bg-white/10 p-2 rounded flex items-center justify-center">
                 <X size={18} />
              </button>
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-y-auto p-6 bg-canvas-bg/50">
               {errorStr && (
                 <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 flex flex-col gap-2">
                    <div className="flex items-center gap-2 text-red-400 font-semibold">
                      <AlertTriangle size={18} />
                      {errorStr}
                    </div>
                    <ul className="text-sm font-mono text-red-300 space-y-1 list-disc list-inside">
                      {logs.map((L, idx) => <li key={idx} className="break-words">{L.replace('[STRUCTURAL ERROR] ', '')}</li>)}
                    </ul>
                 </div>
               )}
               
               {!errorStr && logs.length > 0 && (
                 <div className="space-y-3 font-mono text-[13px]">
                   Don&apos;t worry &mdash; our simulator doesn&apos;t modify your actual data. It simply runs a logic check on the existing architecture.
                   {logs.map((log, idx) => {
                     if (!log || typeof log !== 'string') return null;
                     
                     let icon = <CheckCircle2 size={14} className="text-primary/70 mt-0.5 shrink-0" />;
                     let logColorStyle = "text-text-main";
                     
                     if (log.includes('ERROR')) {
                       icon = <AlertCircle size={14} className="text-red-400/80 mt-0.5 shrink-0" />;
                       logColorStyle = "text-red-300 bg-red-500/5 px-2 rounded";
                     } else if (log.includes('WARNING')) {
                       icon = <AlertTriangle size={14} className="text-amber-400/80 mt-0.5 shrink-0" />;
                       logColorStyle = "text-amber-300";
                     } else if (log.includes('[SYS-ACTION]')) {
                       logColorStyle = "text-node-auto brightness-110";
                     } else if (log.includes('[TASK]')) {
                       logColorStyle = "text-node-task brightness-110";
                     } else if (log.includes('[APPROVAL]')) {
                       logColorStyle = "text-node-approval brightness-110";
                     } else if (log.includes('[COMPLETED]')) {
                       icon = <Play size={14} className="text-node-start/80 mt-0.5 shrink-0" />;
                       logColorStyle = "text-node-start font-semibold text-sm";
                     }

                     return (
                       <motion.div 
                         initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} 
                         key={idx} 
                         className="flex items-start gap-3 border-l-2 border-white/5 pl-3 py-1"
                       >
                         {icon}
                         <span className={logColorStyle}>{log}</span>
                       </motion.div>
                     );
                   })}
                 </div>
               )}

               {!errorStr && logs.length === 0 && !isRunning && (
                 <div className="h-40 flex flex-col items-center justify-center text-center text-text-muted/60">
                   <Play size={40} className="mb-4 opacity-20" />
                   <p className="text-sm">Click &quot;Run Simulation&quot; to execute the test API <br/> and analyze logs step by step.</p>
                 </div>
               )}
               
               {isRunning && (
                 <div className="h-40 flex flex-col items-center justify-center text-center text-primary/60 animate-pulse">
                   <div className="w-8 h-8 border-2 border-primary/50 border-t-primary rounded-full animate-spin mb-4" />
                   <p className="text-sm font-mono tracking-widest uppercase">Processing...</p>
                 </div>
               )}
            </div>
            
            {/* Footer */}
            <div className="p-4 border-t border-panel-border bg-black/20 flex justify-end">
               <button 
                 onClick={handleSimulate}
                 disabled={isRunning}
                 className="flex items-center gap-2 px-6 py-2.5 rounded-lg bg-primary hover:bg-primary-hover text-white font-medium text-sm transition-colors shadow-[0_0_15px_rgba(82,102,245,0.3)] hover:shadow-[0_0_25px_rgba(82,102,245,0.5)] disabled:opacity-50 disabled:cursor-not-allowed"
               >
                 {isRunning ? 'Running...' : 'Run Simulation'}
                 {!isRunning && <Play size={16} fill="currentColor" />}
               </button>
            </div>
          </motion.div>
        </React.Fragment>
      )}
    </AnimatePresence>
  );
};
