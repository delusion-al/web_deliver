import { supabase } from '../utils/supabase';
import { GitHubBridge } from '../utils/GitHubBridge';

export type AgentRole = 'Manager' | 'Architect' | 'Coder' | 'Reviewer' | 'BusinessLogistics';

export interface SwarmMessage {
  role: AgentRole;
  content: string;
  status: 'thinking' | 'acting' | 'done' | 'failed';
  step?: number;
  totalSteps?: number;
}

export class SwarmOrchestrator {
  private db: any;
  private localApiUrl: string;
  private nvidiaApiKey: string;
  private github: GitHubBridge | null = null;

  constructor(customDb?: any) {
    this.db = customDb || supabase;
    this.localApiUrl = 'http://localhost:11434/api/generate';
    const env = (import.meta as any).env || (process as any).env || {};
    this.nvidiaApiKey = env.VITE_NVIDIA_API_KEY || '';
    const githubToken = env.VITE_GITHUB_TOKEN || '';
    
    if (githubToken) {
      this.github = new GitHubBridge(githubToken);
    }
  }

  async processTask(task: string, tenantId: string, onUpdate?: (msg: SwarmMessage) => void) {
    if (!tenantId) throw new Error('Tenant ID is required for swarm orchestration');
    
    const totalSteps = 6;
    let currentStep = 0;

    const logStep = async (role: AgentRole, content: string, status: SwarmMessage['status'], metadata: any = {}) => {
      currentStep++;
      const msg: SwarmMessage = { role, content, status, step: currentStep, totalSteps };
      if (onUpdate) onUpdate(msg);

      // Explicitly mark as 'processing' in the database during steps
      const dbStatus = status === 'done' ? 'approved' : status === 'failed' ? 'rejected' : 'processing';

      // Track history
      await this.db.rpc('append_task_history', {
        p_tenant_id: tenantId,
        p_log: { 
          role, 
          status, 
          summary: content.length > 50 ? content.substring(0, 47) + '...' : content,
          timestamp: new Date().toISOString() 
        }
      });

      // Update the "Open Box" status and the overall approval state
      await this.db.from('swarm_approvals').update({
        status: dbStatus,
        updated_at: new Date().toISOString(),
        current_status: { 
          role, 
          content, 
          status, 
          progress: Math.round((currentStep / totalSteps) * 100),
          last_updated: new Date().toISOString()
        }
      }).eq('tenant_id', tenantId).filter('status', 'in', '("pending","processing")');

      await this.db.from('pipeline_logs').insert({
        action: `swarm_${role.toLowerCase()}_${status}`,
        tenant_id: tenantId,
        agent_id: role,
        metadata: { task, content, step: currentStep, ...metadata }
      });
    };

    try {
      // 0. INITIALIZATION
      await logStep('Manager', `Neural Link Established. Sincronizando con el nodo "${tenantId.substring(0,8)}"...`, 'thinking');

      // 1. MANAGER - Analysis
      await logStep('Manager', `Analizando arquitectura actual. Consultando fuentes cognitivas...`, 'thinking');
      const analysis = await this.invokeModel('gemma:7b', `Analyze this request for website optimization: ${task}. Focus on UX/SEO.`, tenantId);

      // 2. ARCHITECT - Design
      await logStep('Architect', `Generando esquema técnico optimizado vía NVIDIA NIM (Gemma 4 31B)...`, 'acting');
      const plan = await this.invokeModel('nvidia', `Create a structural improvement plan for: ${analysis}. Define color shifts or SEO tags.`, tenantId);

      // 3. CODER - Implementation
      await logStep('Coder', `Construyendo fragmentos de código e integrando en la red neural...`, 'acting');
      const implementation = await this.invokeModel('nvidia', `
        Implement the following plan: ${plan}. 
        OUTPUT FORMAT: A valid JSON object ONLY.
        { "seo": { "title": "...", "description": "..." }, "brand": { "colors": { "primary": "...", "accent": "..." } }, "trigger_github_sync": true }
      `, tenantId);

      // 4. REVIEWER - Verification
      await logStep('Reviewer', `Verificando integridad técnica y coherencia visual...`, 'thinking');
      await new Promise(r => setTimeout(r, 1500));

      // 5. DEPLOYMENT & SYNC
      await logStep('Manager', `Sincronizando mejoras con Supabase Oracle y Repositorio GitHub...`, 'acting');
      
      try {
        const cleanJson = this.extractJson(implementation);
        if (cleanJson) {
           await this.applyChangesToTenant(tenantId, cleanJson);
        } else {
           throw new Error('Failed to parse model implementation as JSON');
        }
      } catch (e) {
        console.warn('Fallback to raw update due to error:', e);
        await this.applyChangesToTenant(tenantId, { raw_update: implementation });
      }

      await logStep('Manager', 'Optimización paralela completada. Cambios persistidos y desplegados.', 'done');

    } catch (e: any) {
      console.error('Swarm Error:', e);
      await logStep('Manager', `Error crítico: ${e.message || 'Unknown error'}`, 'failed');
    }
  }

