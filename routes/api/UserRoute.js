const express = require("express")
const Router = express.Router()
const UserController = require("../../app/Http/Controllers/UserController")

const ApiAuth = require("../../app/Http/Middleware/ApiAuth")

Router
    .get("/", ApiAuth,  UserController.getUser)

module.exports = Router;
