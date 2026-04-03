import { Octokit } from '@octokit/rest';

export class GitHubBridge {
  private octokit: Octokit;

  constructor(token: string) {
    this.octokit = new Octokit({ auth: token });
  }

  /**
   * Syncs configuration changes to a tenant's repository.
   * This effectively "deploys" the AI's improvements to the actual site.
   */
  async syncConfigToRepo(repoFullName: string, config: any, message: string = 'Neural Swarm: Autonomous Optimization') {
    if (!repoFullName || !repoFullName.includes('/')) {
      console.warn('[GitHubBridge] Invalid repo name:', repoFullName);
      return;
    }

    const [owner, repo] = repoFullName.split('/');
    const path = 'src/data/config.json'; // Convention for this factory

    try {
      // 1. Get current file (for SHA)
      let sha: string | undefined;
      try {
        const { data: fileData } = await this.octokit.repos.getContent({
          owner,
          repo,
          path,
        });
        if (!Array.isArray(fileData)) {
          sha = fileData.sha;
        }
      } catch (e) {
        // File might not exist yet, that's fine
      }

      // 2. Create/Update file
      await this.octokit.repos.createOrUpdateFileContents({
        owner,
        repo,
        path,
        message,
        content: Buffer.from(JSON.stringify(config, null, 2)).toString('base64'),
        sha,
      });

      console.log(`[GitHubBridge] Successfully synced to ${repoFullName}`);
      
      // 3. Trigger GitHub Action (optional, usually push triggers build automatically)
      // But we can trigger a manual workflow if needed
      /*
      await this.octokit.actions.createWorkflowDispatch({
        owner,
        repo,
        workflow_id: 'deploy.yml',
        ref: 'main'
      });
      */
    } catch (error: any) {
      console.error(`[GitHubBridge] Error syncing to ${repoFullName}:`, error.message);
      throw error;
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
