const { Octokit } = require('@octokit/rest');

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { imageUrl, title, category, socialLink } = req.body;

  // Validate required fields
  if (!imageUrl || !title || !category || !socialLink) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const octokit = new Octokit({
    auth: process.env.GITHUB_TOKEN
  });

  try {
    // Get current file content
    const { data: fileData } = await octokit.repos.getContent({
      owner: process.env.GITHUB_OWNER,
      repo: process.env.GITHUB_REPO,
      path: 'index.html'
    });

    const content = Buffer.from(fileData.content, 'base64').toString();

    // Create new artwork HTML
    const newArtwork = `
                                <!-- ========== IMAGE: ${title} ========== -->
                                <div class="folio-item work-item dsn-col-md-2 dsn-col-lg-3 Product column ${category}" data-aos="fade-up">
                                    <div class="has-popup box-img before-z-index z-index-0 p-relative over-hidden folio-item__thumb"
                                        data-overlay="0">
                                        <a class="folio-item__thumb-link" target="blank" href="${imageUrl}" title="${title}" data-size="905x1280">
                                            <img class="cover-bg-img" src="data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==" data-dsn-src="${imageUrl}" alt="">
                                        </a>
                                    </div>
   
                                    <div class="folio-item__info">
                                        <div class="folio-item__cat">illustration/${category}</div>
                                        <h4 class="folio-item__title">${title}!</h4>
                                    </div>
                                    <a target="blank" href="${socialLink}" title="Twitter" class="folio-item__project-link">Twitter</a>
                                    <div class="folio-item__caption">
                                        <p>Twitter</p>
                                    </div>
                                </div>
                                <!-- ========== IMAGE END ========== -->`;

    // Find insertion point (before the last work section closing tag)
    const insertPoint = content.lastIndexOf('<!-- ========== End Work Section ========== -->');
    const newContent = content.slice(0, insertPoint) + newArtwork + content.slice(insertPoint);

    // Update file in GitHub
    await octokit.repos.createOrUpdateFileContents({
      owner: process.env.GITHUB_OWNER,
      repo: process.env.GITHUB_REPO,
      path: 'index.html',
      message: `Add new artwork: ${title}`,
      content: Buffer.from(newContent).toString('base64'),
      sha: fileData.sha
    });

    res.status(200).json({ message: 'Artwork added successfully' });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: 'Failed to add artwork' });
  }
};
