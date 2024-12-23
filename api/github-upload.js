const { Octokit } = require('@octokit/rest');

module.exports = async (req, res) => {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { content, path, message } = req.body;

    const octokit = new Octokit({
        auth: process.env.GITHUB_TOKEN
    });

    try {
        const response = await octokit.repos.createOrUpdateFileContents({
            owner: process.env.GITHUB_OWNER,
            repo: process.env.GITHUB_REPO,
            path: path,
            message: message,
            content: content,
            committer: {
                name: 'Artwork Upload Bot',
                email: 'bot@example.com'
            },
            author: {
                name: 'Artwork Upload Bot',
                email: 'bot@example.com'
            }
        });

        res.status(200).json({ 
            url: path,
            sha: response.data.content.sha 
        });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Failed to upload file to GitHub' });
    }
};
