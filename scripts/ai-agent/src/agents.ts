import { Coordinator } from 'open-multi-agent';
import { readConfigTool, updateConfigTool, runAstroCheckTool } from './tools';

export function createMaintenanceTeam() {
  // We orchestrate the agent cluster using the Coordinator paradigm.
  // We define the team in memory.
  const team = new Coordinator({
    agents: [
      {
        name: 'Planner',
        description: 'Analyzes the client\'s GitHub Issue and breaks it down into modifications for the config schema.',
        systemPrompt: 'You are the Lead Architect. The user will provide a GitHub issue requesting changes to their website. Your job is to define the exact layout or modifications needed in the Astro JSON schema. Delegate actual file writing to the Developer agent.',
        tools: [readConfigTool],
      },
      {
        name: 'Developer',
        description: 'Writes the code based on the Planner\'s instructions and validates it.',
        systemPrompt: 'You are an Expert TypeScript Developer. You implement the schema changes requested by the Planner. You must update tenantConfig.ts accurately without breaking syntax. Once changed, attempt to run the astro check build.',
        tools: [readConfigTool, updateConfigTool, runAstroCheckTool],
      }
    ],
    // The coordinator uses its internal topological task engine
    // to map execution automatically.
    maxIterations: 10,
  });

  return team;
}
