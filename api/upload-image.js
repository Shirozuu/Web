const cloudinary = require('cloudinary').v2;

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { image } = req.body;
    
    // Upload to Cloudinary
    const result = await cloudinary.uploader.upload(image, {
      folder: "gallery"
    });

    res.status(200).json({
      url: result.secure_url
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
