import { Octokit } from '@octokit/rest';

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        // Validate environment variables
        if (!process.env.GITHUB_TOKEN) {
            throw new Error('GitHub token is missing');
        }

        const { imageUrl, title, category, socialLink, html } = req.body;

        // Validate required fields
        if (!imageUrl || !title || !category) {
            return res.status(400).json({ error: 'Missing required fields' });
        }

        // Initialize Octokit
        const octokit = new Octokit({
            auth: process.env.GITHUB_TOKEN
        });

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
            message: `Add new artwork: ${title}`,
            content: Buffer.from(updatedContent).toString('base64'),
            sha: currentFile.sha
        });

        return res.status(200).json({ success: true });
    } catch (error) {
        console.error('Error:', error);
        return res.status(500).json({ error: error.message });
    }
}