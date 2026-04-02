import { serve } from "https://deno.land/std@0.177.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { title, description } = await req.json();

    if (!title || !description) {
      throw new Error('Title and description are required.');
    }

    const githubToken = Deno.env.get('GITHUB_PAT_TOKEN'); // GitHub Personal Access Token stored in Supabase Vault
    const repoOwner = Deno.env.get('GITHUB_REPO_OWNER');  // e.g. "YourAgencyName"
    const repoName = Deno.env.get('GITHUB_REPO_NAME');    // Dynamic or static per project

    if (!githubToken || !repoOwner || !repoName) {
      throw new Error('Server configuration error. Missing GitHub credentials.');
    }

    // Call GitHub REST API to create an issue
    const githubResponse = await fetch(`https://api.github.com/repos/${repoOwner}/${repoName}/issues`, {
      method: 'POST',
      headers: {
        'Accept': 'application/vnd.github.v3+json',
        'Authorization': `token ${githubToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        title: title,
        body: `${description}\n\n*Created via Client Admin Panel System*`,
        labels: ["client-request", "ai-agent-pending"]
      }),
    });

    if (!githubResponse.ok) {
      const errorData = await githubResponse.text();
      console.error("GitHub API Error:", errorData);
      throw new Error('Failed to create GitHub Issue');
    }

    const issueData = await githubResponse.json();

    return new Response(JSON.stringify({ success: true, issueUrl: issueData.html_url }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    });
  }
});
