const { validationResult } = require("express-validator")
const { raw } = require("objection")
const fs = require('fs')
const uuidv4 = require('uuid/v4')
const Product = require("../../Models/Product")
const Image = require("../../Helpers/Image")

module.exports = {
    /*
    Get data product based on query string
    @method GET
    @param req.query : pageIndex, limit, search, sort, mode
    @return Json
    */
    getProduct: async (req, res) => {

        let pageIndex = req.query.page ? req.query.page-1 : 0 // get page index for validation
        let limit = req.query.limit ? req.query.limit : 12 // set limit data
        let search = req.query.search ? req.query.search : "" // get input search
        let sort = req.query.sort ? req.query.sort : "created_at" // set sort data
        let sortMode = req.query.mode ? req.query.mode : "asc" // set sort mode with default desc

        // run the query with these value
        const products = await Product.query()
        .select(raw("products.*, categories.name as category"))
        .join("categories", "products.category_id", "=", "categories.id")
        .where("products.name", "LIKE", "%" + search + "%")
        .orderBy(sort == "category" ? "categories.name" : `products.${sort}`, sortMode)
        .page(pageIndex, limit)

        return res.json({
            message: "OKE",
            status: 200,
            data: products,
            error: false
        })
    },

    /*
    Create product with image
    @header form-data
    @method POST
    @param req.body : name, description, image, category_id, price, qty
    @return Json
    */
    createProduct: async (req, res) => {
        // check if request body does not match with rules
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

        const imageUpload = await Image.upload(req.files.image)

        if (imageUpload.error) {
            return res.json({
                message: imageUpload.message,
                status: 500,
                data: {},
                errors: true
            })
        }

        const insertProduct = await Product.query()
        .insert({
            name        : req.body.name,
            description : req.body.description,
            image       : imageUpload,
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

    /*
    Update product with image
    @header form-data
    @method PUT
    @param req.body : name, description, image (if exists), category_id, price, qty
    @return Json
    */
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

        if (req.body.qty < 0) {
            return res.json({
                message: "quantity can't be zero",
                status: 304,
                data: {},
                errors: errors.array()
            })
        }

        let updateProduct

        if (req.files) {
            if (req.files.image) {

                const product = await Product.query().findById(req.params.id)

                // delete the previous image
                const deleteImage = await Image.delete(product.image)
                if (!deleteImage) {
                    return res.json({message: "cant delet image"})
                }

                // upload new image to server
                const imageName = await Image.upload(req.files.image)
                //check if successfully uploaded
                if (!imageName) {
                    return res.json({
                        message: "Can't upload that image",
                        status: 500,
                        data: {},
                        errors: true
                    })
                }

                updateProduct = await Product.query()
                .findById(req.params.id)
                .patch({
                    name        : req.body.name,
                    description : req.body.description,
                    image       : imageName,
                    category_id : req.body.category_id,
                    price       : req.body.price,
                    qty         : (req.body.qty < 0 ? 0 : req.body.qty)
                })

            }
        }else{
            updateProduct = await Product.query()
            .findById(req.params.id)
            .patch({
                name        : req.body.name,
                description : req.body.description,
                category_id : req.body.category_id,
                price       : req.body.price,
                qty         : (req.body.qty < 0 ? 0 : req.body.qty)
            })
        }

        if (!updateProduct) {
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

    /*
    Delete product with related image
    @method DELETE
    @param req.params : id
    @return Json
    */
    deleteProduct: async (req, res) => {

        // get data product image
        const productImage = await Product.query()
        .select("image")
        .findById(req.params.id)

        if (productImage instanceof Product == false) {
            return res.json({
                message: "can't find  product",
                status: 404,
                data: {},
                errors: false
            })
        }

        // delete related image
        Image.delete(productImage.image)

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
    patchQtyProduct: async (req, res) => {
        const { action, qty } = req.query

        // parse input qty to integer
        let qtyProduct = parseInt(qty)

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

        const product = await Product.query()
        .findById(req.params.id)

        let countQty = parseInt(product.qty)

        switch (action) {
            case "add":
                countQty = product.qty + qtyProduct
                break;
            case "reduce":
                countQty = (product.qty - qty < 0 ? 0 : product.qty - qtyProduct)
                break;
            default:
                countQty = product.qty
        }

        const updateQty = await Product.query()
        .findById(req.params.id)
        .patch({
            qty: countQty
        })

        if (!updateQty) {
            return res.json({
                message: "Can't update qty to product",
                status: 500,
                data: {},
                errors: false
            })
        }

        return res.json({
            message: "OKE",
            status: 200,
            data: {},
            errors: false
        })
    }
};
