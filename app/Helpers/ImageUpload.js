const uuidv4 = require('uuid/v4')

module.exports = {
    upload: async (image) => {
        let imageFile = image
        let imageMime = imageFile.mimetype.split("/")[1]
        // generate random name for image file
        const imageName = `${uuidv4()}.${imageMime}`
        // move image file to upload folder
        const moveImage = imageFile.mv(`public/images/${imageName}`)

        if (!moveImage) {
            return false
        }

        return imageName
    }
};
