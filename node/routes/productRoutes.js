const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');

// Routes
router.get('/getAllProducts', productController.getAllProducts); // Correct name with capital "P"
router.post('/createProduct', productController.createProduct);
router.get('/getParticularProduct/:productId', productController.getParticularProduct); // Fetch by productId

module.exports = router;
