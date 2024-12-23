const { builder } = require("@netlify/functions");

async function handler(event) {
    const headers = {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Content-Type': 'application/json'
    };

    // Handle preflight requests
    if (event.httpMethod === 'OPTIONS') {
        return {
            statusCode: 204,
            headers,
            body: ''
        };
    }

    // Only allow POST requests
    if (event.httpMethod !== 'POST') {
        return {
            statusCode: 405,
            headers,
            body: JSON.stringify({
                error: 'Method not allowed',
                allowedMethods: ['POST']
            })
        };
    }

    try {
        const { imageUrl, title, category, socialLink, html } = JSON.parse(event.body);

        // Validate required fields
        if (!imageUrl || !title || !category || !html) {
            return {
                statusCode: 400,
                headers,
                body: JSON.stringify({
                    error: 'Missing required fields'
                })
            };
        }

        return {
            statusCode: 200,
            headers,
            body: JSON.stringify({
                success: true,
                message: 'Gallery updated successfully',
                html: html
            })
        };
    } catch (error) {
        console.error('Error:', error);
        return {
            statusCode: 500,
            headers,
            body: JSON.stringify({
                error: 'Internal server error',
                message: error.message
            })
        };
    }
}

exports.handler = builder(handler);