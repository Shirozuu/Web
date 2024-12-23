const AWS = require('aws-sdk');
const s3 = new AWS.S3();

exports.handler = async (event) => {
    const formData = JSON.parse(event.body);
    const { title, category, social_link } = formData;
    const file = formData.artwork;

    const params = {
        Bucket: 'your-s3-bucket-name',
        Key: `uploads/${Date.now()}-${file.name}`,
        Body: file.content,
        ContentType: file.type
    };

    try {
        await s3.upload(params).promise();
        // Add logic to update your HTML file with the new artwork
        return {
            statusCode: 200,
            body: JSON.stringify({ message: 'Upload successful' })
        };
    } catch (error) {
        return {
            statusCode: 500,
            body: JSON.stringify({ message: 'Upload failed', error })
        };
    }
};