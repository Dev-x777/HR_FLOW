"use client";

import React, { useEffect, useState } from 'react';
import { useWorkflowStore, AppNode, WorkflowNodeType } from '@/store/useWorkflowStore';
import { AutomationAction, getAutomations } from '@/api/mockApi';
import { cn } from '@/lib/utils';
import { Settings, X, PlusCircle, Trash2 } from 'lucide-react';

interface PropertiesPanelProps {
  className?: string;
}

const InputGroup = ({ label, children, required = false }: any) => (
  <div className="flex flex-col gap-1 mb-3.5">
    <label className="text-[11px] font-medium text-text-muted uppercase tracking-wider flex items-center gap-1">
      {label} {required && <span className="text-red-400">*</span>}
    </label>
    {children}
  </div>
);

const inputCls = "w-full bg-[#111] border border-panel-border rounded-md px-2.5 py-1.5 text-sm text-text-main placeholder:text-text-muted/50 focus:outline-none focus:border-primary/60 transition-colors";

const StyledInput = (props: React.InputHTMLAttributes<HTMLInputElement>) => (
  <input {...props} className={cn(inputCls, props.className)} />
);

const StyledTextarea = (props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) => (
  <textarea {...props} rows={3} className={cn(inputCls, "resize-none", props.className)} />
);

const StyledSelect = (props: React.SelectHTMLAttributes<HTMLSelectElement>) => (
  <select {...props} className={cn(inputCls, "appearance-none", props.className)}>
    {props.children}
  </select>
);

