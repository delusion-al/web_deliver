import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.0";
import { Octokit } from "https://esm.sh/@octokit/rest@20.0.2";

// --- MINIMAL INLINE PORT OF RELEVANT LOGIC ---
// Since the edge function environment is different, we'll implement a clean version here.

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const NVIDIA_API_KEY = Deno.env.get("NVIDIA_API_KEY")!;
const GITHUB_TOKEN = Deno.env.get("GITHUB_TOKEN")!;

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
const octokit = new Octokit({ auth: GITHUB_TOKEN });

Deno.serve(async (req) => {
  try {
    const { tenant_id, task_subject, task_description } = await req.json();

    if (!tenant_id) {
      return new Response(JSON.stringify({ error: "Missing tenant_id" }), { status: 400 });
    }

    console.log(`[SWARM] Processing Task for Tenant: ${tenant_id}`);
    
    // 1. Fetch Tenant Context
    const { data: tenant } = await supabase.from('tenants').select('*').eq('id', tenant_id).single();
    if (!tenant) throw new Error("Tenant not found");

    const domainName = tenant.domain_name || "Neural Node";
    const repoName = tenant.github_repo;

    // 2. Initialize Trace
    const traceId = crypto.randomUUID();
    
    const logStep = async (role: string, content: string, status: string) => {
       await supabase.from('pipeline_logs').insert({
          action: `swarm_${role.toLowerCase()}_${status}`,
          tenant_id,
          agent_id: role,
          metadata: { content, trace_id: traceId }
       });
    };

    await logStep("Manager", `Neural Edge Link Established for ${domainName}`, "thinking");

    // 3. AI Inference (Simplified for Edge)
    const prompt = `
      As the Swarm Coder Elite (v7.5-Edge), architect a PREMIUM website solution for: ${domainName}.
      Task: ${task_subject} - ${task_description}
      
      OUTPUT FORMAT: A valid JSON object ONLY.
      { 
        "file_mutations": [
           { "path": "src/pages/index.astro", "content": "--- [FULL ELITE ASTRO CODE] ---" }
        ]
      }
    `;

    const nvidiaRes = await fetch('https://integrate.api.nvidia.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${NVIDIA_API_KEY}`
      },
      body: JSON.stringify({
        model: "google/gemma-4-31b-it",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.7,
        max_tokens: 4096
      })
    });

    const aiData = await nvidiaRes.json();
    const content = aiData.choices[0].message.content;
    const jsonMatch = content.match(/\{[\s\S]*\}/);
    const changes = jsonMatch ? JSON.parse(jsonMatch[0]) : null;

    if (changes && repoName && repoName !== 'null') {
      const [owner, repo] = repoName.split('/');
      
      for (const mutation of changes.file_mutations) {
        console.log(`[EDGE] Syncing ${mutation.path} to ${repoName}`);
        
        // Get SHA if exists
        let sha;
        try {
          const { data } = await octokit.repos.getContent({ owner, repo, path: mutation.path });
          if (!Array.isArray(data)) sha = data.sha;
        } catch (e) {}

        await octokit.repos.createOrUpdateFileContents({
          owner, repo, path: mutation.path,
          message: `🤖 Neural Edge [Trace: ${traceId.substring(0,8)}]: Sync`,
          content: btoa(mutation.content),
          sha
        });
      }
    }

    await logStep("Manager", "Edge Optimization Cycle Complete", "done");

    return new Response(JSON.stringify({ status: "success", trace_id: traceId }), {
      headers: { "Content-Type": "application/json" }
    });

  } catch (err) {
    console.error(err);
    return new Response(JSON.stringify({ error: err.message }), { status: 500 });
  }
});
