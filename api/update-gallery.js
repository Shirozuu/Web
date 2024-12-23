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

        // Initialize Octokit with environment variables
        const octokit = new Octokit({
            auth: process.env.GITHUB_TOKEN
        });

        // Get current content of index.html
        const { data: currentFile } = await octokit.repos.getContent({
            owner: 'Shirozuu',
            repo: 'Web',
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
            owner: 'Shirozuu',
            repo: 'Web',
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