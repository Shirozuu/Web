async function uploadArtwork(formData) {
  try {
    // First upload image to your storage
    const imageUploadRes = await fetch('/api/upload-image', {
      method: 'POST',
      body: formData
    });
    
    if (!imageUploadRes.ok) throw new Error('Failed to upload image');
    const { url: imageUrl } = await imageUploadRes.json();

    // Then add artwork to index.html
    const addArtworkRes = await fetch('/api/add-artwork', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        imageUrl,
        title: formData.get('title'),
        category: formData.get('category'),
        socialLink: formData.get('socialLink')
      })
    });

    if (!addArtworkRes.ok) throw new Error('Failed to add artwork');

    return true;
  } catch (error) {
    console.error('Error:', error);
    return false;
  }
}
