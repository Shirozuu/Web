// api/update-gallery.js
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

        // Here we just return success since we're handling the gallery update 
        // on the client side through localStorage
        return res.status(200).json({
            success: true,
            message: 'Gallery updated successfully',
            html: html
        });
    } catch (error) {
        console.error('Error:', error);
        return res.status(500).json({
            error: 'Internal server error',
            message: error.message
        });
    }
}