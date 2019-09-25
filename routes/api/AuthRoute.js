const express = require("express")
const Router = express.Router()
const AuthController = require("../../app/Http/Controllers/AuthController")

Router
    .post("/login", AuthController.login)
    .post("/register", AuthController.register)

module.exports = Router;
