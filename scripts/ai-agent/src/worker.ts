import { config } from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import WebSocket from 'ws';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
config({ path: path.resolve(__dirname, '../../../.env') });

// Polyfill WebSocket for Supabase Realtime in Node.js
(global as any).WebSocket = WebSocket;

import { supabase } from '../../../src/utils/supabase';
import { SwarmOrchestrator } from '../../../src/agents/SwarmOrchestrator';

async function runSwarmWorker() {
  console.log('--- NEURAL FORGE SWARM WORKER v3.1 ---');
  console.log('Check Env: GITHUB_TOKEN starting with:', process.env.VITE_GITHUB_TOKEN?.substring(0, 10) || 'MISSING');
  console.log('Listening for neural signals (tickets/approvals)...');

  // 0. RESET STUCK TASKS (Self-Heal on Startup)
  console.log('[BOOT] Resetting stuck neural tasks...');
  await supabase.from('maintenance_tickets').update({ status: 'pending' }).eq('status', 'processing');
  await supabase.from('swarm_approvals').update({ status: 'pending' }).eq('status', 'processing');

  // 1. Listen for new Maintenance Tickets

  const ticketChannel = supabase
    .channel('maintenance_worker')
    .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'maintenance_tickets' }, async (payload) => {
      const ticket = payload.new;
      console.log(`[TICKET RECEIVED] Subject: ${ticket.subject} (Tenant: ${ticket.tenant_id})`);
      
      try {
        const orchestrator = new SwarmOrchestrator();
        await orchestrator.triggerEdgeProcess(
          ticket.tenant_id,
          ticket.subject,
          ticket.description
        );

        await supabase.from('maintenance_tickets').update({ 
          status: 'completed',
          ai_response: 'Optimization cycle triggered via Neural Edge Swarm (v7.5). Remote sync in progress.'
        }).eq('id', ticket.id);
        console.log(`[EDGE TRIGGER] ${ticket.id} dispatched to cloud.`);
      } catch (err: any) {

        console.error(`[TICKET ERROR] ${err.message}`);
      }
    })
    .subscribe((status) => {
      console.log(`[CHANNEL] Ticket Subscription Status: ${status}`);
    });

  // 2. Listen for "Pending" Swarm Approvals (if manually triggered from UI)
  const approvalChannel = supabase
    .channel('approval_worker')
    .on('postgres_changes', { 
      event: 'INSERT', 
      schema: 'public', 
      table: 'swarm_approvals',
      filter: 'status=eq.pending' 
    }, async (payload) => {
      const approval = payload.new;
      console.log(`[SWARM SIGNAL] Propagating task for: ${approval.tenant_id}`);
      
      try {
        const orchestrator = new SwarmOrchestrator();
        await orchestrator.triggerEdgeProcess(
          approval.tenant_id,
          approval.proposed_changes?.task || 'Full site audit',
          'Manual UI Approval'
        );
        console.log(`[EDGE TRIGGER] Manual task dispatched for ${approval.tenant_id}`);
      } catch (error: any) {

        console.error(`[SWARM ERROR] ${error.message}`);
      }
    })
    .subscribe((status) => {
      console.log(`[CHANNEL] Approval Subscription Status: ${status}`);
    });

  // 3. Fallback Polling (for environments where real-time is flaky)
  let isProcessing = false;
  async function pollPendingTasks() {
    if (isProcessing) return;
    isProcessing = true;
    
    try {
      const { data: tickets } = await supabase
        .from('maintenance_tickets')
        .select('*')
        .eq('status', 'pending');

      if (tickets && tickets.length > 0) {
        console.log(`[POLLER] Found ${tickets.length} pending tickets. Processing first one...`);
        const ticket = tickets[0];
        
        // Mark as processing immediately
        await supabase.from('maintenance_tickets').update({ status: 'processing' }).eq('id', ticket.id);
        
        console.log(`[TICKET START] Subject: ${ticket.subject}`);
        const orchestrator = new SwarmOrchestrator();
        await orchestrator.triggerEdgeProcess(
          ticket.tenant_id,
          ticket.subject,
          ticket.description
        );
        
        await supabase.from('maintenance_tickets').update({ 
          status: 'completed',
          ai_response: 'Optimization cycle triggered via Neural Edge Swarm (v7.5). Remote sync in progress.'
        }).eq('id', ticket.id);
        console.log(`[EDGE TRIGGER] ${ticket.id} dispatched to cloud.`);
      }

    } catch (e: any) {
      console.error(`[POLLER ERROR] ${e.message}`);
    } finally {
      isProcessing = false;
    }
  }

  // Initial poll and set interval
  pollPendingTasks();
  setInterval(pollPendingTasks, 15000);

  // 4. NEURAL LOOP (Periodic Fleet Audit)
  async function runNeuralAuditor() {
    console.log('[AUDITOR] Scanning fleet for structural integrity...');
    const { data: tenants } = await supabase.from('tenants').select('id, domain_name');
    if (!tenants) return;

    for (const t of tenants) {
      // Trigger a light audit if no recent ticket exists
      const { count } = await supabase.from('maintenance_tickets').select('id', { count: 'exact', head: true }).eq('tenant_id', t.id).eq('status', 'pending');
      
      if (count === 0) {
        console.log(`[AUDITOR] Triggering refinement cycle for: ${t.domain_name} (${t.id})...`);
        await supabase.from('maintenance_tickets').insert({
          tenant_id: t.id,
          subject: 'Neural Integrity & Premium UI Audit',
          description: 'Factory-triggered audit to ensure modern and premium design implementation using latest template library.',
          status: 'pending'
        });
      }
    }
  }

  // Run auditor every 1 hour (simulated shorter for demo if needed)
  runNeuralAuditor();
  setInterval(runNeuralAuditor, 3600000); 

  console.log('[DEBUG] Testing DB connection...');

  const { data: dbTest, count } = await supabase.from('tenants').select('count', { count: 'exact', head: true });
  console.log(`[DEBUG] DB connection successful. Tenants count: ${count || 0}`);

  // Keep process alive
  setInterval(() => {
    console.log(`[HEARTBEAT] Swarm Engine Pulse: ${new Date().toLocaleTimeString()} - Channels: ${ticketChannel.state}/${approvalChannel.state}`);
  }, 10000);
}

runSwarmWorker().catch(err => {
  console.error('Worker Crash:', err);
  process.exit(1);
});
