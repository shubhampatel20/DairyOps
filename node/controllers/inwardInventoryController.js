const db = require('../config/db'); // Import the MySQL connection
const jwt = require('jsonwebtoken');

// Create Inward Inventory
const createInwardInventory = async (req, res) => {
    try {
        const { orderId, productId, supplierId, quantity } = req.body;

        // Generate a unique inward inventory ID
        const generatedInwardInventoryId = `${Date.now()}-${Math.floor(Math.random() * 100)}`;

        // Verify the token
        const token = req.headers.authorization.split(" ")[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const userId = decoded.id; // Assuming the decoded token has an 'id' field

        // Insert the new inward inventory into the MySQL database
        const query = `INSERT INTO InwardInventory (InwardInventoryId, orderId, productId, supplierId, quantity)
                       VALUES (?, ?, ?, ?, ?)`;
        db.query(query, [generatedInwardInventoryId, orderId, productId, supplierId, quantity], (err, results) => {
            if (err) {
                console.error("Error inserting inward inventory:", err);
                return res.status(500).json({ error: "Failed to add item to inventory" });
            }
            res.status(201).json({
                message: 'Item added to inventory successfully',
                InwardInventoryId: generatedInwardInventoryId
            });
        });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

// Get Inward Inventory
const getinwardInventory = async (req, res) => {
    try {
        // Query to retrieve inward inventory data
        const query = 'SELECT productId, orderDate, quantity FROM InwardInventory';

        db.query(query, (err, results) => {
            if (err) {
                console.error("Error fetching inward inventory:", err);
                return res.status(500).json({ message: "Failed to retrieve inward inventory" });
            }
            res.json(results); // Send the retrieved data
        });
    } catch (error) {
        console.error("Error:", error);
        res.status(500).json({ message: "Error occurred while fetching inventory" });
    }
};

module.exports = {
    createInwardInventory,
    getinwardInventory
};
