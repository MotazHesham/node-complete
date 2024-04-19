const Product = require("../models/product");
const validationHelper = require("../util/validation");
const fileHelper = require("../util/file");
const { validationResult } = require("express-validator"); 

exports.getAddProduct = (req, res, next) => {
    res.render("admin/edit-product", {
        pageTitle: "Add Product",
        path: "/admin/add-product",
        editing: false,
    });
};

exports.postAddProduct = (req, res, next) => {
    const title = req.body.title;
    const image = req.file;
    const price = req.body.price;
    const description = req.body.description;
    if(!image){  
        return res.status(422).render("admin/edit-product", {
            pageTitle: "Add Product",
            path: "/admin/add-product",
            editing: false,
            errorMessage:"Attatched file is not an image",
            product: {
                title: title, 
                description: description,
                price: price,
            },
        });
    } 

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        console.log(errors.array());
        res.locals.errorValidations = errors.array();
        return res.status(422).render("admin/edit-product", {
            pageTitle: "Add Product",
            path: "/admin/add-product",
            editing: false,
            product: {
                title: title, 
                description: description,
                price: price,
            },
        });
    }

    const product = new Product({ 
        title: title,
        price: price,
        imageUrl: image.path,
        description: description,
        userId: req.user,
    });
    product
        .save()
        .then((_) => res.redirect("/admin/products"))
        .catch((err) => {
            const error = new Error(err);
            error.httpStatusCode = 500;
            return next(error); 
        });
};

exports.getEditProduct = (req, res, next) => {
    const editMode = req.query.edit;
    if (!editMode) {
        return res.redirect("/");
    }
    const prodId = req.params.productId;
    Product.findById(prodId)
        .then((product) => {
            if (!product) {
                return res.redirect("/");
            }
            res.render("admin/edit-product", {
                pageTitle: "Edit Product",
                path: "/admin/edit-product",
                editing: editMode,
                product: product,
            });
        }).catch((err) => {
            const error = new Error(err);
            error.httpStatusCode = 500;
            return next(error); 
        });
};

exports.postEditProduct = (req, res, next) => {
    const prodId = req.body.productId;
    const updatedTitle = req.body.title;
    const updatedPrice = req.body.price;
    const image = req.file;
    const updatedDesc = req.body.description;

    Product.findById(prodId)
        .then((product) => {
            if (product.userId.toString() !== req.user._id.toString()) {
                req.flash("error", "Not Authenticated to edit this product");
                return res.redirect("/");
            }
            product.title = updatedTitle;
            product.price = updatedPrice;
            if(image){
                fileHelper.deleteFile(product.imageUrl);
                product.imageUrl = image.path;
            }
            product.description = updatedDesc;
            return product
                .save()
                .then(() => res.redirect("/admin/products")).catch((err) => {
                    const error = new Error(err);
                    error.httpStatusCode = 500;
                    return next(error); 
                });
        })
        .catch((err) => console.log(err));
};

exports.getProducts = (req, res, next) => {
    Product.find({ userId: req.user.id })
        // .select('title price -_id')
        // .populate('userId','name') // its get user info from the User model and add it to the product object as a property called 'userId'
        .then((products) => { 
            res.render("admin/products", {
                prods: products,
                pageTitle: "Admin Products",
                path: "/admin/products",
            });
        }).catch((err) => {
            const error = new Error(err);
            error.httpStatusCode = 500;
            return next(error); 
        });
};

exports.postDeleteProduct = (req, res, next) => {
    const prodId = req.body.productId;
    Product.deleteOne({ _id: prodId, userId: req.user._id })
        .then((_) => {
            res.redirect("/admin/products")}).catch((err) => {
            const error = new Error(err);
            error.httpStatusCode = 500;
            return next(error); 
        });
};
