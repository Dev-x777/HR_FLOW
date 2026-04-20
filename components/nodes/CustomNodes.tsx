"use client";

import React, { memo } from 'react';
import { Handle, Position } from '@xyflow/react';
import { PlayCircle, UserMinus, ShieldCheck, Zap, StopCircle, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { NodeData, useWorkflowStore } from '@/store/useWorkflowStore';
import type { NodeTypes } from '@xyflow/react';

interface NodeConfig {
  icon: any;
  accentColor: string; // Tailwind color class for border-top & icon
  label: string;
}

const cfg: Record<string, NodeConfig> = {
  start:     { icon: PlayCircle,  accentColor: '#34d399', label: 'Start' },
  task:      { icon: UserMinus,   accentColor: '#60a5fa', label: 'Task' },
  approval:  { icon: ShieldCheck, accentColor: '#fbbf24', label: 'Approval' },
  automated: { icon: Zap,         accentColor: '#a78bfa', label: 'Automated' },
  end:       { icon: StopCircle,  accentColor: '#f87171', label: 'End' },
};

const BaseNode = ({ id, selected, type, children, title, subtitle }: any) => {
  const c = cfg[type] ?? cfg.task;
  const Icon = c.icon;
  const nodeErrors = useWorkflowStore(state => state.nodeErrors[id]);
  const hasError = nodeErrors && nodeErrors.length > 0;

  return (
    <div
      className={cn(
        "relative min-w-[210px] rounded-lg border bg-panel-bg shadow-md transition-all",
        hasError ? "border-red-500/80 ring-2 ring-red-500/30 -translate-y-0.5" : 
        selected ? "border-primary ring-1 ring-primary/40 -translate-y-0.5" : "border-panel-border hover:border-[#3a3a3a]"
      )}
    >
      {/* Accent top bar */}
      <div className={cn("h-[3px] w-full rounded-t-lg", hasError ? "bg-red-500" : "")} style={{ backgroundColor: hasError ? undefined : c.accentColor }} />

      <div className="px-3.5 py-3">
        <div className="flex items-center justify-between mb-1.5">
          <div className="flex items-center gap-2.5">
            <Icon size={14} style={{ color: hasError ? '#ef4444' : c.accentColor }} />
            <span className={cn("text-xs font-semibold", hasError ? "text-red-400" : "text-text-main")}>{title}</span>
          </div>
          {hasError && (
             <div className="group relative">
               <AlertTriangle size={14} className="text-red-500 cursor-pointer" />
               <div className="absolute hidden group-hover:block bottom-full right-0 mb-2 w-48 p-2 bg-red-950/90 text-red-100 text-[10px] rounded-lg border border-red-500/30 z-50 shadow-xl backdrop-blur-md">
                 <div className="font-semibold mb-1 border-b border-red-500/30 pb-0.5">Errors</div>
                 {nodeErrors.map((err: string, i: number) => <div key={i} className="py-0.5 opacity-90">• {err}</div>)}
               </div>
             </div>
          )}
        </div>
        {subtitle && <p className="text-[11px] text-text-muted line-clamp-2 ml-[22px]">{subtitle}</p>}
        {children}
      </div>
    </div>
  );
};

export const StartNode = memo(({ id, data, selected }: any) => {
  const d = data as NodeData;
  return (
    <>
      <BaseNode id={id} type="start" selected={selected} title={d.title || 'Start'} />
      <Handle type="source" position={Position.Bottom} style={{ background: '#34d399', border: '2px solid rgba(255,255,255,0.15)', width: 14, height: 14 }} />
    </>
  );
});
StartNode.displayName = 'StartNode';

export const TaskNode = memo(({ id, data, selected }: any) => {
  const d = data as NodeData;
  return (
    <>
      <Handle type="target" position={Position.Top} style={{ background: '#60a5fa', border: '2px solid rgba(255,255,255,0.15)', width: 14, height: 14 }} />
      <BaseNode id={id} type="task" selected={selected} title={d.title || 'Task'} subtitle={d.description}>
        {(d.assignee || d.dueDate) && (
          <div className="mt-2 ml-[22px] flex flex-wrap gap-1.5">
            {d.assignee && <span className="text-[10px] bg-white/5 border border-white/8 px-1.5 py-0.5 rounded text-text-muted">@{d.assignee}</span>}
            {d.dueDate && <span className="text-[10px] bg-red-400/8 border border-red-400/15 px-1.5 py-0.5 rounded text-red-400">{d.dueDate}</span>}
          </div>
        )}
      </BaseNode>
      <Handle type="source" position={Position.Bottom} style={{ background: '#60a5fa', border: '2px solid rgba(255,255,255,0.15)', width: 14, height: 14 }} />
    </>
  );
});
TaskNode.displayName = 'TaskNode';

export const ApprovalNode = memo(({ id, data, selected }: any) => {
  const d = data as NodeData;
  return (
    <>
      <Handle type="target" position={Position.Top} style={{ background: '#fbbf24', border: '2px solid rgba(255,255,255,0.15)', width: 14, height: 14 }} />
      <BaseNode id={id} type="approval" selected={selected} title={d.title || 'Approval'}>
        <div className="mt-2 ml-[22px] flex gap-2 text-[10px] text-text-muted">
          <span>{d.role || 'Unassigned'}</span>
          <span className="text-panel-border">·</span>
          <span className="text-[#fbbf24]">{d.threshold || 1} required</span>
        </div>
      </BaseNode>
      <Handle type="source" position={Position.Bottom} style={{ background: '#fbbf24', border: '2px solid rgba(255,255,255,0.15)', width: 14, height: 14 }} />
    </>
  );
});
ApprovalNode.displayName = 'ApprovalNode';

export const AutomatedStepNode = memo(({ id, data, selected }: any) => {
  const d = data as NodeData;
  return (
    <>
      <Handle type="target" position={Position.Top} style={{ background: '#a78bfa', border: '2px solid rgba(255,255,255,0.15)', width: 14, height: 14 }} />
      <BaseNode id={id} type="automated" selected={selected} title={d.title || 'Automated Action'}>
        <div className="mt-1.5 ml-[22px] text-[10px] font-mono text-[#a78bfa]/70">
          {d.actionId || 'No action selected'}
        </div>
      </BaseNode>
      <Handle type="source" position={Position.Bottom} style={{ background: '#a78bfa', border: '2px solid rgba(255,255,255,0.15)', width: 14, height: 14 }} />
    </>
  );
});
AutomatedStepNode.displayName = 'AutomatedStepNode';

export const EndNode = memo(({ id, data, selected }: any) => {
  const d = data as NodeData;
  return (
    <>
      <Handle type="target" position={Position.Top} style={{ background: '#f87171', border: '2px solid rgba(255,255,255,0.15)', width: 14, height: 14 }} />
      <BaseNode id={id} type="end" selected={selected} title={d.title || 'End'} subtitle={d.endMessage || 'Process complete.'} />
    </>
  );
});
EndNode.displayName = 'EndNode';

export const NoteNode = memo(({ id, data, selected }: any) => {
  const d = data as NodeData;
  return (
    <div className={cn(
      "w-48 min-h-[100px] p-3 shadow-md rounded-br-2xl transition-all relative",
      "bg-amber-200/90 text-amber-950 border backdrop-blur-md",
      selected ? "border-amber-500 shadow-xl scale-105 z-50" : "border-amber-400/50"
    )}>
      <div className="absolute bottom-0 right-0 w-3 h-3 bg-amber-400/80 rounded-tl-xl shadow-sm style={{ clipPath: 'polygon(100% 0, 0% 100%, 100% 100%)' }}"></div>
      <div className="font-semibold text-[11px] uppercase tracking-widest opacity-40 mb-1 border-b border-amber-900/10 pb-1">Sticky Note</div>
      {d.description ? (
        <div className="whitespace-pre-wrap leading-relaxed opacity-90 text-[12px] font-medium font-sans">
          {d.description}
        </div>
      ) : (
        <div className="text-[10px] opacity-40 italic mt-2">Empty note...</div>
      )}
    </div>
  );
});
NoteNode.displayName = 'NoteNode';

export const nodeTypes: NodeTypes = {
  start: StartNode,
  task: TaskNode,
  approval: ApprovalNode,
  automated: AutomatedStepNode,
  end: EndNode,
  note: NoteNode,
};
