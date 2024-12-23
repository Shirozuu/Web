const fs = require('fs').promises;
const path = require('path');

exports.handler = async (event) => {
    // Check if POST request
    if (event.httpMethod !== 'POST') {
        return {
            statusCode: 405,
            body: JSON.stringify({ message: 'Method not allowed' })
        };
    }

    try {
        const { html } = JSON.parse(event.body);
        const indexPath = path.join(__dirname, '../index.html');
        
        // Read index.html
        let content = await fs.readFile(indexPath, 'utf8');
        
        // Find insertion point
        const insertPoint = content.indexOf('<!-- ========== Work Section ========== -->');
        
        if (insertPoint === -1) {
            throw new Error('Could not find insertion point in index.html');
        }
        
        // Insert new artwork HTML
        content = content.slice(0, insertPoint) + html + content.slice(insertPoint);
        
        // Write updated content back to file
        await fs.writeFile(indexPath, content, 'utf8');
        
        return {
            statusCode: 200,
            body: JSON.stringify({ message: 'Gallery updated successfully' })
        };
    } catch (error) {
        console.error('Error:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ message: 'Error updating gallery', error: error.message })
        };
    }
};