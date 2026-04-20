"use client";

import React, { useCallback, useRef } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  Panel,
  ReactFlowProvider,
  BackgroundVariant,
  SelectionMode
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import { useWorkflowStore, WorkflowNodeType } from '@/store/useWorkflowStore';
import { nodeTypes } from '@/components/nodes/CustomNodes';
import { CommandPalette } from '@/components/panels/CommandPalette';

interface WorkflowCanvasProps {
  onSimulate: () => void;
}

const WorkflowCanvasInner = ({ onSimulate }: WorkflowCanvasProps) => {
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  
  const {
    nodes,
    edges,
    onNodesChange,
    onEdgesChange,
    onConnect,
    addNode,
    setNodes,
    setEdges,
    instantiateTemplate,
    setSelectedNodeId
  } = useWorkflowStore();

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    if (event.dataTransfer.types.includes('Files')) {
      event.dataTransfer.dropEffect = 'copy';
    } else {
      event.dataTransfer.dropEffect = 'move';
    }
  }, []);

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();

      let payload: any;
      
      // Feature: Check if dragging a physical File
      if (event.dataTransfer.files && event.dataTransfer.files.length > 0) {
         const file = event.dataTransfer.files[0];
         if (file.type === "application/json" || file.name.endsWith('.json')) {
            const reader = new FileReader();
            reader.onload = (e) => {
               try {
                  const obj = JSON.parse(e.target?.result as string);
                  if (obj.nodes && obj.edges) {
                     setNodes(obj.nodes);
                     setEdges(obj.edges);
                  } else {
                     alert("Invalid workflow format.");
                  }
               } catch (err) {
                  alert("Failed to parse JSON file.");
               }
            };
            reader.readAsText(file);
         }
         return;
      }

      // Feature: Check if dragging raw JSON text instead of a file
      const plainText = event.dataTransfer.getData('text/plain');
      if (plainText) {
        try {
          const obj = JSON.parse(plainText);
          if (obj.nodes && Array.isArray(obj.nodes) && obj.edges && Array.isArray(obj.edges)) {
            setNodes(obj.nodes);
            setEdges(obj.edges);
            return;
          }
        } catch(err) {
            // Not a valid JSON string or workflow, proceed...
        }
      }

      try {
        payload = JSON.parse(event.dataTransfer.getData('application/reactflow'));
      } catch (e) {
        payload = { type: event.dataTransfer.getData('application/reactflow') };
      }

      if (!reactFlowWrapper.current) return;
      const reactFlowBounds = reactFlowWrapper.current.getBoundingClientRect();

      // Simplistic positioning for mock. With a real reactFlowInstance, we'd use project()
      const position = {
        x: event.clientX - reactFlowBounds.left - 100, // rough offset to center node on mouse
        y: event.clientY - reactFlowBounds.top - 40,
      };

      if (payload?.isTemplate) {
        instantiateTemplate(payload.templateNodes, payload.templateEdges, position);
      } else if (payload?.type) {
        addNode(payload.type as WorkflowNodeType, position, payload?.data);
      }
    },
    [addNode, instantiateTemplate, setEdges, setNodes]
  );

  return (
    <div className="flex-1 h-full w-full relative bg-canvas-bg" ref={reactFlowWrapper}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onInit={() => {}}
        onDrop={onDrop}
        onDragOver={onDragOver}
        onNodeClick={(_, node) => setSelectedNodeId(node.id)}
        onPaneClick={() => setSelectedNodeId(null)}
        nodeTypes={nodeTypes}
        fitView
        connectionRadius={40}
        defaultEdgeOptions={{ type: 'smoothstep', animated: true, style: { strokeWidth: 1.5, stroke: 'rgba(255,255,255,0.4)' } }}
        connectionLineStyle={{ stroke: '#5266F5', strokeWidth: 2 }}
        selectionOnDrag={true}
        selectionMode={SelectionMode.Partial}
        panOnScroll={true}
        panOnDrag={[1, 2]}
        className="touch-none"
      >
        <Background 
          variant={BackgroundVariant.Dots} 
          gap={24} 
          size={1.5} 
          color="rgba(255, 255, 255, 0.08)" 
        />
        
        {/* Custom MiniMap Styling */}
        <MiniMap 
          className="!bg-panel-bg !border-panel-border !shadow-2xl !rounded-xl overflow-hidden glass-panel" 
          maskColor="rgba(0, 0, 0, 0.7)"
          nodeColor={(n) => {
             switch (n.type) {
               case 'start': return '#10B981';
               case 'task': return '#3B82F6';
               case 'approval': return '#F59E0B';
               case 'automated': return '#8B5CF6';
               case 'end': return '#EF4444';
               default: return '#E2E8F0';
             }
          }}
        />
        
        <Controls 
           className="!bg-panel-bg !border-panel-border !shadow-2xl !rounded-xl glass-panel overflow-hidden flex-col gap-0" 
           showInteractive={false}
        />
        
        <Panel position="top-left" className="m-4">
           <div className="bg-black/50 backdrop-blur-md border border-white/10 text-white px-4 py-2 rounded-lg shadow-xl inline-flex flex-col">
              <span className="text-xs font-semibold uppercase tracking-wider text-text-muted">Canvas Status</span>
              <span className="text-sm font-medium">{nodes.length} Nodes &bull; {edges.length} Edges</span>
           </div>
        </Panel>

        <Panel position="top-center" className="mt-8 z-50 overflow-visible pointer-events-auto">
           <CommandPalette onSimulate={onSimulate} />
        </Panel>
      </ReactFlow>
    </div>
  );
};

export const WorkflowCanvas = ({ onSimulate }: WorkflowCanvasProps) => (
  <ReactFlowProvider>
    <WorkflowCanvasInner onSimulate={onSimulate} />
  </ReactFlowProvider>
);
