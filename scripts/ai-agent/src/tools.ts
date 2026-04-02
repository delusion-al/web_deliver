import { defineTool } from 'open-multi-agent';
import { readFileSync, writeFileSync } from 'fs';
import { execSync } from 'child_process';
import path from 'path';

// Calculate the absolute path to the astro root directory
const PROJECT_ROOT = path.resolve(__dirname, '../../../');

export const readConfigTool = defineTool({
  name: 'readConfigFile',
  description: 'Reads the Astro Tenant JSON Schema.',
  schema: {
    type: 'object',
    properties: {},
  },
  execute: async () => {
    try {
      // For this implementation we are reading the TS file, but you could read a JSON file instead
      const filePaths = [
        path.join(PROJECT_ROOT, 'src/config/tenantConfig.ts'),
        path.join(PROJECT_ROOT, 'src/config/tenantConfig.json')
      ];
      for (const p of filePaths) {
        try {
          return readFileSync(p, 'utf-8');
        } catch(e) { }
      }
      return 'Config file not found in standard paths.';
    } catch (e: any) {
      return `Error: ${e.message}`;
    }
  }
});

export const updateConfigTool = defineTool({
  name: 'updateConfigFile',
  description: 'Overwrites the tenantConfig.ts file with new content',
  schema: {
    type: 'object',
    properties: {
      content: { type: 'string', description: 'The entire new file content for tenantConfig.ts (must be valid Typescript/JSON export)' }
    },
    required: ['content']
  },
  execute: async ({ content }) => {
    try {
      const configPath = path.join(PROJECT_ROOT, 'src/config/tenantConfig.ts');
      writeFileSync(configPath, content, 'utf-8');
      return 'Config updated successfully.';
    } catch (e: any) {
      return `Error: ${e.message}`;
    }
  }
});

export const runAstroCheckTool = defineTool({
  name: 'runAstroCheck',
  description: 'Runs npm run build in the main project to verify Astro compiles correctly.',
  schema: {
    type: 'object',
    properties: {}
  },
  execute: async () => {
    try {
      // NOTE: This requires Node v22+ as mentioned previously.
      const stdout = execSync('npm run build', { cwd: PROJECT_ROOT }).toString();
      return `Build Output:\n${stdout}`;
    } catch (e: any) {
      return `Build Failed:\n${e.stdout?.toString()}\n${e.stderr?.toString()}`;
    }
  }
});
