const { Octokit } = require('@octokit/rest');

module.exports = async (req, res) => {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { path, content, message } = req.body;

    const octokit = new Octokit({
        auth: process.env.GITHUB_TOKEN
    });

    try {
        // Get current file content if exists
        let currentFile;
        try {
            currentFile = await octokit.repos.getContent({
                owner: process.env.GITHUB_OWNER,
                repo: process.env.GITHUB_REPO,
                path: path
            });
        } catch (e) {
            // File doesn't exist yet, which is fine
        }

        // Create or update file
        const response = await octokit.repos.createOrUpdateFileContents({
            owner: process.env.GITHUB_OWNER,
            repo: process.env.GITHUB_REPO,
            path: path,
            message: message,
            content: content,
            sha: currentFile?.data?.sha,
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
            success: true,
            sha: response.data.content.sha 
        });
    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: 'Failed to upload file to GitHub' });
    }
};
