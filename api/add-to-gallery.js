import { Octokit } from '@octokit/rest';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { imageUrl, title, category, socialLink } = req.body;

    // Create artwork HTML template
    const artworkHtml = `
                                <div class="folio-item work-item mt-80 dsn-col-md-2 dsn-col-lg-3 Product column ${category}" data-aos="fade-up">
                                    <div class="has-popup box-img before-z-index z-index-0 p-relative over-hidden folio-item__thumb"
                                        data-overlay="0">
                                        <a class="folio-item__thumb-link" target="blank" href="${imageUrl}" title="${title}" data-size="905x1280">
                                         <img class="cover-bg-img" src="data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==" data-dsn-src="${imageUrl}" alt="">
                                        </a>
                                    </div>
                                    <div class="folio-item__info">
                                        <div class="folio-item__cat">illustration/${category} ${new Date().getFullYear()}</div>
                                        <h4 class="folio-item__title">${title}!</h4>
                                     </div>
                                     ${socialLink ? `<a target="blank" href="${socialLink}" title="Twitter" class="folio-item__project-link">Twitter</a>` : ''}
                                     <div class="folio-item__caption">
                                        <p>${title}</p>
                                    </div>
                                </div>`;

    // Initialize Octokit
    const octokit = new Octokit({
      auth: process.env.GITHUB_TOKEN
    });

    // Get current index.html content
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
      '\n' + artworkHtml +
      content.slice(openingTagEnd);

    // Update file in GitHub
    await octokit.repos.createOrUpdateFileContents({
      owner: process.env.GITHUB_OWNER,
      repo: process.env.GITHUB_REPO,
      path: 'index.html',
      message: `Add new artwork: ${title}`,
      content: Buffer.from(updatedContent).toString('base64'),
      sha: currentFile.sha
    });

    res.status(200).json({ success: true });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ error: error.message });
  }
}
