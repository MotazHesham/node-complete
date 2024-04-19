const { check, body } = require("express-validator"); // check get the value from anywhere but body get the value only from body
const User = require("../models/user");

exports.postproductValidation = [
    body("title").isString().isLength({ min: 5 }).trim(),
    // body("imageUrl").isURL(),
    body("price").isFloat(),
    body("description").isLength({ min: 5, max: 400 }).trim(),
];
