const fs = require('fs').promises;

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { imageUrl, title, category, socialLink } = req.body;
    
    // Add to gallery data file instead of directly updating HTML
    const galleryData = require('../data/gallery.json');
    
    galleryData.items.push({
      imageUrl,
      title, 
      category,
      socialLink,
      date: new Date().toISOString()
    });

    // Save updated gallery data
    await fs.writeFile('./data/gallery.json', JSON.stringify(galleryData, null, 2));

    res.status(200).json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message }); 
  }
}
