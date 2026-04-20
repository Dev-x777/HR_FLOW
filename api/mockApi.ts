// Local mock implementations simulating an API layer

export interface AutomationAction {
  id: string;
  label: string;
  params: string[];
}

export const getAutomations = async (): Promise<AutomationAction[]> => {
  // Simulate network delay
  await new Promise((resolve) => setTimeout(resolve, 500));
  
  return [
    { id: 'send_email', label: 'Send Email', params: ['to', 'subject'] },
    { id: 'generate_doc', label: 'Generate Document', params: ['template', 'recipient'] },
    { id: 'slack_msg', label: 'Send Slack Message', params: ['channel', 'message'] },
    { id: 'create_ticket', label: 'Create Jira Ticket', params: ['project', 'summary', 'description'] }
  ];
};

export const simulateWorkflow = async (workflowJson: any): Promise<{ success: boolean; log: string[] }> => {
  await new Promise((resolve) => setTimeout(resolve, 1000));
  
  const log: string[] = [];
  log.push('Initializing workflow simulation...');
  log.push(`Received graph with ${workflowJson.nodes?.length || 0} nodes and ${workflowJson.edges?.length || 0} edges.`);

  // Very basic simulated execution order checking just for log demonstration
  const startNode = workflowJson.nodes?.find((n: any) => n.type === 'start');
  if (!startNode) {
    log.push('ERROR: No Start Node found. Simulation aborted.');
    return { success: false, log };
  }

  log.push(`Starting at: ${startNode.data?.title || 'Start Node'}`);
  
  // Follow the edges (a simple linear walk for simulation logs)
  let currentNode = startNode;
  let sanityLimit = 20;
  
  while (sanityLimit > 0) {
    sanityLimit--;
    const nextEdge = workflowJson.edges?.find((e: any) => e.source === currentNode.id);
    if (!nextEdge) {
      if (currentNode.type !== 'end') {
        log.push(`WARNING: Node "${currentNode.data?.title}" has no outbound connections, but is not an End Node.`);
      }
      break;
    }
    
    const nextNode = workflowJson.nodes?.find((n: any) => n.id === nextEdge.target);
    if (!nextNode) {
      log.push('ERROR: Edge connects to an unknown node.');
      break;
    }
    
    currentNode = nextNode;
    
    switch (currentNode.type) {
      case 'task':
        log.push(`[TASK] Assigning "${currentNode.data?.title}" to ${currentNode.data?.assignee || 'Unassigned'} (Due: ${currentNode.data?.dueDate || 'None'}).`);
        break;
      case 'approval':
        log.push(`[APPROVAL] Requesting approval from "${currentNode.data?.role}". (Threshold: ${currentNode.data?.threshold})`);
        break;
      case 'automated':
        log.push(`[SYS-ACTION] Triggering automation: ${currentNode.data?.actionId} with params: ${JSON.stringify(currentNode.data?.actionParams || {})}`);
        break;
      case 'end':
        log.push(`[COMPLETED] Workflow reached end. Message: "${currentNode.data?.endMessage}".`);
        break;
      default:
        log.push(`Visited node: ${currentNode.data?.title}`);
    }
  }

  if (sanityLimit === 0) {
    log.push('ERROR: Infinite loop or maximum depth reached in simulation.');
    return { success: false, log };
  }

  log.push('Simulation finished successfully.');
  return { success: true, log };
};
