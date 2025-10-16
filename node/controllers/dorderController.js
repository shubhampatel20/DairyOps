const db = require('../config/db'); // Assuming db.js handles MySQL connection
const jwt = require('jsonwebtoken');

// Create Order
const createOrder = async (req, res) => {
    try {
        const { productId, distributorId, description, quantity = 1, amount = 0 } = req.body;

        // Generate a unique order ID
        const generatedOrderId = `${Date.now()}-${Math.floor(Math.random() * 100)}`;
        const today = new Date();
        const dateString = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
        // Handle file upload (proof file)
        const proof = req.file?.path || null;

        // Prepare values for database insertion
        const values = [
            generatedOrderId, 
            productId || null, 
            distributorId || null, 
            dateString,
            description || null, 
            quantity, 
            amount, 
            proof, 
            'Pending'
        ];

        // Insert order into MySQL
        const query = `
            INSERT INTO dorder (orderId, productId, distributorId, orderDate,description, quantity, amount, proof, status)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?,?)
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
        // Corrected query with backticks around the 'order' table name
        const query = 'SELECT orderId, description, quantity, amount, proof, orderDate,status FROM dorder';

        // Use the promise-based API of mysql2 to execute the query
        const [results] = await db.execute(query);

        // Send the results as the response
        res.json(results);
    } catch (error) {
        console.error("Error fetching orders:", error);
        res.status(500).json({ message: "Failed to retrieve orders" });
    }
};


// Update order status
const updateOrder = async (req, res) => {
    const { status } = req.body;
    const { orderId } = req.params; // Retrieve orderId from route parameters

    try {
        const query = 'UPDATE dorder SET status = ? WHERE orderId = ?';
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
        const { orderId } = req.params; // Get the orderId from the route params

        const query = 'SELECT * FROM dorder WHERE orderId = ?';
        db.execute(query, [orderId], (err, results) => {
            if (err) {
                console.error("Error fetching order:", err);
                return res.status(500).json({ message: "Failed to retrieve order" });
            }

            if (results.length === 0) {
                return res.status(404).json({ message: "Order not found" });
            }

            res.json(results[0]); // Send back the found order
        });
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
