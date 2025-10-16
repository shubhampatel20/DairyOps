import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Benefits from './pages/benefits';
import Register from './pages/Register';
import Login from './pages/Login';
import ForgotPassword from './pages/ForgotPassword';
import PasswordUpdate from './pages/PasswordUpdate';
import UserProfile from './pages/userProfile';
import Order from './pages/order';
import SupplierProfile from "./pages/supplierProfile";
import DistributorProfile from './pages/distributorProfile'; // Adjust the path as necessary
import Payment from "./pages/payment";
import Invoice from "./pages/invoice.jsx";
import InventoryInward from './pages/inventoryInward.jsx';
import DOrder from './pages/dorder'; // Import the DOrder component

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/benefits" element={<Benefits />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login />} />
        <Route path="/ForgetPassword" element={<ForgotPassword />} />
        <Route path="/reset-password/:token" element={<PasswordUpdate />} />
        <Route path="/PasswordUpdate" element={<PasswordUpdate />} />
        <Route path="/userProfile" element={<UserProfile />} />
        <Route path="/supplierProfile" element={<SupplierProfile />} />
        <Route path="/distributorProfile" element={<DistributorProfile />} />
        <Route path="/order" element={<Order />} />
        <Route path="/dorder" element={<DOrder />} /> {/* Add route for DOrder */}
        <Route path="/payment" element={<Payment />} />
        <Route path="/invoice/:orderId" element={<Invoice />} />
        <Route path="/inwardInventory" element={<InventoryInward />} />
      </Routes>
    </Router>
  );
}

export default App;
