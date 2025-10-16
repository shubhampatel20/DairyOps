const express = require('express');
const router = express.Router();
const distributorController = require('../controllers/distributorController');

// Routes
router.post('/login', distributorController.login); // Distributor login (Assume it's similar to supplier)
router.post('/register', distributorController.register); // Distributor registration (Optional if needed)
router.get('/distributorProfile', distributorController.distributorProfile); // Get distributor profile
router.put('/updateDistributorProfile', distributorController.updateDistributorProfile); // Update distributor profile
// router.post('/generateOrder', distributorController.generateOrder); // Create a new order
router.get('/getAllDistributors', distributorController.getAllDistributors); // Get all distributors (Admin functionality)

module.exports = router;
