import { Octokit } from '@octokit/rest';

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { imageUrl, title, category, socialLink, html } = req.body;

        // Validate required fields
        if (!imageUrl || !title || !category || !html) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        // Initialize Octokit with GitHub token
        const octokit = new Octokit({
            auth: process.env.GITHUB_TOKEN
        });

        // Get current content of index.html
        const { data: currentFile } = await octokit.repos.getContent({
            owner: process.env.GITHUB_OWNER,
            repo: process.env.GITHUB_REPO,
            path: 'index.html'
        });

        // Decode content
        const content = Buffer.from(currentFile.content, 'base64').toString();

        // Find gallery section opening tag
        const gallerySection = '<div id="gallery-section" class="d-grid  grid-lg-3  grid-md-2 dsn-item-filter  dsn-isotope dsn-col v-dark-head"';
        const insertPosition = content.indexOf(gallerySection);

        if (insertPosition === -1) {
            throw new Error('Gallery section not found in index.html');
        }

        // Find where to insert the new artwork
        const openingTagEnd = content.indexOf('>', insertPosition) + 1;
        
        // Insert the new artwork HTML
        const updatedContent = 
            content.slice(0, openingTagEnd) + 
            '\n                                ' +
            html +
            content.slice(openingTagEnd);

        // Update the file in GitHub
        await octokit.repos.createOrUpdateFileContents({
            owner: process.env.GITHUB_OWNER,
            repo: process.env.GITHUB_REPO,
            path: 'index.html',
            message: `Add new artwork: ${title}`,
            content: Buffer.from(updatedContent).toString('base64'),
            sha: currentFile.sha,
            branch: 'main' // Specify the branch
        });

        // Trigger Vercel deployment using the Vercel API
        const vercelToken = process.env.VERCEL_TOKEN;
        const vercelTeamId = process.env.VERCEL_TEAM_ID;
        const vercelProjectId = process.env.VERCEL_PROJECT_ID;

        await fetch(`https://api.vercel.com/v1/deployments`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${vercelToken}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                name: process.env.VERCEL_PROJECT_NAME,
                project: vercelProjectId,
                teamId: vercelTeamId,
                target: 'production',
                gitSource: {
                    type: 'github',
                    ref: 'main'
                }
            })
        });

        return res.status(200).json({
            success: true,
            message: 'Gallery updated successfully and deployment triggered'
        });

    } catch (error) {
        console.error('Error:', error);
        return res.status(500).json({
            error: 'Internal server error',
            message: error.message
        });
    }
}
console.log('GitHub Token:', process.env.GITHUB_TOKEN);
console.log('GitHub Owner:', process.env.GITHUB_OWNER);
console.log('GitHub Repo:', process.env.GITHUB_REPO);