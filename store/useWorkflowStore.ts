import { create } from 'zustand';
import {
  Connection,
  Edge,
  EdgeChange,
  Node,
  NodeChange,
  addEdge,
  OnNodesChange,
  OnEdgesChange,
  OnConnect,
  applyNodeChanges,
  applyEdgeChanges,
  MarkerType,
} from '@xyflow/react';
import { v4 as uuidv4 } from 'uuid';

export type WorkflowNodeType = 'start' | 'task' | 'approval' | 'automated' | 'end' | 'note';

export type NodeData = {
  title: string;
  description?: string;
  assignee?: string;
  dueDate?: string;
  role?: string;
  threshold?: number;
  actionId?: string;
  actionParams?: Record<string, any>;
  endMessage?: string;
  summaryFlag?: boolean;
  metadata?: Record<string, string>;
  history?: { timestamp: string; changes: Record<string, any> }[];
  [key: string]: any;
};

export type AppNode = Node<NodeData, WorkflowNodeType>;

type HistoryState = { nodes: AppNode[]; edges: Edge[] };

export type WorkflowState = {
  nodes: AppNode[];
  edges: Edge[];
  selectedNodeId: string | null;
  past: HistoryState[];
  future: HistoryState[];
  nodeErrors: Record<string, string[]>;
  workflowErrors: string[];
  isCommandPaletteOpen: boolean;
  onNodesChange: OnNodesChange<AppNode>;
  onEdgesChange: OnEdgesChange;
  onConnect: OnConnect;
  setNodes: (nodes: AppNode[]) => void;
  setEdges: (edges: Edge[]) => void;
  setCommandPaletteOpen: (open: boolean) => void;
  addNode: (type: WorkflowNodeType, position: { x: number; y: number }, initialData?: Partial<NodeData>) => void;
  updateNodeData: (id: string, data: Partial<NodeData>, recordHistory?: boolean) => void;
  deleteNode: (id: string) => void;
  setSelectedNodeId: (id: string | null) => void;
  validateWorkflow: () => { valid: boolean; errors: string[] };
  clearWorkflow: () => void;
  saveState: () => void;
  undo: () => void;
  redo: () => void;
  instantiateTemplate: (tNodes: any[], tEdges: any[], position: { x: number; y: number }) => void;
};

const initialNodes: AppNode[] = [];
const initialEdges: Edge[] = [];

