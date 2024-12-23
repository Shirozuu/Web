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

        // Validate environment variables
        if (!process.env.GITHUB_TOKEN || !process.env.GITHUB_OWNER || !process.env.GITHUB_REPO) {
            throw new Error('Missing GitHub configuration');
        }

        // Initialize Octokit with your GitHub token
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

        // Find gallery section and insert new artwork
        const gallerySection = '<div id="gallery-section" class="d-grid  grid-lg-3  grid-md-2 dsn-item-filter  dsn-isotope dsn-col v-dark-head"';
        const insertPosition = content.indexOf(gallerySection);
        
        if (insertPosition === -1) {
            throw new Error('Gallery section not found in index.html');
        }

        // Insert the new artwork HTML
        const updatedContent = content.slice(0, insertPosition + gallerySection.length) + 
            '>\n' + html + '\n' + 
            content.slice(insertPosition + gallerySection.length);

        // Update the file in GitHub
        await octokit.repos.createOrUpdateFileContents({
            owner: process.env.GITHUB_OWNER,
            repo: process.env.GITHUB_REPO,
            path: 'index.html',
            message: `Add new artwork: ${title}`,
            content: Buffer.from(updatedContent).toString('base64'),
            sha: currentFile.sha
        });

        return res.status(200).json({
            success: true,
            message: 'Gallery updated successfully'
        });

    } catch (error) {
        console.error('Error:', error);
        return res.status(500).json({
            error: 'Internal server error',
            message: error.message
        });
    }
}