export const PropertiesPanel: React.FC<PropertiesPanelProps> = ({ className }) => {
  const { nodes, selectedNodeId, updateNodeData, setSelectedNodeId } = useWorkflowStore();
  const selectedNode = nodes.find(n => n.id === selectedNodeId) as AppNode | undefined;
  
  const [automations, setAutomations] = useState<AutomationAction[]>([]);
  const [loadingAutos, setLoadingAutos] = useState(false);

  useEffect(() => {
    if (selectedNode?.type === 'automated' && automations.length === 0) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setLoadingAutos(true);
      getAutomations().then(res => {
        setAutomations(res);
        setLoadingAutos(false);
      });
    }
  }, [selectedNode?.type, automations.length]);

  if (!selectedNode) {
    return (
      <div className={cn("w-72 bg-panel-bg border-l border-panel-border flex flex-col items-center justify-center p-6 text-center z-10", className)}>
         <Settings size={24} className="text-text-muted/30 mb-3" />
         <p className="text-xs font-medium text-text-muted">No node selected</p>
         <p className="text-[11px] text-text-muted/50 mt-1.5">Click a node to configure it.</p>
      </div>
    );
  }

  const data = selectedNode.data;

  const handleChange = (field: string, value: any, recordHistory = false) => {
    updateNodeData(selectedNode.id, { [field]: value }, recordHistory);
  };

  const handleMetadataChange = (key: string, value: string) => {
    const meta = data.metadata || {};
    handleChange('metadata', { ...meta, [key]: value });
  };

  const removeMetadata = (key: string) => {
     const meta = { ...data.metadata };
     delete meta[key];
     handleChange('metadata', meta);
  };

  const addMetadataField = () => {
    // Generate a pseudo-unique key based on current count to keep it deterministic for the compiler
    const count = Object.keys(data.metadata || {}).length;
    const meta = { ...data.metadata, [`custom_${count + 1}`]: '' };
    handleChange('metadata', meta);
  };


  const renderSpecificFields = () => {
    switch (selectedNode.type) {
      case 'start':
        return (
          <>
            <InputGroup label="Node Title">
              <StyledInput value={data.title} onChange={e => handleChange('title', e.target.value, false)} onBlur={e => handleChange('title', e.target.value, true)} />
            </InputGroup>
            
            <div className="my-6 border-t border-panel-border pt-4">
               <div className="flex items-center justify-between mb-3">
                 <span className="text-xs font-semibold text-text-main">Custom Metadata</span>
                 <button onClick={addMetadataField} className="text-primary hover:text-primary-hover p-1 bg-primary/10 rounded transition-colors"><PlusCircle size={14}/></button>
               </div>
               
               {Object.entries(data.metadata || {}).map(([key, val]) => (
                  <div key={key} className="flex gap-2 mb-2 items-center bg-black/20 p-2 rounded border border-white/5">
                    <StyledInput value={key} onChange={(e) => {
                      const newMeta = {...data.metadata}; delete newMeta[key]; newMeta[e.target.value] = val; handleChange('metadata', newMeta, false);
                    }} onBlur={(e) => {
                      const newMeta = {...data.metadata}; delete newMeta[key]; newMeta[e.target.value] = val; handleChange('metadata', newMeta, true);
                    }} className="flex-1 py-1 px-2 text-xs" placeholder="Key" />
                    <StyledInput value={val as string} onChange={(e) => handleMetadataChange(key, e.target.value)} onBlur={(e) => handleChange('metadata', { ...data.metadata, [key]: e.target.value }, true)} className="flex-1 py-1 px-2 text-xs" placeholder="Value" />
                    <button onClick={() => removeMetadata(key)} className="text-red-400 p-1 hover:bg-red-400/20 rounded transition-colors"><Trash2 size={14}/></button>
                  </div>
               ))}
            </div>
          </>
        );

      case 'task':
        return (
          <>
            <InputGroup label="Task Title" required>
              <StyledInput value={data.title} onChange={e => handleChange('title', e.target.value, false)} onBlur={e => handleChange('title', e.target.value, true)} placeholder="e.g. Upload ID Proof" required />
            </InputGroup>
            <InputGroup label="Description">
              <StyledTextarea value={data.description || ''} onChange={e => handleChange('description', e.target.value, false)} onBlur={e => handleChange('description', e.target.value, true)} placeholder="Detailed instructions..." />
            </InputGroup>
            <InputGroup label="Assignee">
              <StyledInput value={data.assignee || ''} onChange={e => handleChange('assignee', e.target.value, false)} onBlur={e => handleChange('assignee', e.target.value, true)} placeholder="Role or User ID (e.g. employee)" />
            </InputGroup>
            <InputGroup label="Due Date">
              <StyledInput type="date" value={data.dueDate || ''} onChange={e => handleChange('dueDate', e.target.value, false)} onBlur={e => handleChange('dueDate', e.target.value, true)} />
            </InputGroup>
          </>
        );

      case 'approval':
        return (
          <>
            <InputGroup label="Approval Title">
              <StyledInput value={data.title} onChange={e => handleChange('title', e.target.value, false)} onBlur={e => handleChange('title', e.target.value, true)} />
            </InputGroup>
            <InputGroup label="Approver Role">
              <StyledInput value={data.role || ''} onChange={e => handleChange('role', e.target.value, false)} onBlur={e => handleChange('role', e.target.value, true)} placeholder="e.g. Manager, HRBP, Director" />
            </InputGroup>
            <InputGroup label="Auto-Approve Threshold">
               <div className="flex items-center gap-2">
                  <input 
                    type="range" min="1" max="5" 
                    value={data.threshold || 1} 
                    onChange={e => handleChange('threshold', parseInt(e.target.value), false)}
                    onMouseUp={e => handleChange('threshold', parseInt((e.target as HTMLInputElement).value), true)}
                    className="w-full accent-primary"
                  />
                  <span className="text-text-main font-mono text-sm w-4">{data.threshold || 1}</span>
               </div>
            </InputGroup>
          </>
        );

      case 'automated':
        const selectedAction = automations.find(a => a.id === data.actionId);
        return (
          <>
            <InputGroup label="Action Title">
              <StyledInput value={data.title} onChange={e => handleChange('title', e.target.value, false)} onBlur={e => handleChange('title', e.target.value, true)} />
            </InputGroup>
            <InputGroup label="System Action">
              {loadingAutos ? (
                <div className="text-xs text-text-muted animate-pulse py-2">Fetching available integrations...</div>
              ) : (
                <StyledSelect 
                  value={data.actionId || ''} 
                  onChange={e => {
                    handleChange('actionId', e.target.value, true);
                    handleChange('actionParams', {}, true); // Reset params on action change
                  }}
                >
                  <option value="" disabled>Select an action...</option>
                  {automations.map(a => <option key={a.id} value={a.id}>{a.label}</option>)}
                </StyledSelect>
              )}
            </InputGroup>

            {selectedAction && selectedAction.params.length > 0 && (
              <div className="mt-4 p-4 rounded-lg bg-black/20 border border-white/5 space-y-3 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-1 h-full bg-node-auto"></div>
                <h4 className="text-xs font-semibold text-node-auto uppercase tracking-wide mb-2">Action Parameters</h4>
                
                {selectedAction.params.map(param => (
                   <InputGroup label={param} key={param}>
                      <StyledInput 
                        className="py-1.5 text-xs bg-black/50" 
                        placeholder={`Configure ${param}...`}
                        value={data.actionParams?.[param] || ''}
                        onChange={e => handleChange('actionParams', { ...(data.actionParams || {}), [param]: e.target.value }, false)}
                        onBlur={e => handleChange('actionParams', { ...(data.actionParams || {}), [param]: e.target.value }, true)}
                      />
                   </InputGroup>
                ))}
              </div>
            )}
          </>
        );

      case 'end':
        return (
          <>
            <InputGroup label="Node Title">
              <StyledInput value={data.title} onChange={e => handleChange('title', e.target.value, false)} onBlur={e => handleChange('title', e.target.value, true)} />
            </InputGroup>
            <InputGroup label="End Message">
              <StyledTextarea value={data.endMessage || ''} onChange={e => handleChange('endMessage', e.target.value, false)} onBlur={e => handleChange('endMessage', e.target.value, true)} />
            </InputGroup>
            <label className="flex items-center gap-3 cursor-pointer mt-4 p-3 bg-black/20 rounded-lg border border-white/5 hover:bg-black/30 transition-colors">
               <input 
                 type="checkbox" 
                 checked={data.summaryFlag || false} 
                 onChange={e => handleChange('summaryFlag', e.target.checked, true)}
                 className="w-4 h-4 rounded text-primary focus:ring-primary accent-primary" 
               />
               <span className="text-sm font-medium text-text-main">Generate Summary Report flag</span>
            </label>
          </>
        );
      
      case 'note':
        return (
          <>
            <InputGroup label="Note Content">
              <StyledTextarea rows={6} value={data.description || ''} onChange={e => handleChange('description', e.target.value, false)} onBlur={e => handleChange('description', e.target.value, true)} placeholder="Type markdown or details here..." />
            </InputGroup>
          </>
        );

      default:
        return <div className="text-sm text-text-muted p-4">Unknown node type selected.</div>;
    }
  };

  return (
    <div className={cn("w-72 bg-panel-bg border-l border-panel-border flex flex-col z-10", className)}>
      <div className="flex items-center justify-between px-4 py-3 border-b border-panel-border">
        <p className="text-[11px] font-semibold text-text-muted uppercase tracking-widest">Properties</p>
        <button onClick={() => setSelectedNodeId(null)} className="text-text-muted hover:text-text-main p-1 rounded hover:bg-white/5 transition-colors">
          <X size={14} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 pb-10">
        {renderSpecificFields()}

        <div className="mt-8 pt-4 border-t border-panel-border">
          <p className="text-[11px] font-semibold text-text-muted uppercase tracking-widest mb-3">Version History</p>
          {!data.history || data.history.length === 0 ? (
            <p className="text-xs text-text-muted/50 italic">No recent changes.</p>
          ) : (
            <div className="space-y-2">
              {data.history.map((h: any, i: number) => (
                <div key={i} className="bg-black/20 p-2 rounded border border-white/5 flex flex-col gap-1 text-xs">
                   <div className="text-text-muted/60 font-mono text-[10px]">{h.timestamp}</div>
                   <div className="text-text-main">
                      {Object.entries(h.changes).map(([k, v]) => (
                        <span key={k} className="mr-2 inline-block"><span className="text-primary/70">{k}:</span> {typeof v === 'object' ? JSON.stringify(v) : String(v)}</span>
                      ))}
                   </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
