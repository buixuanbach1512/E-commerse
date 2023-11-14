const cloudinary = require('cloudinary');

const cloudinaryUploadImg = async (fileToUploads) => {
    cloudinary.config({
        cloud_name: process.env.CLOUD_NAME,
        api_key: process.env.API_KEY,
        api_secret: process.env.API_SECRET,
    });
    return new Promise((resolve) => {
        cloudinary.uploader.upload(fileToUploads, (result) => {
            resolve(
                {
                    url: result.secure_url,
                },
                {
                    resource_type: 'auto',
                },
            );
        });
    });
};

module.exports = cloudinaryUploadImg;
