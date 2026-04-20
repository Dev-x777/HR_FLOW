"use client";

import React from 'react';
import { WorkflowNodeType, NodeData } from '@/store/useWorkflowStore';
import { PlayCircle, UserMinus, ShieldCheck, Zap, StopCircle, FileText, Mail, StickyNote } from 'lucide-react';
import { cn } from '@/lib/utils';

interface NodeSidebarProps {
  className?: string;
}

type NodeOption = {
  type: WorkflowNodeType;
  label: string;
  icon: any;
  color: string;
  desc: string;
  initialData?: Partial<NodeData>;
};

type TemplateOption = {
  isTemplate: true;
  label: string;
  icon: any;
  color: string;
  desc: string;
  templateNodes: any[];
  templateEdges: any[];
};

const nodeOptions: NodeOption[] = [
  { type: 'start',     label: 'Start',     icon: PlayCircle,  color: 'text-node-start',    desc: 'Entry point' },
  { type: 'task',      label: 'Task',      icon: UserMinus,   color: 'text-node-task',     desc: 'Human action' },
  { type: 'approval',  label: 'Approval',  icon: ShieldCheck, color: 'text-node-approval', desc: 'Requires sign-off' },
  { type: 'automated', label: 'Automated', icon: Zap,         color: 'text-node-auto',     desc: 'System-triggered' },
  { type: 'end',       label: 'End',       icon: StopCircle,  color: 'text-node-end',      desc: 'Workflow complete' },
  { type: 'note',      label: 'Sticky Note', icon: StickyNote,  color: 'text-amber-400',     desc: 'Add text annotations' },
];

const templateOptions: TemplateOption[] = [
  { 
    isTemplate: true,
    label: 'Identity Verification', 
    icon: FileText, 
    color: 'text-node-task', 
    desc: 'Full document pipeline',
    templateNodes: [
      { id: 't1-1', type: 'start', position: { x: 0, y: 0 }, data: { title: 'Start Verification' } },
      { id: 't1-2', type: 'task', position: { x: 0, y: 120 }, data: { title: 'Review ID', assignee: 'HR Check', description: 'Review the uploaded identity documents.' } },
      { id: 't1-3', type: 'approval', position: { x: 0, y: 240 }, data: { title: 'Manager Sign-off', role: 'HR Manager', threshold: 1 } },
      { id: 't1-4', type: 'end', position: { x: 0, y: 360 }, data: { title: 'End Verification' } },
    ],
    templateEdges: [
      { id: 'e1-2', source: 't1-1', target: 't1-2' },
      { id: 'e1-3', source: 't1-2', target: 't1-3' },
      { id: 'e1-4', source: 't1-3', target: 't1-4' }
    ]
  },
  { 
    isTemplate: true,
    label: 'New Hire Onboarding', 
    icon: Mail, 
    color: 'text-node-auto', 
    desc: 'Automated welcome flow',
    templateNodes: [
      { id: 't2-1', type: 'start', position: { x: 0, y: 0 }, data: { title: 'Start Onboarding' } },
      { id: 't2-2', type: 'automated', position: { x: 0, y: 120 }, data: { title: 'Send Welcome Email', actionId: 'send_email', actionParams: { to: 'candidate_email', subject: 'Welcome to the team!' } } },
      { id: 't2-3', type: 'task', position: { x: 0, y: 240 }, data: { title: 'IT Setup', assignee: 'IT Support' } },
      { id: 't2-4', type: 'end', position: { x: 0, y: 360 }, data: { title: 'End Onboarding' } },
    ],
    templateEdges: [
      { id: 'e2-1', source: 't2-1', target: 't2-2' },
      { id: 'e2-2', source: 't2-2', target: 't2-3' },
      { id: 'e2-3', source: 't2-3', target: 't2-4' }
    ]
  }
];

export const NodeSidebar: React.FC<NodeSidebarProps> = ({ className }) => {
  const onDragStart = (e: React.DragEvent<HTMLDivElement>, node: NodeOption | TemplateOption) => {
    let payload;
    if ('isTemplate' in node) {
      payload = { 
        isTemplate: true, 
        templateNodes: node.templateNodes, 
        templateEdges: node.templateEdges 
      };
    } else {
      payload = { type: node.type, data: node.initialData };
    }
    e.dataTransfer.setData('application/reactflow', JSON.stringify(payload));
    e.dataTransfer.effectAllowed = 'move';
  };

  const renderSection = (title: string, options: (NodeOption | TemplateOption)[]) => (
    <>
      <div className="px-4 py-3 border-b border-panel-border bg-black/20">
        <p className="text-[11px] font-semibold text-text-muted uppercase tracking-widest">{title}</p>
      </div>
      <div className="p-2 space-y-0.5 border-b border-panel-border">
        {options.map((opt) => (
          <div
            key={opt.label}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-white/5 cursor-grab active:cursor-grabbing transition-colors"
            draggable
            onDragStart={(e) => onDragStart(e, opt)}
          >
            <opt.icon size={15} className={opt.color} />
            <div>
              <p className="text-xs font-medium text-text-main leading-none">{opt.label}</p>
              <p className="text-[10px] text-text-muted mt-0.5">{opt.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </>
  );

  return (
    <div className={cn("w-56 bg-panel-bg border-r border-panel-border flex flex-col z-10", className)}>
      <div className="flex-1 overflow-y-auto">
        {renderSection('Base Nodes', nodeOptions)}
        {renderSection('Templates', templateOptions)}
      </div>
    </div>
  );
};
