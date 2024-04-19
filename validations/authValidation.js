const { check, body } = require("express-validator"); // check get the value from anywhere but body get the value only from body
const User = require("../models/user");

exports.postSignupValidation = [
    check("email")
        .isEmail()
        .withMessage("Please enter a valid email")
        .custom((value, { req }) => {
            return User.findOne({ email: value }).then((userDoc) => {
                if (userDoc) {
                    return Promise.reject("User already exists");
                }
            });
        })
        .normalizeEmail(),
    body(
        "password",
        "Password must be at least 5 characters long, and only number and text."
    )
        .trim()
        .isLength({ min: 5 }),
    // .isAlphanumeric(),
    body(["confirmPassword"])
        .trim()
        .custom((value, { req }) => {
            if (value === req.body.password) {
                return true;
            } else {
                throw new Error("Passwords do not match");
            }
        }),
];

exports.postSigninValidation = [
    check("email")
        .isEmail()
        .withMessage("Please enter a valid email")
        .custom((value, { req }) => {
            return User.findOne({ email: value }).then((userDoc) => {
                if (userDoc) {
                    req.logUser = userDoc;
                    return true;
                } else {
                    return Promise.reject("Invalid Email or Password.");
                }
            });
        })
        .normalizeEmail(),
    body("password", "Password must be at least 5 characters long")
        .trim()
        .isLength({
            min: 5,
        }),
];
