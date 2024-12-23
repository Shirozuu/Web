import { writeFile, readFile } from 'fs/promises';
import path from 'path';

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

        // Read the current index.html file
        const indexPath = path.join(process.cwd(), 'index.html');
        const indexContent = await readFile(indexPath, 'utf8');

        // Find the gallery section
        const gallerySection = '<div id="gallery-section" class="d-grid  grid-lg-3  grid-md-2 dsn-item-filter  dsn-isotope dsn-col v-dark-head"';
        const insertPosition = indexContent.indexOf(gallerySection);

        if (insertPosition === -1) {
            throw new Error('Gallery section not found in index.html');
        }

        // Insert the new artwork HTML after the gallery section opening tag
        const newContent = indexContent.slice(0, insertPosition + gallerySection.length) + 
                          '>\n' + html + '\n' + 
                          indexContent.slice(insertPosition + gallerySection.length);

        // Write the updated content back to index.html
        await writeFile(indexPath, newContent, 'utf8');

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