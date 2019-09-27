const express = require("express")
const Router = express.Router()
const AuthController = require("../../app/Http/Controllers/AuthController")

// rules validator
const RegisterRules = require("../../app/Http/Rules/Auth/RegisterRules")

Router
    .post("/login", AuthController.login)
    .post("/register", RegisterRules, AuthController.register)

module.exports = Router;
