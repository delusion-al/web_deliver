import { supabase } from '../utils/supabase';
import { GitHubBridge } from '../utils/GitHubBridge';
import * as crypto from 'crypto';

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

    const traceId = crypto.randomUUID();

    try {
      // Fetch Tenant Domain & existing Config for specialization
      const { data: tenantInfo } = await this.db.from('tenants').select('domain_name, github_repo').eq('id', tenantId).single();
      const domainName = tenantInfo?.domain_name || 'Neural Node';
      const repoName = tenantInfo?.github_repo;
      
      let currentSourceContext = '';
      if (this.github && repoName) {
         const existingIndex = await this.github.getRepoFile(repoName, 'src/pages/index.astro');
         if (existingIndex) {
            currentSourceContext = `\n--- EXISTING REPOSITORY CONTEXT (src/pages/index.astro) ---\n${existingIndex.substring(0, 4000)}\n--- END EXISTING CONTEXT ---\n`;
         }
      }

      // Fetch Latent Memory (Previous architectural thoughts and components)
      const { data: previousThoughts } = await this.db
         .from('pipeline_logs')
         .select('metadata')
         .eq('tenant_id', tenantId)
         .eq('action', 'swarm_thinking_process')
         .order('created_at', { ascending: false })
         .limit(3);

      const { data: previousComponents } = await this.db
         .from('neural_components')
         .select('component_name, trace_id')
         .eq('tenant_id', tenantId)
         .order('created_at', { ascending: false })
         .limit(5);

      let latentMemory = '';
      if (previousThoughts && previousThoughts.length > 0) {
         latentMemory += '\n--- PREVIOUS PROJECT STRATEGY (LATENT MEMORY) ---\n';
         latentMemory += previousThoughts.map((t: any, i: number) => `Past Reasoning ${i+1}: ${t.metadata?.content?.substring(0, 500)}`).join('\n');
      }
      if (previousComponents && previousComponents.length > 0) {
         latentMemory += '\n--- PREVIOUSLY INTEGRATED COMPONENTS ---\n';
         latentMemory += previousComponents.map((c: any) => `- ${c.component_name} (Trace: ${c.trace_id?.substring(0,8)})`).join('\n');
      }

      // 0. INITIALIZATION
      await logStep('Manager', `Neural Link Established. Sincronizando con el nodo "${domainName}" [Trace: ${traceId.substring(0,8)}]...`, 'thinking');

      // 1. MANAGER - Analysis
      await logStep('Manager', `Analizando arquitectura actual para ${domainName}. Consultando fuentes cognitivas...`, 'thinking');
      const analysis = await this.invokeModel('gemma:7b', `Analyze this request for optimizing the website structure for ${domainName}. Task: ${task}. Focus on UX/SEO and specialize for their niche.`, tenantId);

      // Dynamic Industry Specialization based on Domain
      const industrySkills: Record<string, string> = {
        'reformas': 'Expert in Construction, Luxury Architecture, and Renovation UI. Focus on Before/After galleries and Trust-building bento grids.',
        'cafe': 'Expert in Gastronomy, Boutique Hospitality, and Gourmet UX. Focus on sensory imagery, elegant typography, and booking-ready layouts.',
        'gym': 'Expert in Fitness, High-Intensity Performance, and Athletic UX. Focus on kinetic energy, vibrant gradients, and membership-conversion grids.',
        'gallery': 'Expert in High-Art, Minimalist Esthetics, and Curated Design. Focus on negative space, premium interactions, and visual storytelling.'
      };

      const specializedSkill = Object.entries(industrySkills).find(([key]) => domainName.toLowerCase().includes(key))?.[1] 
                               || 'Expert in High-Performance Lead Generation and Premium Corporate Branding.';

      // 2. ARCHITECT - High-Fidelity Design
      await logStep('Architect', `Arquitectando sistema de diseño 'Professional Elite' para ${domainName} vía NVIDIA NIM...`, 'acting');
      const plan = await this.invokeModel('nvidia', `
        Create a high-end, PROFESSIONAL structural improvement plan for the domain: ${domainName}. 
        Task context: ${analysis}.
        Specialized Skill Engine: ${specializedSkill}
        ${latentMemory}

        Focus on PREMIUM AESTHETICS and MISSION-CRITICAL BUSINESS LOGIC.
        CRITICAL LATENT LOOP GUIDELINE: Ensure your new plan aligns with the "Previous Project Strategy" but pushes the complexity and professionalism further. 
        - MUST use Bento Grid layouts for feature sections.
        - MUST implement Lucide-React icons for professional representation.
        - MUST define Kinertic Typography and smooth scroll behavior.
        - MUST specify an HSL-tailored color palette for maximum visual 'Wow' factor.
      `, tenantId);

      // 3. CODER - Elite Implementation
      await logStep('Coder', `Generando código Astro/React de alta fidelidad con arquitectura 'Elite' (v7.4) para ${domainName}...`, 'acting');
      const implementation = await this.invokeModel('nvidia', `
        As the Swarm Coder Elite (v7.4), architect a PREMIUM, production-ready specialized website solution for: ${domainName}.
        Your goal is to BEAT human designers. NO MINIMAL UPDATES. NO PLACEHOLDERS.
        
        Follow the DESIGN SPEC strictly:
        ${plan}
        
        ${latentMemory}

        Take into account the following existing repository state to improve upon it (do NOT destroy existing good logic, build upon it). Integrate the new components alongside the existing ones:
        ${currentSourceContext}

        REQUIRED FILES (OUTPUT FULL CODE): 
        1. src/pages/index.astro: Must be a COMPLETE, professional landing page. Use complex Tailwind classes, Bento grids, Glassmorphic cards, and Kinetic animations.
        2. src/layouts/Layout.astro: Must implement a unified aesthetic with the provided brand colors.
        
        OUTPUT FORMAT: A valid JSON object ONLY. NO PROSE.
        { 
          "seo": { "title": "...", "description": "..." }, 
          "brand": { "colors": { "primary": "...", "accent": "..." } }, 
          "pages": [ { "id": "home", "blocks": [...] } ],
          "file_mutations": [
             { "path": "src/pages/index.astro", "content": "--- [FULL ELITE ASTRO CODE WITH BENTO GRIDS & LUCIDE ICONS] ---" },
             { "path": "src/layouts/Layout.astro", "content": "--- [PREMIUM GLOBAL LAYOUT] ---" }
          ],
          "trigger_github_sync": true 
        }
      `, tenantId);

      // 4. REVIEWER - Verification
      await logStep('Reviewer', `Verificando integridad técnica y coherencia visual para ${domainName}...`, 'thinking');
      await new Promise(r => setTimeout(r, 1500));

      // 5. DEPLOYMENT & SYNC
      await logStep('Manager', `Sincronizando mejoras con Supabase Oracle y Repositorio GitHub...`, 'acting');

      try {
        const cleanJson = this.extractJson(implementation);
        if (cleanJson) {
          await this.applyChangesToTenant(tenantId, cleanJson, traceId);
        } else {
          throw new Error('Failed to parse model implementation as JSON');
        }
      } catch (e) {
        console.warn('Fallback to raw update due to error:', e);
        await this.applyChangesToTenant(tenantId, { raw_update: implementation }, traceId);
      }

      await logStep('Manager', `Optimización paralela completada. Cambios persistidos [Trace: ${traceId}].`, 'done');

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
            messages: [
              {
                role: "system",
                content: `You are the ${prompt.split(' ')[0]} of a production-grade AI Swarm. 
                YOUR KNOWLEDGE BASE (REUSABLE TEMPLATES): 
                - AdminPanel: Full dashboard with auth guards.
                - Market: e-commerce with cart and product modals.
                - Events: Event booking and management.
                - Auth: Login/Signup with Google integration.
                Your goal is to build premium, production-ready websites for lead generation.`
              },
              { role: "user", content: prompt }
            ],
            temperature: 0.8,
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

  private async applyChangesToTenant(tenantId: string, changes: any, traceId: string) {
    const { data: tenant } = await this.db.from('tenants').select('github_repo, domain_name').eq('id', tenantId).single();
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

    // 2. Sync to GitHub (Autonomous Provisioning)
    if (this.github) {
      let repoName = tenant?.github_repo;

      // AUTO-PROVISIONING: If no repo, create one!
      if (!repoName || repoName === 'null' || repoName === 'pending_ai_generation') {
        try {
          // Create a clean repo name
          const safeName = tenant?.domain_name?.replace(/[^a-zA-Z0-9]/g, '-') || `neural-node-${tenantId.substring(0, 8)}`;
          console.log(`[SWARM] Provisioning new GitHub Repository: ${safeName}...`);

          // Safety: Never use orchestrator repo
          if (safeName === 'web_deliver') {
             throw new Error('Safety: Cannot provision to main orchestrator repo.');
          }

          repoName = `delusion-al/${safeName}`; // Hardcoded owner for now
          await this.db.from('tenants').update({ github_repo: repoName }).eq('id', tenantId);
        } catch (e) {
          console.error('Repo Auto-Provisioning Failed:', e);
        }
      }

      if (repoName === 'delusion-al/web_deliver') {
         console.error('[SWARM] CRITICAL SAFETY BREACH: Attempted to sync to main repository. Aborting.');
         return;
      }

      if (repoName) {
        console.log(`[SWARM] Syncing neural update (v6.0) to ${repoName}...`);
        try {
          // 1. Sync Config & Base Features
          await this.github.smartSync(repoName, newConfig);
          
          // 2. Apply Custom File Mutations from Coder
          if (changes.file_mutations && Array.isArray(changes.file_mutations)) {
             console.log(`[SWARM] Applying ${changes.file_mutations.length} custom source mutations...`);
             for (const mutation of changes.file_mutations) {
                if (mutation.path && mutation.content) {
                   await this.github.modifyRepoFile(repoName, mutation.path, mutation.content, `🤖 Neural Swarm [Trace: ${traceId.substring(0,8)}]: Source Mutation - ${mutation.path}`);
                   
                   // Store the successful component in the neural_components knowledge base
                   try {
                     await this.db.from('neural_components').insert({
                        trace_id: traceId,
                        tenant_id: tenantId,
                        component_name: mutation.path,
                        source_code: mutation.content,
                        metadata: { domain: tenant?.domain_name }
                     });
                   } catch (dbErr) {
                     console.warn('Failed to log neural component:', dbErr);
                   }
                }
             }
          }
        } catch (e) {
          console.error('GitHub Sync Error:', e);
        }
      }
    }


    await this.db.from('swarm_approvals').update({
      status: 'approved',
      current_status: { status: 'deployed', last_updated: new Date().toISOString() }
    }).eq('tenant_id', tenantId).eq('status', 'pending');
  }
}
