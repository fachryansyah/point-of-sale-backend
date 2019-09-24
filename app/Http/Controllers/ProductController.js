const { validationResult } = require("express-validator")
const fs = require('fs')
const uuidv4 = require('uuid/v4')
const Product = require("../../Models/Product")

module.exports = {
    getProduct: async (req, res) => {
        const products = await Product.query().joinEager({
            category: true
        })

        //check if product available
        if (products[0] instanceof Product == false) {
            return res.json({
                message: "No product available",
                status: 201,
                data: [],
                error: false
            })
        }

        return res.json({
            message: "OKE",
            status: 200,
            data: products,
            error: false
        })
    },
    createProduct: async (req, res) => {
        const errors = validationResult(req)
        if (!errors.isEmpty()) {
            return res.json({
                message: "Validation error",
                status: 304,
                data: {},
                errors: errors.array()
            })
        }

        //check if has image file
        if (!req.files) {
            return res.json({
                message: "No image choosen",
                status: 304,
                data: {},
                errors: true
            })
        }

        if (!req.files.image) {
            return res.json({
                message: "Can't find key image",
                status: 304,
                data: {},
                errors: true
            })
        }

        let imageFile = req.files.image
        let imageMime = imageFile.mimetype.split("/")[1]
        // generate random name for image file
        const imageName = `${uuidv4()}.${imageMime}`
        // move image file to upload folder
        const moveImage = imageFile.mv(`public/upload/${imageName}`)

        const insertProduct = await Product.query()
        .insert({
            name        : req.body.name,
            description : req.body.description,
            image       : imageName,
            category_id : req.body.category_id,
            price       : req.body.price,
            qty         : 0
        })

        //check if product has successfully added to db
        if (insertProduct instanceof Product == false) {
            return res.json({
                message: "Can't add product to db",
                status: 500,
                data: {},
                errors: true
            })
        }

        return res.json({
            message: "OKE",
            status: 200,
            data: insertProduct,
            errors: false
        })
    },
    updateProduct: async (req, res) => {
        // check user request
        const errors = validationResult(req)
        if (!errors.isEmpty()) {
            return res.json({
                message: "Validation errors",
                status: 304,
                data: {},
                errors: errors.array()
            })
        }

        let product

        if (req.files) {
            if (req.files.image) {

                let imageFile = req.files.image
                let imageMime = imageFile.mimetype.split("/")[1]
                // generate random name for image file
                const imageName = `${uuidv4()}.${imageMime}`
                // move image file to upload folder
                const moveImage = imageFile.mv(`public/upload/${imageName}`)
                product = await Product.query()
                .findById(req.params.id)
                .patch({
                    name        : req.body.name,
                    description : req.body.description,
                    image       : imageName,
                    category_id : req.body.category_id,
                    price       : req.body.price,
                    qty         : req.body.qty
                })

            }
        }else{
            product = await Product.query()
            .findById(req.params.id)
            .patch({
                name        : req.body.name,
                description : req.body.description,
                category_id : req.body.category_id,
                price       : req.body.price,
                qty         : req.body.qty
            })
        }

        if (!product) {
            return res.json({
                message : "Can't update product to db",
                status  : 500,
                data    : {},
                errors  : true
            })
        }

        return res.json({
            message : "OKE",
            status  : 200,
            data    : {},
            errors  : false
        })
    },
    deleteProduct: async (req, res) => {

        // get data product image
        const productImage = await Product.query()
        .select("image")
        .findById(req.params.id)

        // delete related image
        await fs.unlinkSync(`public/upload/${productImage.image}`)

        const product = await Product.query()
        .deleteById(req.params.id)

        if (!product) {
            return res.json({
                message: "Can't delete product from db",
                status: 500,
                data: {},
                errors: true
            })
        }

        return res.json({
            message: "OKE",
            status: 200,
            data: {},
            errors: false
        })
    },
    searchProduct: async (req, res) => {
        const products = await Product.query()
        .where("name", "LIKE", "%" + req.body.keyword + "%")
        .orderBy("name")

        if (products[0] instanceof Product == false) {
            return res.json({
                message: "No product found",
                status: 404,
                data: {},
                errors: false
            })
        }

        return res.json({
            message: "OKE",
            status: 200,
            data: products,
            errors: false
        })
    }
};
