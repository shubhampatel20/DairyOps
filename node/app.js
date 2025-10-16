const express = require('express');
const pool = require('./config/db'); // Import pool directly
const cors = require("cors");
const authRoutes = require('./routes/authRoutes');
const supplierRoutes = require('./routes/supplierRoutes');
const productRoutes = require('./routes/productRoutes');
const orderRoutes = require('./routes/orderRoutes');
const dorderRoutes = require('./routes/dorderRoutes'); // Import dorder routes
const inwardInventoryRoutes = require('./routes/inwardInventoryRoutes');
const distributorRoutes = require('./routes/distributorRoutes'); // Import distributor routes

require('dotenv').config();

const app = express();

// CORS configuration
const corsOptions = {
    origin: "http://localhost:5173",
    methods: "GET, POST, PUT",
    credentials: true
};

app.use(cors(corsOptions));
app.use(express.json());

// Routes
app.use('/', authRoutes);
app.use('/supplier', supplierRoutes);
app.use('/product', productRoutes);
app.use('/order', orderRoutes);
app.use('/dorder', dorderRoutes); // Register dorder routes
app.use('/inwardInventory', inwardInventoryRoutes);
app.use('/distributor', distributorRoutes); 

const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
