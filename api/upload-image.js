import formidable from 'formidable';
import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary
cloudinary.config({
  cloud_name: 'dy7kmjs7m',
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

export const config = {
  api: {
    bodyParser: false,
  },
};

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const form = new formidable.IncomingForm();
    
    const [fields, files] = await form.parse(req);
    const file = files.image[0];

    // Upload image to Cloudinary
    const result = await cloudinary.uploader.upload(file.filepath, {
      folder: 'artwork'
    });

    // Return the secure URL
    return res.status(200).json({ 
      url: result.secure_url 
    });

  } catch (error) {
    console.error('Error uploading to Cloudinary:', error);
    return res.status(500).json({
      error: 'Failed to upload image',
      details: error.message
    });
  }
}