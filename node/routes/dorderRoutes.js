const express = require('express');
const router = express.Router();
const dorderController = require('../controllers/dorderController');


// Order routes
router.post('/createOrder', dorderController.createOrder); // Create a new order
router.get('/getOrder', dorderController.getOrder); // Create a new order
router.put('/updateOrder/:orderId', dorderController.updateOrder); // Corrected route path
router.get('/getParticularOrder/:orderId', dorderController.getParticularOrder); // Fetch order by orderId



module.exports = router;
