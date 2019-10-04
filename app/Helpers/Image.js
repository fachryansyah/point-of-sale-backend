require('dotenv').config()
const uuidv4 = require('uuid/v4')
const fs = require("fs")
const cloudinary = require('cloudinary').v2;

module.exports = {
    upload: async (image) => {
        let imageFile = image
        let imageMime = imageFile.mimetype.split("/")[1] // get format image
        let isImage = ["png", "jpg", "jpeg", "svg", "gif"].includes(imageMime)

        // check is image or not
        if (!isImage) {
            return {
                message: `please upload an image file not ${imageMime} file`,
                error: true
            }
        }

        // generate random name for image file
        const imageName = `${uuidv4()}.${imageMime}`

        //check public folder is exist
        if (await fs.existsSync('public') != false) {
            await fs.mkdirSync('public')
            await fs.mkdirSync('public/images')
        }

        // move image file to upload folder
        const moveImage = imageFile.mv(`public/images/${imageName}`)

        // check if error when moving image
        if (!moveImage) {
            return {
                message: "can't upload image",
                error: true
            }
        }

        return imageName
    },
    uploadCloudinary: async (image) => {
        let imageFile = image
        let imageMime = imageFile.mimetype.split("/")[1] // get format image
        let isImage = ["png", "jpg", "jpeg", "svg", "gif"].includes(imageMime)

        // check is image or not
        if (!isImage) {
            return {
                message: `please upload an image file not ${imageMime} file`,
                error: true
            }
        }

        // generate random name for image file
        const imageName = image.path
        console.log(image)
        await cloudinary.config({
            cloud_name: process.env.CLOUDINARY_NAME,
            api_key: process.env.CLOUDINARY_KEY,
            api_secret: process.env.CLOUDINARY_SECRET
        });

        const upload = await cloudinary.uploader.upload(image.data)

        // check if error when moving image
        // if (error) {
        //     console.log(error)
        //     return {
        //         message: "can't upload image",
        //         error: true
        //     }
        // }
        return upload.url
    },
    delete: async (imageName) => {
        try {
            const deleteImage = await fs.unlinkSync(`public/images/${imageName}`)
            return true
        } catch (e) {
            console.log(e.message)
            return false
        }
    }
};
