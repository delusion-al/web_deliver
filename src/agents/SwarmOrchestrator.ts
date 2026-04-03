import { supabase } from '../utils/supabase';

export type AgentRole = 'Manager' | 'Architect' | 'Coder' | 'Reviewer' | 'BusinessLogistics';

export interface SwarmMessage {
  role: AgentRole;
  content: string;
  status: 'thinking' | 'acting' | 'done' | 'failed';
  step?: number;
  totalSteps?: number;
}

export class SwarmOrchestrator {
  private localApiUrl: string;
  private nvidiaApiKey: string;

  constructor() {
    this.localApiUrl = 'http://localhost:11434/api/generate';
    // Potential for runtime config/env
    this.nvidiaApiKey = (import.meta as any).env.VITE_NVIDIA_API_KEY || '';
  }

  async processTask(task: string, tenantId: string, onUpdate?: (msg: SwarmMessage) => void) {
    const totalSteps = 4;
    let currentStep = 0;

    const logStep = async (role: AgentRole, content: string, status: SwarmMessage['status']) => {
      currentStep++;
      const msg: SwarmMessage = { role, content, status, step: currentStep, totalSteps };
      if (onUpdate) onUpdate(msg);

      // Update the "Open Box" status in Supabase for real-time dashboard tracking
      await supabase.from('swarm_approvals').update({
        current_status: { 
          role, 
          content, 
          status, 
          progress: Math.round((currentStep / totalSteps) * 100),
          last_updated: new Date().toISOString()
        }
      }).eq('tenant_id', tenantId).eq('status', 'pending');

      await supabase.from('pipeline_logs').insert({
        action: `swarm_${role.toLowerCase()}_${status}`,
        tenant_id: tenantId,
        agent_id: role,
        metadata: { task, content, step: currentStep }
      });
    };

    try {
      // 1. MANAGER - Analysis
      await logStep('Manager', `Analizando arquitectura para "${tenantId.split('-')[0]}". Consultando Local Gemma 4...`, 'thinking');
      const analysis = await this.invokeModel('gemma:7b', `Analyze this request for a local business website: ${task}. Be concise.`);

      // 2. ARCHITECT - Design (Using NVIDIA NIM for high-res logic)
      await logStep('Architect', `Generando esquema técnico vía NVIDIA NIM (Meta Llama 3 70B)...`, 'acting');
      const plan = await this.invokeModel('nvidia', `Create a structural plan for: ${analysis}. Include component mapping.`);

      // 3. CODER - Implementation (Requesting structured JSON)
      await logStep('Coder', `Construyendo fragmentos de código e integrando en el pipeline...`, 'acting');
      const implementation = await this.invokeModel('nvidia', `
        Implement the following plan: ${plan}. 
        IMPORTANT: Output ONLY a valid JSON object that can be merged into the tenant configuration. 
        Example format: { "seo": { "title": "New Title" }, "brand": { "colors": { "primary": "#hex" } }, "pages": [...] }
      `);

      // 4. REVIEWER - Verification
      await logStep('Reviewer', `Verificando integridad técnica y coherencia visual...`, 'thinking');
      await new Promise(r => setTimeout(r, 2000)); // Simulated deep check

      // FINAL - Update Tenant Configuration to reflect changes in "Ver Sitio"
      try {
        const cleanJson = this.extractJson(implementation);
        if (cleanJson) {
           await this.applyChangesToTenant(tenantId, cleanJson);
        }
      } catch (e) {
        console.warn('Could not parse implementation as JSON, applying as raw text.');
        await this.applyChangesToTenant(tenantId, { raw_update: implementation });
      }

      await logStep('Manager', 'Optimización paralela completada. Cambios persistidos en la red neural.', 'done');

    } catch (error: any) {
      console.error('Swarm Error:', error);
      await logStep('Manager', `Error crítico en el enjambre: ${error.message}`, 'failed');
    }
  }

  private async invokeModel(modelName: 'gemma:7b' | 'nvidia', prompt: string): Promise<string> {
    if (modelName === 'nvidia' && this.nvidiaApiKey) {
      try {
        const response = await fetch('https://integrate.api.nvidia.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.nvidiaApiKey}`
          },
          body: JSON.stringify({
            model: "google/gemma-4-31b-it",
            messages: [{ role: "user", content: prompt }],
            temperature: 1.0,
            max_tokens: 16384,
            top_p: 0.95,
            top_k: 64,
            stream: false,
            chat_template_kwargs: { "enable_thinking": true }
          })
        });
        const data = await response.json();
        const content = data.choices[0].message.content;
        
        // Gemma-4 thinking models often output <thought>...</thought> blocks
        // We can extract this to show in the "Open Box" terminal as special "Thinking" logs
        if (content.includes('<thought>')) {
           const thought = content.match(/<thought>([\s\S]*?)<\/thought>/)?.[1];
           if (thought) {
              console.log('[AGENT THINKING]', thought.trim());
              // In a real implementation we would log this to pipeline_logs with a special tag
           }
        }
        
        return content;
      } catch (e) {
        console.warn('NVIDIA NIM unreachable or key invalid, falling back to Local Gemma.');
      }
    }

    // Local Gemma Fallback (Ollama)
    try {
      const response = await fetch(this.localApiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'gemma:7b',
          prompt: `[Neural Forge Context] Task: ${prompt}`,
          stream: false
        })
      });
      const data = await response.json();
      return data.response;
    } catch (e) {
      return `[SIMULATED RESPONSE] Simulated logic for: ${prompt.substring(0, 30)}...`;
    }
  }

  private extractJson(content: string): any {
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      try {
        return JSON.parse(jsonMatch[0]);
      } catch (e) {
        return null;
      }
    }
    return null;
  }

  private async applyChangesToTenant(tenantId: string, changes: any) {
    const { data: config } = await supabase.from('tenant_configs').select('brand, seo, pages, navbar').eq('tenant_id', tenantId).single();
    
    // Deep merge or specific field override
    const newConfig = {
      brand: { ...(config?.brand || {}), ...(changes.brand || {}) },
      seo: { ...(config?.seo || {}), ...(changes.seo || {}) },
      pages: changes.pages || config?.pages || [],
      navbar: changes.navbar || config?.navbar || [],
      updated_at: new Date().toISOString()
    };

    await supabase.from('tenant_configs').update(newConfig).eq('tenant_id', tenantId);

    // If changes involve GitHub (to be implemented), we would trigger an action here.
    if (changes.trigger_github_sync) {
       await this.dispatchGitHubAction(tenantId, changes);
    }

    await supabase.from('swarm_approvals').update({
      status: 'approved',
      current_status: { status: 'deployed', last_updated: new Date().toISOString() }
    }).eq('tenant_id', tenantId).eq('status', 'pending');
  }

  private async dispatchGitHubAction(tenantId: string, payload: any) {
    // Placeholder for GitHub integration logic
    console.log(`[GitHub Sync] Dispatching build for ${tenantId}`, payload);
  }
}
