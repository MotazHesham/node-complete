const path = require('path');

const express = require('express');

const adminController = require('../controllers/adminController');
const productValidator = require('../validations/productValidation');
const isAuth = require('../middelware/is-auth');

const router = express.Router();

// /admin/add-product => GET
router.get('/add-product',isAuth , adminController.getAddProduct);

// /admin/products => GET
router.get('/products', isAuth ,adminController.getProducts);

// /admin/add-product => POST
router.post('/add-product',isAuth, productValidator.postproductValidation , adminController.postAddProduct);

router.get('/edit-product/:productId',isAuth , adminController.getEditProduct);

router.post('/edit-product',isAuth, productValidator.postproductValidation , adminController.postEditProduct);

router.post('/delete-product',isAuth , adminController.postDeleteProduct);

module.exports = router;