export const useWorkflowStore = create<WorkflowState>((set, get) => ({
  nodes: initialNodes,
  edges: initialEdges,
  selectedNodeId: null,
  past: [],
  future: [],
  nodeErrors: {},
  workflowErrors: [],
  isCommandPaletteOpen: false,

  saveState: () => {
    const { nodes, edges, past } = get();
    // Only save if there's an actual change since last state to prevent redundant saves
    const lastState = past[past.length - 1];
    if (lastState && JSON.stringify(lastState.nodes) === JSON.stringify(nodes) && JSON.stringify(lastState.edges) === JSON.stringify(edges)) {
      return;
    }
    set({
      past: [...past, { nodes: JSON.parse(JSON.stringify(nodes)), edges: JSON.parse(JSON.stringify(edges)) }],
      future: [],
    });
  },

  undo: () => {
    const { past, future, nodes, edges } = get();
    if (past.length === 0) return;
    const previous = past[past.length - 1];
    const newPast = past.slice(0, past.length - 1);
    set({
      nodes: previous.nodes,
      edges: previous.edges,
      past: newPast,
      future: [{ nodes, edges }, ...future]
    });
    get().validateWorkflow(); // Re-trigger validation visually
  },

  redo: () => {
    const { past, future, nodes, edges } = get();
    if (future.length === 0) return;
    const next = future[0];
    const newFuture = future.slice(1);
    set({
      nodes: next.nodes,
      edges: next.edges,
      past: [...past, { nodes, edges }],
      future: newFuture
    });
    get().validateWorkflow();
  },

  onNodesChange: (changes: NodeChange<AppNode>[]) => {
    // We do NOT save state on every continuous drag change (position change), otherwise undo history explodes.
    const isDragStart = changes.some(c => c.type === 'position' && c.dragging);
    const isDragStop = changes.some(c => c.type === 'position' && !c.dragging && c.position);
    
    if (isDragStart) {
      get().saveState();
    }

    set({
      nodes: applyNodeChanges(changes, get().nodes),
    });
    
    if (isDragStop || changes.some(c => c.type === 'remove')) {
      get().validateWorkflow();
    }
  },

  onEdgesChange: (changes: EdgeChange[]) => {
    if (changes.some(c => c.type === 'remove')) {
      get().saveState();
    }
    set({
      edges: applyEdgeChanges(changes, get().edges),
    });
    if (changes.some(c => c.type === 'remove')) {
      get().validateWorkflow();
    }
  },

  onConnect: (connection: Connection) => {
    get().saveState();
    set({
      edges: addEdge({ ...connection, markerEnd: { type: MarkerType.ArrowClosed }, animated: true, type: 'smoothstep' }, get().edges),
    });
    get().validateWorkflow();
  },

  setNodes: (nodes: AppNode[]) => {
    get().saveState();
    set({ nodes });
    get().validateWorkflow();
  },

  setEdges: (edges: Edge[]) => {
    get().saveState();
    set({ edges });
    get().validateWorkflow();
  },

  setCommandPaletteOpen: (open: boolean) => set({ isCommandPaletteOpen: open }),

  addNode: (type: WorkflowNodeType, position: { x: number; y: number }, initialData?: Partial<NodeData>) => {
    get().saveState();
    const id = uuidv4();
    const defaults: Record<WorkflowNodeType, Partial<NodeData>> = {
      start: { title: 'Start Workflow' },
      task: { title: 'Manual Task', description: '', assignee: '' },
      approval: { title: 'Approval Step', role: 'Manager', threshold: 1 },
      automated: { title: 'Automated Action', actionId: '' },
      end: { title: 'End Workflow', endMessage: 'Workflow completed.', summaryFlag: true },
      note: { title: 'Note', description: 'Double click properties to edit note.' },
    };

    const newNode: AppNode = {
      id,
      type,
      position,
      data: { ...(defaults[type] as NodeData), ...initialData, history: [] },
    };

    set({ nodes: [...get().nodes, newNode] });
    get().validateWorkflow();
  },

  instantiateTemplate: (tNodes: any[], tEdges: any[], position: { x: number; y: number }) => {
    get().saveState();
    const idMap: Record<string, string> = {};
    
    // Calculate offets so the template spawns relative to the mouse drop
    const minX = Math.min(...tNodes.map(n => n.position.x));
    const minY = Math.min(...tNodes.map(n => n.position.y));

    const newNodes = tNodes.map(n => {
      const newId = uuidv4();
      idMap[n.id] = newId;
      return {
        ...n,
        id: newId,
        position: {
          x: position.x + (n.position.x - minX),
          y: position.y + (n.position.y - minY),
        },
        data: { ...n.data, history: [] }
      };
    });

    const newEdges = tEdges.map(e => ({
      ...e,
      id: uuidv4(),
      source: idMap[e.source] || e.source,
      target: idMap[e.target] || e.target,
    }));

    set({ 
      nodes: [...get().nodes, ...newNodes],
      edges: [...get().edges, ...newEdges]
    });
    get().validateWorkflow();
  },

  updateNodeData: (id: string, data: Partial<NodeData>, recordHistory = true) => {
    if (recordHistory) get().saveState();
    const timestamp = new Date().toLocaleTimeString();
    
    set({
      nodes: get().nodes.map((node) => {
        if (node.id === id) {
          if (recordHistory) {
            // Log changes in history
            const nodeHistory = node.data.history || [];
            // Copy data to track exactly what changed
            const changes = { ...data };
            const newHistory = [{ timestamp, changes }, ...nodeHistory].slice(0, 10); // Keep last 10 changes
            return { ...node, data: { ...node.data, ...data, history: newHistory } };
          }
          return { ...node, data: { ...node.data, ...data } };
        }
        return node;
      }),
    });
    get().validateWorkflow();
  },

  deleteNode: (id: string) => {
    get().saveState();
    set({
      nodes: get().nodes.filter((node) => node.id !== id),
      edges: get().edges.filter((edge) => edge.source !== id && edge.target !== id),
      selectedNodeId: get().selectedNodeId === id ? null : get().selectedNodeId,
    });
    get().validateWorkflow();
  },

  setSelectedNodeId: (id: string | null) => {
    set({ selectedNodeId: id });
  },

  validateWorkflow: () => {
    const { nodes, edges } = get();
    const errors: string[] = [];
    const nodeErrors: Record<string, string[]> = {};
    
    const addNodeError = (nId: string, err: string) => {
       if (!nodeErrors[nId]) nodeErrors[nId] = [];
       nodeErrors[nId].push(err);
    }
    
    if (nodes.length === 0) {
      set({ nodeErrors: {} });
      return { valid: true, errors: [] };
    }

    const startNodes = nodes.filter(n => n.type === 'start');
    if (startNodes.length === 0) {
      errors.push('Workflow must have at least one Start Node.');
    } else if (startNodes.length > 1) {
      errors.push('Workflow cannot have more than one Start Node.');
      startNodes.forEach(n => addNodeError(n.id, 'Duplicate Start Node'));
    }

    const endNodes = nodes.filter(n => n.type === 'end');
    if (endNodes.length === 0) {
      errors.push('Workflow must have at least one End Node.');
    }

    // Check for disconnected nodes
    if (nodes.length > 1) {
      nodes.forEach(node => {
        const isConnected = edges.some(e => e.source === node.id || e.target === node.id);
        if (!isConnected) {
          errors.push(`Node "${node.data.title}" is disconnected.`);
          addNodeError(node.id, 'Disconnected Node');
        }
      });
    }

    set({ nodeErrors, workflowErrors: errors });

    return {
      valid: errors.length === 0 && Object.keys(nodeErrors).length === 0,
      errors
    };
  },

  clearWorkflow: () => {
    get().saveState();
    set({ nodes: [], edges: [], selectedNodeId: null, nodeErrors: {}, workflowErrors: [] });
  }
}));
