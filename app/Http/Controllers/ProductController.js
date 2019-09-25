const { validationResult } = require("express-validator")
const { raw } = require("objection")
const fs = require('fs')
const uuidv4 = require('uuid/v4')
const Product = require("../../Models/Product")
const ImageUpload = require("../../Helpers/ImageUpload")

module.exports = {
    /*
    Get data product based on query string
    @method GET
    @param req.query : pageIndex, limit, search, sort, mode
    @return Json
    */
    getProduct: async (req, res) => {
        // first page
        let pageIndex = req.query.page ? req.query.page-1 : 0
        let limit = req.query.limit ? req.query.limit : 12
        let search = req.query.search ? req.query.search : ""
        let sort = req.query.sort ? req.query.sort : "created_at"
        let sortMode = req.query.mode ? req.query.mode : "asc"

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

        const imageUpload = await ImageUpload.upload(req.files.image)

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

        let product

        if (req.files) {
            if (req.files.image) {

                const imageName = await ImageUpload.upload(req.files.image)

                product = await Product.query()
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
            product = await Product.query()
            .findById(req.params.id)
            .patch({
                name        : req.body.name,
                description : req.body.description,
                category_id : req.body.category_id,
                price       : req.body.price,
                qty         : (req.body.qty < 0 ? 0 : req.body.qty)
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

        // delete related image
        try {
            const deleteImage = await fs.unlinkSync(`public/images/${productImage.image}`)
        } catch (e) {
            return res.json({
                message: "Can't delete product from db",
                status: 500,
                data: {},
                errors: true
            })
        }

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
