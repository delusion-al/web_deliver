import { supabase } from '../../../src/utils/supabase';
import { SwarmOrchestrator } from '../../../src/agents/SwarmOrchestrator';

async function runSwarmWorker() {
  console.log('--- NEURAL FORGE SWARM WORKER v3.0 ---');
  console.log('Listening for neural signals (tickets/approvals)...');

  // 1. Listen for new Maintenance Tickets
  supabase
    .channel('maintenance_worker')
    .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'maintenance_tickets' }, async (payload) => {
      const ticket = payload.new;
      console.log(`[TICKET] Recibido: ${ticket.subject} (Tenant: ${ticket.tenant_id})`);
      
      const orchestrator = new SwarmOrchestrator();
      await orchestrator.processTask(
        `Resolve ticket: ${ticket.subject}. Description: ${ticket.description}`,
        ticket.tenant_id
      );

      await supabase.from('maintenance_tickets').update({ 
        status: 'completed',
        ai_response: 'Optimization cycle completed by Neural Swarm.'
      }).eq('id', ticket.id);
    })
    .subscribe();

  // 2. Listen for "Pending" Swarm Approvals (if manually triggered from UI)
  supabase
    .channel('approval_worker')
    .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'swarm_approvals', filter: 'status=eq.pending' }, async (payload) => {
      const approval = payload.new;
      console.log(`[SWARM] Tarea pendiente para: ${approval.tenant_id}`);
      
      const orchestrator = new SwarmOrchestrator();
      await orchestrator.processTask(
        approval.proposed_changes?.task || 'Full site audit',
        approval.tenant_id
      );
    })
    .subscribe();

  // Keep process alive
  setInterval(() => {
    console.log(`[HEARTBEAT] Swarm Engine Pulse: ${new Date().toLocaleTimeString()}`);
  }, 60000);
}

runSwarmWorker().catch(err => {
  console.error('Worker Crash:', err);
  process.exit(1);
});
