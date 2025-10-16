const db = require('../config/db'); // Assuming db.js handles MySQL connection

// Get all products
const getAllProducts = async (req, res) => {
    try {
        const query = 'SELECT productId, name, price FROM product';
        
        // Promisify db.execute
        const [results] = await db.execute(query);
        
        res.json(results); // Send the product data
    } catch (error) {
        console.error("Error fetching products:", error);
        res.status(500).json({ message: "Failed to retrieve products" });
    }
};


// Create a new product
const createProduct = async (req, res) => {
    const { productId, name, price } = req.body;

    try {
        // Insert the new product into the products table
        const query = 'INSERT INTO products (productId, name, price) VALUES (?, ?, ?)';
        const values = [productId, name, price];

        db.execute(query, values, (err, result) => {
            if (err) {
                console.error("Error creating product:", err);
                return res.status(400).json({ message: "Failed to create product", error: err.message });
            }
            res.status(201).json({ message: "Product created successfully", product: { productId, name, price } });
        });
    } catch (error) {
        console.error("Error creating product:", error);
        res.status(400).json({ message: "Failed to create product", error: error.message });
    }
};

// Get a particular product by productId
const getParticularProduct = async (req, res) => {
    try {
        const { productId } = req.params;

        const query = 'SELECT * FROM product WHERE productId = ?';
        const [rows] = await db.execute(query, [productId]);

        if (rows.length === 0) {
            return res.status(404).json({ message: "product not found" });
        }

        res.json(rows[0]);
    } catch (error) {
        console.error("Error fetching product:", error);
        res.status(500).json({ message: "Failed to retrieve product" });
    }
};


module.exports = {
    getAllProducts,
    createProduct,
    getParticularProduct
};
