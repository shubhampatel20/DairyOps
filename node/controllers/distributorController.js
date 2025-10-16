const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/db');  // Assuming you have the db.js file for MySQL connection

// Generate Distributor ID (if not relying on AUTO_INCREMENT)
const generateDistributorId = () => {
    // Prefix + timestamp + random number for uniqueness
    return `${Date.now()}-${Math.floor(Math.random() * 100)}`;
};

// Register Distributor
const register = async (req, res) => {
    const { email, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const distributorId = generateDistributorId();

    try {
        const query = 'INSERT INTO distributor (email, password, distributorId) VALUES (?, ?, ?)';
        const values = [email, hashedPassword, distributorId];

        // Execute the query using the pool
        const [result] = await db.execute(query, values);

        res.status(201).json({ message: 'Distributor registered successfully' });
    } catch (error) {
        console.error("Error registering distributor:", error);
        res.status(400).json({ error: error.message });
    }
};

// Login Distributor
const login = async (req, res) => {
    const { email, password } = req.body;

    const query = 'SELECT * FROM distributor WHERE email = ?';
    try {
        const [rows] = await db.execute(query, [email]);

        if (rows.length === 0) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        const distributor = rows[0];

        const isMatch = await bcrypt.compare(password, distributor.password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        const token = jwt.sign({ id: distributor.distributorId }, process.env.JWT_SECRET, { expiresIn: '1h' });
        res.json({ token });
    } catch (error) {
        console.error("Error logging in distributor:", error);
        res.status(500).json({ message: "Error logging in" });
    }
};

// Update Distributor Profile
const updateDistributorProfile = async (req, res) => {
    const { name, address, contact, gender } = req.body;
    const token = req.headers.authorization.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const distributorId = decoded.id;

    const query = 'UPDATE distributor SET name = ?, address = ?, contact = ?, gender = ? WHERE distributorId = ?';
    const values = [name, address, contact, gender, distributorId];

    try {
        const [result] = await db.execute(query, values);

        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "Distributor not found" });
        }

        // Return updated distributor profile (excluding password)
        const updatedProfile = { distributorId, name, address, contact, gender };
        res.json(updatedProfile);
    } catch (error) {
        console.error("Error updating profile:", error);
        res.status(500).json({ message: "Failed to update profile" });
    }
};

// Get Distributor Profile
const distributorProfile = async (req, res) => {
    try {
        const token = req.headers.authorization.split(" ")[1];
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        const query = 'SELECT distributorId, email, name, address, contact, gender FROM distributor WHERE distributorId = ?';
        const [rows] = await db.execute(query, [decoded.id]);

        if (rows.length === 0) {
            return res.status(401).json({ message: "Unauthorized access" });
        }

        const distributor = rows[0];
        res.json(distributor);
    } catch (error) {
        console.error("Error:", error);
        res.status(401).json({ message: "Unauthorized access" });
    }
};

// Get All distributor
const getAllDistributors = async (req, res) => {
    try {
        const query = 'SELECT distributorId, name FROM distributor';
        const [rows] = await db.execute(query);

        res.json(rows);
    } catch (error) {
        console.error("Error fetching distributors:", error);
        res.status(500).json({ message: "Failed to retrieve distributors" });
    }
};

// Get Particular Distributor by ID
const getParticularDistributor = async (req, res) => {
    try {
        const { distributorId } = req.params;

        const query = 'SELECT * FROM distributor WHERE distributorId = ?';
        const [rows] = await db.execute(query, [distributorId]);

        if (rows.length === 0) {
            return res.status(404).json({ message: "Distributor not found" });
        }

        res.json(rows[0]);
    } catch (error) {
        console.error("Error fetching distributor:", error);
        res.status(500).json({ message: "Failed to retrieve distributor" });
    }
};

module.exports = {
    getAllDistributors,
    register,
    login,
    distributorProfile,
    updateDistributorProfile,
    getParticularDistributor
};
