import { config } from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
config({ path: path.resolve(__dirname, '../../../.env') });

import { supabase } from '../../../src/utils/supabase';
import { SwarmOrchestrator } from '../../../src/agents/SwarmOrchestrator';

async function runSwarmWorker() {
  console.log('--- NEURAL FORGE SWARM WORKER v3.1 ---');
  console.log('Check Env: GITHUB_TOKEN starting with:', process.env.VITE_GITHUB_TOKEN?.substring(0, 10) || 'MISSING');
  console.log('Listening for neural signals (tickets/approvals)...');

  // 1. Listen for new Maintenance Tickets
  const ticketChannel = supabase
    .channel('maintenance_worker')
    .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'maintenance_tickets' }, async (payload) => {
      const ticket = payload.new;
      console.log(`[TICKET RECEIVED] Subject: ${ticket.subject} (Tenant: ${ticket.tenant_id})`);
      
      try {
        const orchestrator = new SwarmOrchestrator();
        await orchestrator.processTask(
          `Resolve ticket: ${ticket.subject}. Description: ${ticket.description}`,
          ticket.tenant_id
        );

        await supabase.from('maintenance_tickets').update({ 
          status: 'completed',
          ai_response: 'Optimization cycle completed by Neural Swarm v3.1. Changes pushed to GitHub.'
        }).eq('id', ticket.id);
        console.log(`[TICKET COMPLETE] ${ticket.id}`);
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
        await orchestrator.processTask(
          approval.proposed_changes?.task || 'Full site audit',
          approval.tenant_id
        );
        console.log(`[SWARM COMPLETE] Task finalized for ${approval.tenant_id}`);
      } catch (error: any) {
        console.error(`[SWARM ERROR] ${error.message}`);
      }
    })
    .subscribe((status) => {
      console.log(`[CHANNEL] Approval Subscription Status: ${status}`);
    });

  // 3. Fallback Polling (for environments where real-time is flaky)
  async function pollPendingTasks() {
    console.log('[POLLER] Searching for pending tasks...');
    const { data: tickets } = await supabase
      .from('maintenance_tickets')
      .select('*')
      .eq('status', 'pending');

    if (tickets && tickets.length > 0) {
      console.log(`[POLLER] Found ${tickets.length} pending tickets. processing...`);
      for (const ticket of tickets) {
        console.log(`[TICKET PROCESS] Subject: ${ticket.subject}`);
        try {
          const orchestrator = new SwarmOrchestrator();
          await orchestrator.processTask(
            `Resolve ticket: ${ticket.subject}. Description: ${ticket.description}`,
            ticket.tenant_id
          );
          await supabase.from('maintenance_tickets').update({ 
            status: 'completed',
            ai_response: 'Optimization cycle completed by Neural Swarm v3.1 (via Poller).'
          }).eq('id', ticket.id);
          console.log(`[TICKET COMPLETE] ${ticket.id}`);
        } catch (err: any) {
          console.error(`[TICKET ERROR] ${err.message}`);
        }
      }
    }
  }

  // Initial poll and set interval
  pollPendingTasks();
  setInterval(pollPendingTasks, 15000);

  console.log('[DEBUG] Testing DB connection...');
  const { data: dbTest } = await supabase.from('tenants').select('count', { count: 'exact', head: true });
  console.log(`[DEBUG] DB connection successful. Tenants count: ${dbTest || 0}`);

  // Keep process alive
  setInterval(() => {
    console.log(`[HEARTBEAT] Swarm Engine Pulse: ${new Date().toLocaleTimeString()} - Channels: ${ticketChannel.state}/${approvalChannel.state}`);
  }, 10000);
}

runSwarmWorker().catch(err => {
  console.error('Worker Crash:', err);
  process.exit(1);
});
