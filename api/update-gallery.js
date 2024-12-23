import { Octokit } from '@octokit/rest';

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        // Validate environment variables
        if (!process.env.GITHUB_TOKEN || !process.env.GITHUB_OWNER || !process.env.GITHUB_REPO) {
            throw new Error('Required environment variables are missing');
        }

        // Validate input
        const { html } = req.body;
        if (!html || typeof html !== 'string') {
            return res.status(400).json({ error: 'Invalid HTML content' });
        }

        // Initialize Octokit
        const octokit = new Octokit({
            auth: process.env.GITHUB_TOKEN
        });

        try {
            // Get current file content
            const { data: currentFile } = await octokit.repos.getContent({
                owner: process.env.GITHUB_OWNER,
                repo: process.env.GITHUB_REPO,
                path: 'index.html'
            });

            // Decode content
            const content = Buffer.from(currentFile.content, 'base64').toString();
            
            // Find gallery section and insert new artwork
            const gallerySection = '<div id="gallery-section"';
            const insertPosition = content.indexOf(gallerySection);
            
            if (insertPosition === -1) {
                throw new Error('Gallery section not found in index.html');
            }

            const openingTagEnd = content.indexOf('>', insertPosition) + 1;
            const updatedContent = 
                content.slice(0, openingTagEnd) + 
                '\n                                ' +
                html +
                content.slice(openingTagEnd);

            // Update GitHub file
            await octokit.repos.createOrUpdateFileContents({
                owner: process.env.GITHUB_OWNER,
                repo: process.env.GITHUB_REPO,
                path: 'index.html',
                message: 'Add new artwork',
                content: Buffer.from(updatedContent).toString('base64'),
                sha: currentFile.sha
            });

            return res.status(200).json({ success: true });

        } catch (error) {
            console.error('GitHub API error:', error);
            return res.status(500).json({ 
                error: 'Failed to update gallery',
                details: error.message
            });
        }

    } catch (error) {
        console.error('Server error:', error);
        return res.status(500).json({ 
            error: 'Internal server error',
            details: error.message 
        });
    }
}