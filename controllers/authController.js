const User = require("../models/user");
const crypto = require("crypto");
const bcrypt = require("bcryptjs");
const mailHelper = require("../util/email");
const { validationResult } = require("express-validator");

exports.getLogin = (req, res, next) => {
    res.render("auth/login", {
        path: "/login",
        pageTitle: "Login Page",
        oldInput: { email: "" },
    });
};

exports.getSignup = (req, res, next) => {
    res.render("auth/signup", {
        path: "/signup",
        pageTitle: "Signup Page",
        oldInput: { email: "", name: "" },
    });
};

exports.postLogin = (req, res, next) => {
    const password = req.body.password;

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        console.log(errors.array());
        res.locals.errorValidations = errors.array();
        return res.status(422).render("auth/login", {
            path: "/login",
            pageTitle: "Login Page",
            oldInput: { email: req.body.email },
        });
    }
    return bcrypt
        .compare(password, req.logUser.password)
        .then((doMatch) => {
            if (doMatch) {
                console.log("LoggedIn Success");
                req.session.isLoggedIn = true;
                req.session.user = req.logUser;
                return req.session.save((err) => {
                    console.log(err);
                    return res.redirect("/");
                });
            } else {
                req.flash("error", "Invalid Email or Password.");
                return res.redirect("/login");
            }
        })
        .catch((err) => {
            console.log(err);
            return res.redirect("/login");
        })
        .catch((err) => {
            const error = new Error(err);
            error.httpStatusCode = 500;
            return next(error);
        });
};

exports.postLogout = (req, res, next) => {
    req.session.destroy((err) => {
        console.log(err);
        res.redirect("/");
    });
};

exports.postSignup = (req, res, next) => {
    const name = req.body.name;
    const email = req.body.email;
    const password = req.body.password;

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        console.log(errors.array());
        res.locals.errorValidations = errors.array();
        return res.status(422).render("auth/signup", {
            path: "/signup",
            pageTitle: "Signup Page",
            oldInput: { email: email, name: name },
        });
    }

    let user;
    return bcrypt
        .hash(password, 12)
        .then((hashedPassword) => {
            user = new User({
                name: name,
                email: email,
                password: hashedPassword,
                cart: { items: [] },
            });
            return user.save();
        })
        .then(() => {
            console.log("User Created");

            req.session.isLoggedIn = true;
            req.session.user = user;
            return req.session.save((err) => {
                console.log(err);
                mailHelper(
                    email,
                    "Account Created",
                    `Hello ${name}, <br/> your account has been created succesfully`
                );
                return res.redirect("/");
            });
        })
        .catch((err) => {
            const error = new Error(err);
            error.httpStatusCode = 500;
            return next(error);
        });
};

exports.getReset = (req, res, next) => {
    res.render("auth/reset", {
        path: "/resetPassword",
        pageTitle: "ResetPassword Page",
    });
};

exports.postReset = (req, res, nexr) => {
    crypto.randomBytes(32, (err, buffer) => {
        if (err) {
            console.log(err);
            return res.redirect("/resetPassword");
        }
        const token = buffer.toString("hex");
        return User.findOne({ email: req.body.email })
            .then((user) => {
                if (!user) {
                    req.flash("error", "No Account with that email found.");
                    return res.redirect("/resetPassword");
                }
                user.passwordToken = token;
                user.passwordResetExpires = Date.now() + 3600000; //1 hour
                return user.save();
            })
            .then(() => {
                const mailBody = `
                    <p> You Requested a password reset </p>
                    <p> Click this <a href="http://localhost:3000/resetPassword/${token}">link</a> to set a new password </p>
                `;
                mailHelper(req.body.email, "Reset Password", mailBody);
                res.redirect("/resetPassword");
            })
            .catch((err) => {
                const error = new Error(err);
                error.httpStatusCode = 500;
                return next(error);
            });
    });
};

exports.getToken = (req, res, nexr) => {
    const token = req.params.token;
    User.findOne({
        passwordToken: token,
        passwordResetExpires: { $gt: Date.now() },
    }) // $gt => greater than
        .then((user) => {
            if (!user) {
                req.flash("error", "The link is invalid or has expired");
                return res.redirect("/login");
            }
            res.render("auth/new-password", {
                path: "/new-password",
                pageTitle: "NewPassword Page",
                userId: user._id.toString(),
                passwordToken: token,
            });
        })
        .catch((err) => {
            const error = new Error(err);
            error.httpStatusCode = 500;
            return next(error);
        });
};

exports.postNewpassword = (req, res, next) => {
    const userId = req.body.userId;
    const newPassword = req.body.password;
    const passwordToken = req.body.passwordToken;
    let resetUser;
    User.findOne({
        passwordToken: passwordToken,
        passwordResetExpires: { $gt: Date.now() },
        _id: userId,
    }) // $gt => greater than
        .then((user) => {
            if (!user) {
                req.flash("error", "The link is invalid or has expired");
                return res.redirect("/login");
            }
            resetUser = user;
            return bcrypt.hash(newPassword, 12);
        })
        .then((hashedPassword) => {
            resetUser.password = hashedPassword;
            resetUser.passwordToken = null;
            resetUser.passwordResetExpires = null;
            return resetUser.save();
        })
        .then(() => res.redirect("/login"))
        .catch((err) => {
            const error = new Error(err);
            error.httpStatusCode = 500;
            return next(error);
        });
};
