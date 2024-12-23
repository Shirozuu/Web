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

        // Find where to insert new artwork
        const gallerySection = '<div id="gallery-section"';
        const insertPosition = content.indexOf(gallerySection);
        
        if (insertPosition === -1) {
            throw new Error('Gallery section not found');
        }

        // Insert the new artwork HTML
        const openingTagEnd = content.indexOf('>', insertPosition) + 1;
        const updatedContent = 
            content.slice(0, openingTagEnd) + 
            '\n                                ' +
            html +
            content.slice(openingTagEnd);

        // Update file in GitHub
        await octokit.repos.createOrUpdateFileContents({
            owner: process.env.GITHUB_OWNER,
            repo: process.env.GITHUB_REPO,
            path: 'index.html',
            message: `Add new artwork: ${title}`,
            content: Buffer.from(updatedContent).toString('base64'),
            sha: currentFile.sha
        });

        // Trigger Vercel deployment
        const vercelToken = process.env.VERCEL_TOKEN;
        await fetch(`https://api.vercel.com/v1/deployments`, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${vercelToken}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                name: process.env.VERCEL_PROJECT_NAME,
                target: 'production'
            })
        });

        return res.status(200).json({ success: true });
    } catch (error) {
        console.error('Error:', error);
        return res.status(500).json({ error: error.message });
    }
}