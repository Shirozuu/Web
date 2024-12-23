const fs = require('fs').promises;
const path = require('path');

exports.handler = async (event) => {
    // Add CORS headers
    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Content-Type': 'application/json'
    };

    if (event.httpMethod !== 'POST') {
        return {
            statusCode: 405,
            headers,
            body: JSON.stringify({ message: 'Method not allowed' })
        };
    }

    try {
        const { imageUrl, title, category, socialLink } = JSON.parse(event.body);
        
        // Create artwork data
        const newArtwork = {
            imageUrl,
            title,
            category,
            socialLink,
            date: new Date().toISOString()
        };

        // Create artwork HTML
        const artworkHTML = `
            <div class="folio-item work-item mt-80 dsn-col-md-2 dsn-col-lg-3 Product column ${category}" data-aos="fade-up">
                <div class="has-popup box-img before-z-index z-index-0 p-relative over-hidden folio-item__thumb" data-overlay="0">
                    <a class="folio-item__thumb-link" target="blank" href="${imageUrl}" title="${title}" data-size="905x1280">
                        <img class="cover-bg-img" src="data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==" data-dsn-src="${imageUrl}" alt="${title}">
                    </a>
                </div>
                <div class="folio-item__info">
                    <div class="folio-item__cat">illustration/${category}</div>
                    <h4 class="folio-item__title">${title}!</h4>
                </div>
                <a target="blank" href="${socialLink}" title="Social" class="folio-item__project-link">Social</a>
                <div class="folio-item__caption">
                    <p>${title}</p>
                </div>
            </div>`;

        const indexPath = path.join(__dirname, '../index.html');
        
        // Read index.html
        let content = await fs.readFile(indexPath, 'utf8');
        
        // Find insertion point
        const insertPoint = content.indexOf('<!-- ========== Work Section ========== -->');
        
        if (insertPoint === -1) {
            throw new Error('Could not find insertion point in index.html');
        }
        
        // Insert new artwork HTML
        content = content.slice(0, insertPoint) + artworkHTML + content.slice(insertPoint);
        
        // Write updated content back to file
        await fs.writeFile(indexPath, content, 'utf8');
        
        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({ 
                message: 'Gallery updated successfully'
            })
        };
    } catch (error) {
        console.error('Error:', error);
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({ 
                message: 'Error updating gallery', 
                error: error.message 
            })
        };
    }
};