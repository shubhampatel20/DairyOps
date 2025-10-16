const db = require('../config/db'); // Assuming db.js handles MySQL connection
const jwt = require('jsonwebtoken');

// Create Order
const createOrder = async (req, res) => {
    try {
        const { supplierId, description, quantity = 1, amount = 0 } = req.body;

        // Generate a unique order ID (if not using AUTO_INCREMENT in DB)
        const generatedOrderId = `${Date.now()}-${Math.floor(Math.random() * 100)}`;

        // Handle file upload (proof file)
        const proof = req.file?.path || null;

        // Prepare values for database insertion (7 values for 7 placeholders)
        const values = [
            generatedOrderId,   // orderId
            supplierId || null, 
            description || null, 
            quantity, 
            amount, 
            proof, 
            'Pending'
        ];

        // Insert order into MySQL
        const query = `
            INSERT INTO orders (orderId, supplierId, description, quantity, amount, proof, status)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        `;

        db.execute(query, values, (err, result) => {
            if (err) {
                console.error('Error creating order:', err);
                return res.status(500).json({ message: "Failed to create order" });
            }
            res.status(201).json({ message: 'Order created successfully', orderId: generatedOrderId });
        });
    } catch (error) {
        console.error("Error:", error);
        res.status(400).json({ error: error.message });
    }
};


// Get all orders
const getOrder = async (req, res) => {
    try {
        const query = 'SELECT orderId, description, quantity, amount, proof, orderDate, status FROM orders';
        const [results] = await db.execute(query);
        res.json(results);
    } catch (error) {
        console.error("Error fetching orders:", error);
        res.status(500).json({ message: "Failed to retrieve orders" });
    }
};


// Update order status
const updateOrder = async (req, res) => {
    const { status } = req.body;
    const { orderId } = req.params;

    try {
        const query = 'UPDATE orders SET status = ? WHERE orderId = ?';
        const values = [status, orderId];

        db.execute(query, values, (err, result) => {
            if (err) {
                console.error("Error updating order:", err);
                return res.status(500).json({ message: "Failed to update order" });
            }

            if (result.affectedRows === 0) {
                return res.status(404).json({ message: "Order not found" });
            }

            res.json({ message: "Order updated successfully" });
        });
    } catch (error) {
        console.error("Error updating order:", error);
        res.status(500).json({ message: "Failed to update order" });
    }
};


// Get a specific order by orderId
const getParticularOrder = async (req, res) => {
    try {
        const { orderId } = req.params;

        const query = 'SELECT * FROM orders WHERE orderId = ?';
        const [rows] = await db.execute(query, [orderId]);

        if (rows.length === 0) {
            return res.status(404).json({ message: "Order not found" });
        }

        res.json(rows[0]);
    } catch (error) {
        console.error("Error fetching order:", error);
        res.status(500).json({ message: "Failed to retrieve order" });
    }
};

module.exports = {
    createOrder,
    getOrder,
    updateOrder,
    getParticularOrder
};
