import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function testSwarm() {
  console.log('🚀 Invocando Swarm Test...');
  
  // 1. Simular inicio de tarea en el log
  const { error: logError } = await supabase.from('pipeline_logs').insert({
    action: 'swarm_task_started',
    metadata: { task: 'Mantenimiento de prueba: Actualizar paleta de colores', tenant_id: 'SYSTEM-TEST' }
  });
  
  if (logError) console.error('❌ Error en log:', logError);
  else console.log('✅ Log de inicio registrado.');

  // 2. Simular propuesta de aprobación
  const { data: tenant } = await supabase.from('tenants').select('id').limit(1).single();
  
  const { data: approval, error: approvalError } = await supabase.from('swarm_approvals').insert({
    tenant_id: tenant?.id,
    proposed_changes: { 
      task: 'Actualizar paleta de colores a "Cyberpunk Blue"',
      diff: '+ primary: #00f2ff\n- primary: #3b82f6',
      source: 'Gemma 4 Neural Swarm'
    },
    status: 'pending',
    agent_id: 'gemma-4-local'
  }).select().single();

  if (approvalError) console.error('❌ Error en aprobación:', approvalError);
  else console.log('✅ Ticket de aprobación creado:', approval.id);

  console.log('\n--- RESULTADO ---');
  console.log('Vaya a la pestaña "AI Pipeline" en su Dashboard para ver el ticket pendiente.');
}

testSwarm();
