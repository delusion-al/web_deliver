import { Octokit } from '@octokit/rest';

export class GitHubBridge {
  private octokit: Octokit;

  constructor(token: string) {
    this.octokit = new Octokit({ auth: token });
  }

  /**
   * Autonomously creates a new repository and bootstraps it with base AI template.
   */
  async createRepo(repoName: string, description: string = 'Neural Node: Autonomous Business Web Instance') {
    const [, repo] = repoName.split('/');
    
    try {
      console.log(`[GitHubBridge] Provisioning repo: ${repo}...`);
      await this.octokit.repos.createForAuthenticatedUser({
        name: repo,
        description,
        auto_init: true, // Create Initial README
      });
      
      // Wait for GH to initialize the repo
      await new Promise(r => setTimeout(r, 2000));
      
      return true;
    } catch (e: any) {
       if (e.status === 422) {
          console.log(`[GitHubBridge] Repo already exists: ${repo}`);
          return true;
       }
       console.error(`[GitHubBridge] Repo creation error:`, e.message);
       throw e;
    }
  }

  /**
   * Syncs configuration and ensures production CI/CD is in place.
   */
  async syncConfigToRepo(repoFullName: string, config: any, message: string = 'Neural Swarm: Autonomous Optimization') {
    if (!repoFullName || !repoFullName.includes('/')) return;
    
    // ENSURE REPO EXISTS FIRST
    await this.createRepo(repoFullName);
    
    const [repoOwner, repoName] = repoFullName.split('/');

    const configPath = 'src/data/config.json';
    const workflowPath = '.github/workflows/deploy.yml';
    const packagePath = 'package.json';

    try {
      // 1. Ensure config.json is updated
      let configSha: string | undefined;
      try {
        const { data } = await this.octokit.repos.getContent({ owner: repoOwner, repo: repoName, path: configPath });
        if (!Array.isArray(data)) configSha = data.sha;
      } catch (e) {}

      await this.octokit.repos.createOrUpdateFileContents({
        owner: repoOwner, repo: repoName, path: configPath, message,
        content: Buffer.from(JSON.stringify(config, null, 2)).toString('base64'),
        sha: configSha,
      });

      // 2. Ensure package.json exists (Base template check)
      try {
         await this.octokit.repos.getContent({ owner: repoOwner, repo: repoName, path: packagePath });
      } catch (e) {
         // Missing package.json -> BOOTSTRAP WHOLE REPO TEMPLATE
         const basePackage = {
            name: repoName,
            type: "module",
            scripts: { "dev": "astro dev", "start": "astro dev", "build": "astro build", "preview": "astro preview" },
            dependencies: { "astro": "^4.0.0", "react": "^18.0.0", "react-dom": "^18.0.0" }
         };
         await this.octokit.repos.createOrUpdateFileContents({
            owner: repoOwner, repo: repoName, path: packagePath, message: '🤖 Neural Swarm: Bootstrapping Node Package',
            content: Buffer.from(JSON.stringify(basePackage, null, 2)).toString('base64'),
         });
      }

      // 3. BOOTSTRAP CI/CD
      try {
        await this.octokit.repos.getContent({ owner: repoOwner, repo: repoName, path: workflowPath });
      } catch (e) {
        // Workflow missing -> AUTO-BOOTSTRAP
        const deployWorkflow = `
name: 🚀 Deploy Neural Node
on:
  push:
    branches: [ "main", "master" ]
permissions:
  contents: read
  pages: write
  id-token: write
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
      - run: npm install
      - run: npm run build
      - uses: actions/upload-pages-artifact@v3
        with:
          path: './dist'
  deploy:
    needs: build
    runs-on: ubuntu-latest
    environment:
      name: github-pages
      url: \${{ steps.deployment.outputs.page_url }}
    steps:
      - id: deployment
        uses: actions/deploy-pages@v4
`.trim();

        await this.octokit.repos.createOrUpdateFileContents({
          owner: repoOwner, repo: repoName, path: workflowPath, 
          message: '🤖 Neural Swarm: Bootstrapping Production CI/CD',
          content: Buffer.from(deployWorkflow).toString('base64'),
        });
      }

      // 4. BOOTSTRAP PRODUCTION FILES (Neural Forge Blueprint v1)
      const isNewRepo = !configSha;
      if (isNewRepo) {
        console.log(`[GitHubBridge] Applying structural blueprint to ${repoName}...`);
        
        await this.modifyRepoFile(repoFullName, 'README.md', `
# 🤖 ${repoName.toUpperCase()}
> Autonomous Web Instance by Neural Forge Swarm

![Deployment Status](https://github.com/${repoOwner}/${repoName}/actions/workflows/deploy.yml/badge.svg)
![Factory Status](https://img.shields.io/badge/Status-Optimized_by_Neural_Swarm-blue)

## 📡 Live Protocol
- **Factory Dashboard:** [delusion-al.github.io/web_deliver](https://delusion-al.github.io/web_deliver)
- **Deployment Hub:** GitHub Pages

---
*Auto-generated & Managed by the Neural Forge Fleet.*
`.trim(), '🤖 Neural Swarm: Establishing Node Documentation');

        await this.modifyRepoFile(repoFullName, 'src/layouts/Layout.astro', `
---
interface Props { title: string; }
const { title } = Astro.props;
import config from '../data/config.json';
const brand = config.brand || {};
---
<!doctype html>
<html lang="es" class="dark bg-slate-950 text-white font-sans">
  <head>
    <meta charset="UTF-8" /><meta name="viewport" content="width=device-width" /><title>{title}</title>
  </head>
  <body><slot /></body>
</html>
`.trim(), '🤖 Neural Swarm: Bootstrapping Global Layout');

        await this.modifyRepoFile(repoFullName, 'src/pages/index.astro', `
---
import Layout from '../layouts/Layout.astro';
import config from '../data/config.json';
const { brand, seo } = config;
---
<Layout title={seo?.title || 'Neural Node'}>
  <main class="min-h-screen flex flex-col items-center justify-center p-8 text-center">
    <div class="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(59,130,246,0.1),transparent)] pointer-events-none"></div>
    <h1 class="text-6xl font-black italic tracking-tighter mb-4 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500 uppercase">
       {brand?.name || 'NODE'}
    </h1>
    <p class="text-slate-400 text-lg max-w-xl italic">"{seo?.description}"</p>
    <div class="mt-12 p-6 border border-white/5 rounded-3xl bg-black/40 backdrop-blur-xl">
       <span class="text-[10px] font-black tracking-widest text-blue-500 uppercase italic">Neural Experience Actived</span>
    </div>
  </main>
</Layout>
`.trim(), '🤖 Neural Swarm: Initializing Cognitive Homepage');
      }

      console.log(`[GitHubBridge] Fully Provisioned ${repoFullName}`);

    } catch (error: any) {
      console.error(`[GitHubBridge] Provisioning Error:`, error.message);
      throw error;
    }
  }