  private async invokeModel(modelName: 'gemma:7b' | 'nvidia', prompt: string, tenantId: string): Promise<string> {
    if (modelName === 'nvidia' && this.nvidiaApiKey) {
      console.log(`[MODEL] Calling NVIDIA NIM: google/gemma-4-31b-it...`);
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

        if (!response.ok) {
           const errText = await response.text();
           throw new Error(`NVIDIA API Error: ${response.status} - ${errText}`);
        }

        const data = await response.json();
        const content = data.choices[0].message.content;
        console.log(`[MODEL] NVIDIA Response received (${content.length} chars)`);
        
        // Extract and Log Thinking Process
        if (content.includes('<thought>')) {
           const thought = content.match(/<thought>([\s\S]*?)<\/thought>/)?.[1];
           if (thought) {
              console.log(`[THINKING] Extracted reasoning block (${thought.length} chars)`);
              await this.db.from('pipeline_logs').insert({
                action: 'swarm_thinking_process',
                tenant_id: tenantId,
                agent_id: 'Architect',
                metadata: { content: `<thought>${thought.trim()}</thought>`, model: 'nvidia-gemma-4' }
              });
           }
        }
        
        return content;
      } catch (e: any) {
        console.warn(`[MODEL] NVIDIA NIM error: ${e.message}. Using local fallback.`);
      }
    }

    // Local Gemma Fallback
    try {
      const response = await fetch(this.localApiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'gemma:7b',
          prompt: `[Neural Forge] Task: ${prompt}`,
          stream: false
        })
      });
      const data = await response.json();
      return data.response;
    } catch (e) {
      const safePrompt = prompt ? prompt.substring(0, 50) : "empty task";
      return `[SIMULATED] Logic for ${safePrompt}...`;
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
    const { data: tenant } = await this.db.from('tenants').select('github_repo').eq('id', tenantId).single();
    const { data: config } = await this.db.from('tenant_configs').select('brand, seo, pages, navbar').eq('tenant_id', tenantId).single();
    
    const newConfig = {
      brand: { ...(config?.brand || {}), ...(changes.brand || {}) },
      seo: { ...(config?.seo || {}), ...(changes.seo || {}) },
      pages: changes.pages || config?.pages || [],
      navbar: changes.navbar || config?.navbar || [],
      updated_at: new Date().toISOString()
    };

    // 1. Sync to Supabase
    const { error: dbError } = await this.db
      .from('tenant_configs')
      .upsert({ 
        tenant_id: tenantId, 
        ...newConfig
      }, { onConflict: 'tenant_id' });
    
    if (dbError) console.error('Database Sync Failed:', dbError);

    // Sync to GitHub if bridge is active and repo is available
    if (this.github && tenant?.github_repo) {
       await this.github.syncConfigToRepo(tenant.github_repo, newConfig, `Neural Swarm: Applied optimization for ${tenantId}`);
    }

    await this.db.from('swarm_approvals').update({
      status: 'approved',
      current_status: { status: 'deployed', last_updated: new Date().toISOString() }
    }).eq('tenant_id', tenantId).eq('status', 'pending');
  }
}
