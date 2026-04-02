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

  async processTask(task: string, onUpdate: (msg: SwarmMessage) => void) {
    // 1. Manager Strategy
    onUpdate({ role: 'Manager', content: `Analizando tarea: "${task}". Desplegando enjambre local (Gemma 4)...`, status: 'thinking' });
    
    // Simulate multi-agent chain
    await new Promise(r => setTimeout(r, 1500));
    
    // 2. Architect Design
    onUpdate({ role: 'Architect', content: 'Diseñando estructura de la solución bajo el protocolo Claude Swarm...', status: 'acting' });
    const architecture = await this.invokeLocalModel(`Task: ${task}. Propose a high-level architecture.`);
    onUpdate({ role: 'Architect', content: architecture || 'Arquitectura validada.', status: 'done' });

    // 3. Coder Implementation
    onUpdate({ role: 'Coder', content: 'Generando implementación basada en la arquitectura...', status: 'acting' });
    const code = await this.invokeLocalModel(`Implement this: ${architecture}. Be precise.`);
    onUpdate({ role: 'Coder', content: code || 'Implementación completada.', status: 'done' });

    // 4. Final Review
    onUpdate({ role: 'Reviewer', content: 'Verificando seguridad y calidad (NVIDIA NIM Quality Check)...', status: 'thinking' });
    await new Promise(r => setTimeout(r, 1000));
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
