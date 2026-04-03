import { supabase } from '../utils/supabase';

export interface GitHubSyncRequest {
  owner: string;
  repo: string;
  path: string;
  content: string;
  message: string;
  branch?: string;
}

export class GitHubBridge {
  constructor() {}

  async syncTenantConfig(tenantId: string, config: any) {
    const { data: tenant } = await supabase.from('tenants').select('github_repo').eq('id', tenantId).single();
    if (!tenant?.github_repo) {
       console.warn(`[GitHub Bridge] No repo found for tenant ${tenantId}`);
       return;
    }

    const [owner, repo] = tenant.github_repo.split('/');
    
    // In a real factory, we'd use the provided GitHub Token. 
    // Here we'll log it as a dispatch event that our MCP can handle, 
    // or as a direct MCP call if the orchestrator is running in an environment with it.
    
    console.log(`[GitHub Bridge] Syncing config to ${owner}/${repo}...`);
    
    // Construct the file update request
    const syncRequest: GitHubSyncRequest = {
       owner,
       repo,
       path: 'src/config/site.json',
       content: JSON.stringify(config, null, 2),
       message: 'Neural Swarm v3.1: Automated Site Optimization Update',
       branch: 'master'
    };

    // Log the sync event to pipeline_logs for the dashboard to track
    await supabase.from('pipeline_logs').insert({
       action: 'github_sync_dispatched',
       tenant_id: tenantId,
       metadata: syncRequest
    });

    return syncRequest;
  }
}
