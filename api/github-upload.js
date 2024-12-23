module.exports = async (req, res) => {
    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const { path, content, message, action } = req.body;

    try {
        // Get current file content if exists
        if (action === 'get') {
            const response = await fetch(
                `https://api.github.com/repos/${process.env.GITHUB_OWNER}/${process.env.GITHUB_REPO}/contents/${path}`,
                {
                    headers: {
                        'Authorization': `token ${process.env.GITHUB_TOKEN}`,
                        'Accept': 'application/vnd.github.v3+json'
                    }
                }
            );
            
            if (!response.ok) {
                throw new Error(`GitHub API error: ${response.statusText}`);
            }

            const data = await response.json();
            return res.status(200).json(data);
        }

        // Upload/update file
        let sha;
        try {
            const getResponse = await fetch(
                `https://api.github.com/repos/${process.env.GITHUB_OWNER}/${process.env.GITHUB_REPO}/contents/${path}`,
                {
                    headers: {
                        'Authorization': `token ${process.env.GITHUB_TOKEN}`,
                        'Accept': 'application/vnd.github.v3+json'
                    }
                }
            );
            if (getResponse.ok) {
                const data = await getResponse.json();
                sha = data.sha;
            }
        } catch (e) {
            // File doesn't exist yet, which is fine
        }

        const response = await fetch(
            `https://api.github.com/repos/${process.env.GITHUB_OWNER}/${process.env.GITHUB_REPO}/contents/${path}`,
            {
                method: 'PUT',
                headers: {
                    'Authorization': `token ${process.env.GITHUB_TOKEN}`,
                    'Accept': 'application/vnd.github.v3+json',
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    message: message,
                    content: content,
                    sha: sha,
                    committer: {
                        name: 'Artwork Upload Bot',
                        email: 'bot@example.com'
                    }
                })
            }
        );

        if (!response.ok) {
            throw new Error(`GitHub API error: ${response.statusText}`);
        }

        const data = await response.json();
        res.status(200).json({ success: true, data });

    } catch (error) {
        console.error('Error:', error);
        res.status(500).json({ error: error.message || 'Failed to upload file to GitHub' });
    }
};
