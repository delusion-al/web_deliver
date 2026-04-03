import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL!;
const supabaseKey = process.env.VITE_SUPABASE_PUBLISHABLE_DEFAULT_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

async function debug() {
  console.log('--- SUPABASE DIAGNOSTIC ---');
  console.log('URL:', supabaseUrl);
  
  const { data: tenants, error: tErr } = await supabase.from('tenants').select('id, domain_name');
  if (tErr) console.error('Tenants Error:', tErr.message);
  else console.log('Tenants found:', tenants?.length || 0, tenants);

  const { data: tickets, error: tkErr } = await supabase.from('maintenance_tickets').select('id, status');
  if (tkErr) console.error('Tickets Error:', tkErr.message);
  else console.log('Tickets found:', tickets?.length || 0, tickets);

  const { data: approvals, error: aErr } = await supabase.from('swarm_approvals').select('id, status');
  if (aErr) console.error('Approvals Error:', aErr.message);
  else console.log('Approvals found:', approvals?.length || 0, approvals);
}

debug();
