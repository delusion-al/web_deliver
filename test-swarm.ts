import { config } from 'dotenv';
import path from 'path';
config();

import { SwarmOrchestrator } from './src/agents/SwarmOrchestrator.js';

async function test() {
  console.log('--- STARTING SWARM PIPELINE TEST ---');
  const tenant_id = 'c8a3c4a7-cf7b-4256-a46e-ab4bd0a7215d'; // Valid tenant from logs
  const task = 'Optimize landing page for high conversion and modern aesthetics. Ensure the design feels premium and state of the art.';
  
  const orchestrator = new SwarmOrchestrator();
  console.log(`Processing task for tenant: ${tenant_id}`);
  
  try {
    await orchestrator.processTask(task, tenant_id);
    console.log('--- TEST COMPLETED SUCCESSFULLY ---');
  } catch (err) {
    console.error('--- TEST FAILED ---');
    console.error(err);
    process.exit(1);
  }
}

test();