  /**
   * Smart Sync: Detects enabled features in config and pushes required template source files.
   */
  async smartSync(repoFullName: string, config: any) {
    // 1. Base Config Sync
    await this.syncConfigToRepo(repoFullName, config);

    // 2. Feature Detection & Injection
    const pages = config.pages || [];
    const hasMarket = pages.some((p: any) => p.id === 'market' || p.active === true);
    const hasAdmin = pages.some((p: any) => p.id === 'admin' || p.active === true);

    if (hasMarket) {
       console.log(`[GitHubBridge] Injecting Marketplace Engine to ${repoFullName}...`);
       // In a real scenario, we'd read these from the FS. 
       // For this autonomous demo, we inject the 'Bridge' component that connects to the Factory API.
       await this.modifyRepoFile(repoFullName, 'src/components/MarketEngine.tsx', `
import React from 'react';
export const MarketEngine = () => {
  return <div className="p-8 bg-slate-900 rounded-3xl border border-white/5">
    <h2 className="text-2xl font-black italic mb-4">Neural Market v1.0</h2>
    <p className="text-slate-400">Connecting to lead generation node...</p>
  </div>
};
       `.trim(), '🤖 Neural Swarm: Injecting Marketplace Module');
    }

    if (hasAdmin) {
       console.log(`[GitHubBridge] Injecting Admin Protocol to ${repoFullName}...`);
       await this.modifyRepoFile(repoFullName, 'src/components/AdminBridge.tsx', `
import React from 'react';
export const AdminBridge = () => {
  return <div className="p-8 bg-blue-900/20 rounded-3xl border border-blue-500/20">
    <h2 className="text-xl font-black text-blue-400">Node Management Console</h2>
  </div>
};
       `.trim(), '🤖 Neural Swarm: Injecting Admin Protocol');
    }
  }

