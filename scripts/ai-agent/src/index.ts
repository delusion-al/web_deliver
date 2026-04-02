import * as dotenv from 'dotenv';
import { createMaintenanceTeam } from './agents';

dotenv.config();

async function runAgentLoop() {
  // Check for the Issue Context passed from GitHub Action runner
  const issueTitle = process.env.ISSUE_TITLE || 'Test Title';
  const issueBody = process.env.ISSUE_BODY || 'Test Body: Cambiar el color primario a red';

  console.log(`Starting AI Maintenance Loop for Issue: ${issueTitle}`);

  // Create the Open Multi-Agent orchestration team
  const team = createMaintenanceTeam();

  const goal = `
A client has submitted a support ticket via their admin dashboard tracking to GitHub.
Title: ${issueTitle}
Description: ${issueBody}

Goal: Please analyze their request, read their current Configuration file, and update the schema to satisfy their needs. 
Important: Verify your fix by compiling the project (runAstroCheck) if possible.
  `.trim();

  try {
    // Run the orchestration topological execution
    const result = await team.run(goal);
    
    console.log('--- AGENT EXECUTION COMPLETE ---');
    console.log(result.finalAnswer);
    
    // Note: If running inside GitHub Action, subsequent steps in the YAML 
    // will detect Git diffs and automatically commit + spawn a Pull Request.

  } catch (error) {
    console.error('Agent Cluster Failed:', error);
    process.exit(1);
  }
}

runAgentLoop();
