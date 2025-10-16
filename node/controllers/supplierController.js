const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/db');  // Assuming you have the db.js file for MySQL connection

const generateSupplierId = () => {
    // Prefix + timestamp + random number for uniqueness
    return `${Date.now()}-${Math.floor(Math.random() * 100)}`;
};

// Register
const register = async (req, res) => {
    const { email, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const supplierId = generateSupplierId();

    try {
        const query = 'INSERT INTO suppliers (email, password, supplierId) VALUES (?, ?, ?)';
        const values = [email, hashedPassword, supplierId];

        // Execute the query using the pool
        const [result] = await db.execute(query, values);

        res.status(201).json({ message: 'Supplier registered successfully' });
    } catch (error) {
        console.error("Error registering supplier:", error);
        res.status(400).json({ error: error.message });
    }
};

// Login
const login = async (req, res) => {
    const { email, password } = req.body;

    const query = 'SELECT * FROM suppliers WHERE email = ?';
    try {
        const [rows] = await db.execute(query, [email]);

        if (rows.length === 0) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        const supplier = rows[0];

        const isMatch = await bcrypt.compare(password, supplier.password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        const token = jwt.sign({ id: supplier.supplierId }, process.env.JWT_SECRET, { expiresIn: '1h' });
        res.json({ token });
    } catch (error) {
        console.error("Error logging in supplier:", error);
        res.status(500).json({ message: "Error logging in" });
    }
};

// Update Supplier Profile
const updateSupplierProfile = async (req, res) => {
    const { name, cell, home, gender } = req.body;
    const token = req.headers.authorization.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const supplierId = decoded.id;

    const query = 'UPDATE suppliers SET name = ?, cell = ?, home = ?, gender = ? WHERE supplierId = ?';
    const values = [name, cell, home, gender, supplierId];

    try {
        const [result] = await db.execute(query, values);

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "Supplier not found" });
        }

        // Return updated supplier profile (excluding password)
        const updatedProfile = { supplierId, name, cell, home, gender };
        res.json(updatedProfile);
    } catch (error) {
        console.error("Error updating profile:", error);
        res.status(500).json({ message: "Failed to update profile" });
    }
};

// Get Supplier Profile
const supplierProfile = async (req, res) => {
    try {
        const token = req.headers.authorization.split(" ")[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        const query = 'SELECT supplierId, email, name, cell, home, gender FROM suppliers WHERE supplierId = ?';
        const [rows] = await db.execute(query, [decoded.id]);

        if (rows.length === 0) {
            return res.status(401).json({ message: "Unauthorized access" });
        }

        const supplier = rows[0];
        res.json(supplier);
    } catch (error) {
        console.error("Error:", error);
        res.status(401).json({ message: "Unauthorized access" });
    }
};

// Get All Suppliers
const getAllSuppliers = async (req, res) => {
    try {
        const query = 'SELECT supplierId, name FROM suppliers';
        const [rows] = await db.execute(query);

        res.json(rows);
    } catch (error) {
        console.error("Error fetching suppliers:", error);
        res.status(500).json({ message: "Failed to retrieve suppliers" });
    }
};

// Get Particular Supplier by ID
const getParticularSupplier = async (req, res) => {
    try {
        const { supplierId } = req.params;

        const query = 'SELECT * FROM suppliers WHERE supplierId = ?';
        const [rows] = await db.execute(query, [supplierId]);

        if (rows.length === 0) {
            return res.status(404).json({ message: "Supplier not found" });
        }

        res.json(rows[0]);
    } catch (error) {
        console.error("Error fetching supplier:", error);
        res.status(500).json({ message: "Failed to retrieve supplier" });
    }
};

module.exports = {
    getAllSuppliers,
    register,
    login,
    supplierProfile,
    updateSupplierProfile,
    getParticularSupplier
};
