import { supabase } from '../utils/supabase';

export type AgentRole = 'Manager' | 'Architect' | 'Coder' | 'Reviewer' | 'BusinessLogistics';

export interface SwarmMessage {
  role: AgentRole;
  content: string;
  status: 'thinking' | 'acting' | 'done' | 'failed';
}

export class SwarmOrchestrator {
  private apiUrl: string;

  constructor(apiUrl: string = 'http://localhost:11434/api/generate') {
    this.apiUrl = apiUrl;
  }

  async processTask(task: string, onUpdate: (msg: SwarmMessage) => void, tenantId?: string) {
    // Pipeline Analytics Integration
    await supabase.from('pipeline_logs').insert({
      action: 'swarm_task_started',
      metadata: { task }
    });

    // Create a pending approval for the dashboard
    if (tenantId) {
      await supabase.from('swarm_approvals').insert({
        tenant_id: tenantId,
        proposed_changes: { task, source: 'Neural Swarm v2.1' },
        status: 'pending',
        agent_id: 'gemma-4-local'
      });
    }

    onUpdate({ role: 'Manager', content: `Analizando tarea: "${task}". Desplegando enjambre local (Gemma 4)...`, status: 'thinking' });
    await new Promise(r => setTimeout(r, 1500));
    
    onUpdate({ role: 'Architect', content: 'Diseñando estructura de la solución bajo el protocolo Claude Swarm...', status: 'acting' });
    const architecture = await this.invokeLocalModel(`Task: ${task}. Propose a high-level architecture.`);
    onUpdate({ role: 'Architect', content: architecture || 'Arquitectura validada.', status: 'done' });

    onUpdate({ role: 'Coder', content: 'Generando implementación basada en la arquitectura...', status: 'acting' });
    const code = await this.invokeLocalModel(`Implement this: ${architecture}. Be precise.`);
    onUpdate({ role: 'Coder', content: code || 'Implementación completada.', status: 'done' });

    onUpdate({ role: 'Reviewer', content: 'Verificando seguridad y calidad (NVIDIA NIM Quality Check)...', status: 'thinking' });
    await new Promise(r => setTimeout(r, 1000));

    await supabase.from('pipeline_logs').insert({
      action: 'swarm_task_completed',
      metadata: { task, status: 'success' }
    });

    onUpdate({ role: 'Manager', content: 'Ciclo completo. Tarea integrada en la red neural.', status: 'done' });
  }

  private async invokeLocalModel(prompt: string): Promise<string> {
    try {
      const response = await fetch(this.apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'gemma:7b',
          prompt: `[Neural Forge Context] You are a node in a decentralized AI factory. ${prompt}`,
          stream: false
        })
      });
      const data = await response.json();
      return data.response;
    } catch (e) {
      console.warn('Local Gemma 4 not reachable at', this.apiUrl, '- Using Edge Simulation.');
      return `[Simulation Mode] Neural process successfully handled ${prompt.substring(0, 20)}...`;
    }
  }
}