  /**
   * Directly modifies any file in a repo. This enables agents to edit source code.
   */
  async modifyRepoFile(repoFullName: string, path: string, content: string, message: string) {
    const [owner, repo] = repoFullName.split('/');
    let sha: string | undefined;

    try {
      const { data } = await this.octokit.repos.getContent({ owner, repo, path });
      if (!Array.isArray(data)) sha = data.sha;
    } catch (e) {}

    await this.octokit.repos.createOrUpdateFileContents({
      owner, repo, path, message,
      content: Buffer.from(content).toString('base64'),
      sha
    });
  }

  /**
   * Fetches the content of a file from a repository using Octokit.
   * Returns null if the file doesn't exist.
   */
  async getRepoFile(repoFullName: string, path: string): Promise<string | null> {
    const [owner, repo] = repoFullName.split('/');
    try {
      const { data } = await this.octokit.repos.getContent({ owner, repo, path });
      if (!Array.isArray(data) && data.type === 'file' && data.content) {
        return Buffer.from(data.content, 'base64').toString('utf-8');
      }
      return null;
    } catch (e: any) {
      if (e.status === 404) return null;
      console.error(`[GitHubBridge] Error fetching ${path} from ${repoFullName}:`, e.message);
      return null;
    }
  }

  /**
   * Creates a Pull Request for complex structural changes that need human review.
   */
  async createOptimizationPR(repoFullName: string, files: { path: string, content: string }[], taskTitle: string) {
    const [owner, repo] = repoFullName.split('/');
    const branchName = `swarm-optimize-${Date.now()}`;

    try {
      // Get default branch
      const { data: repoData } = await this.octokit.repos.get({ owner, repo });
      const baseBranch = repoData.default_branch;

      // Get latest commit SHA
      const { data: refData } = await this.octokit.git.getRef({ owner, repo, ref: `heads/${baseBranch}` });
      const lastCommitSha = refData.object.sha;

      // Create new branch
      await this.octokit.git.createRef({
        owner,
        repo,
        ref: `refs/heads/${branchName}`,
        sha: lastCommitSha,
      });

      // Push files
      for (const file of files) {
          let sha: string | undefined;
          try {
            const { data: currentFile } = await this.octokit.repos.getContent({ owner, repo, path: file.path, ref: branchName });
            if (!Array.isArray(currentFile)) sha = currentFile.sha;
          } catch (e) {}

          await this.octokit.repos.createOrUpdateFileContents({
            owner,
            repo,
            path: file.path,
            message: `Neural optimization: ${taskTitle}`,
            content: Buffer.from(file.content).toString('base64'),
            branch: branchName,
            sha
          });
      }

      // Create PR
      const { data: pr } = await this.octokit.pulls.create({
        owner,
        repo,
        title: `🤖 Neural Swarm: ${taskTitle}`,
        head: branchName,
        base: baseBranch,
        body: `### High-Level Cognitive Improvements\nOptimized by Neural Forge Orchestrator (Gemma-4/NVIDIA NIM).\n\n**Task:** ${taskTitle}`,
      });

      console.log(`[GitHubBridge] PR Created: ${pr.html_url}`);
      return pr.html_url;
    } catch (error: any) {
      console.error('[GitHubBridge] PR Error:', error.message);
      throw error;
    }
  }
}
