const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const pool = require('../config/db');  // Adjust path if necessary

const generateUserId = () => {
    return `${Date.now()}-${Math.floor(Math.random() * 100)}`;
};

// Register
const register = async (req, res) => {
    const { email, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const userId = generateUserId();

    try {
        const [rows] = await pool.query('INSERT INTO User (userId, email, password, name, dob, cell, home, gender, designation) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)', 
        [userId, email, hashedPassword, '', null, '', '', null, '']);

        res.status(201).json({ message: 'User registered successfully' });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

// Login
const login = async (req, res) => {
    const { email, password } = req.body;

    try {
        const [users] = await pool.query('SELECT * FROM User WHERE email = ?', [email]);
        const user = users[0];

        if (!user || !(await bcrypt.compare(password, user.password))) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        const token = jwt.sign({ id: user.userId }, process.env.JWT_SECRET, { expiresIn: '1h' });
        res.json({ token });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Forgot Password
const forgotPassword = async (req, res) => {
    const { email } = req.body;

    try {
        const [users] = await pool.query('SELECT * FROM User WHERE email = ?', [email]);
        const user = users[0];

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const resetToken = jwt.sign({ id: user.userId }, process.env.JWT_SECRET, { expiresIn: '15m' });

        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL,
                pass: process.env.EMAIL_PASSWORD,
            },
        });

        const mailOptions = {
            from: process.env.EMAIL,
            to: email,
            subject: 'Password Reset',
            text: `Click the link to reset your password: ${process.env.FRONTEND_URL}/reset-password/${resetToken}`,
        };

        // Using async/await for better handling of async operation
        await transporter.sendMail(mailOptions);
        res.status(200).json({ message: 'Password reset link sent to your email.' });

    } catch (error) {
        console.error('Error in forgotPassword:', error);
        return res.status(500).json({ message: 'Internal server error.' });
    }
};

// Reset Password
const resetPassword = async (req, res) => {
    const { newPassword } = req.body;
    const { token } = req.params;

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        // Update the password in the database
        await pool.query('UPDATE User SET password = ? WHERE userId = ?', [hashedPassword, decoded.id]);
        res.json({ message: 'Password updated successfully' });

    } catch (error) {
        if (error.name === 'TokenExpiredError') {
            return res.status(400).json({ message: 'Reset token has expired' });
        }
        console.error('Error:', error);
        res.status(400).json({ message: 'Invalid token or request' });
    }
};


//User Profile
const userProfile = async (req, res) => {
    try {
        const token = req.headers.authorization.split(" ")[1];
        console.log("Token:", token); // Debugging token
        
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        console.log("Decoded token:", decoded); // Debugging decoded token

        const [users] = await pool.query('SELECT userId, email, name, dob, cell, home, gender, designation FROM User WHERE userId = ?', [decoded.id]);
        console.log("Users from DB:", users); // Debugging DB response
        
        const user = users[0];

        if (!user) return res.status(404).json({ message: "User not found" });

        res.json(user);
    } catch (error) {
        console.error("Error:", error);  // Log the full error
        res.status(500).json({ message: "Internal Server Error", error: error.message });
    }
};

// Update User Profile
const updateUserProfile = async (req, res) => {
    const { name, dob, cell, home, gender, designation } = req.body;

    // Check if Authorization header is present and correctly formatted
    if (!req.headers.authorization || !req.headers.authorization.startsWith("Bearer ")) {
        return res.status(400).json({ message: "Authorization token missing or malformed" });
    }

    const token = req.headers.authorization.split(" ")[1];

    try {
        // Verify the JWT token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        console.log(decoded); // Log decoded token to ensure it's correct

        // Update user profile in the database
        const [result] = await pool.query(
            'UPDATE User SET name = ?, dob = ?, cell = ?, home = ?, gender = ?, designation = ? WHERE userId = ?',
            [name, dob, cell, home, gender, designation, decoded.id]
        );

        // Check if any rows were affected (i.e., the user exists and was updated)
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: "User not found" });
        }

        // Optionally, you can fetch the updated user data after the update:
        const [updatedUser] = await pool.query('SELECT userId, email, name, dob, cell, home, gender, designation FROM User WHERE userId = ?', [decoded.id]);
        
        // Return the updated user profile
        res.json(updatedUser[0]);
    } catch (error) {
        console.error("Error updating profile:", error);
        res.status(500).json({ message: "Failed to update profile", error: error.message });
    }
};

module.exports = {
    updateUserProfile,
    userProfile,
    register,
    login,
    forgotPassword,
    resetPassword,
};
