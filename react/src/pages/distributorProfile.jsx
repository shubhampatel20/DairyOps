import React, { useState, useEffect } from 'react';
import './Css/DistributorProfile.css';

const DistributorProfile = () => {
  const [distributor, setDistributor] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    cell: '',
    home: '',
    gender: '',
  });
  const [orders, setOrders] = useState([]);
  const [error, setError] = useState(null);

  // Fetch distributor details
  useEffect(() => {
    const fetchDistributorDetails = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        console.log("No token found");
        return;
      }

      try {
        const response = await fetch("http://localhost:8000/distributor/distributorProfile", {
          headers: {
            "Authorization": `Bearer ${token}`,
          },
        });

        if (response.ok) {
          const distributorData = await response.json();
          setDistributor(distributorData);
          setFormData({
            name: distributorData.name,
            cell: distributorData.cell,
            home: distributorData.home,
            gender: distributorData.gender,
          });
        } else {
          console.log("Failed to fetch distributor details");
        }
      } catch (error) {
        console.error("Error fetching distributor data:", error);
      }
    };

    fetchDistributorDetails();
  }, []);

  // Fetch orders for distributor
  useEffect(() => {
    const fetchOrders = async () => {
      const token = localStorage.getItem("token");
      if (!token) return;

      
      //...hkhkh
      try {
        const response = await fetch("http://localhost:8000/dorder/getOrder", {
          headers: { "Authorization": `Bearer ${token}` },
        });

        if (response.ok) {
          const orderData = await response.json();
          setOrders(orderData);
          console.log(orderData);
        } else {
          setError("Failed to fetch orders.");
        }
      } catch (error) {
        setError("Error fetching orders.");
      }
    };

    fetchOrders();
  }, []);

  // Handle Edit button click
  const handleEditClick = () => {
    setIsEditing(true);
  };

  // Handle form input changes
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Handle saving updated distributor profile
  const handleSave = async () => {
    const token = localStorage.getItem("token");

    try {
      const response = await fetch("http://localhost:8000/distributor/updateDistributorProfile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        const updatedDistributor = await response.json();
        setDistributor(updatedDistributor);
        setIsEditing(false);
      } else {
        console.log("Failed to update distributor profile");
      }
    } catch (error) {
      console.error("Error updating profile:", error);
    }
  };

  // Add order to inventory
  const handleAddToInventory = async (orderId) => {
    const token = localStorage.getItem("token");

    try {
      const response = await fetch(`http://localhost:8000/inwardInventory/createInwardInventory`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({ orderId }),
      });

      if (response.ok) {
        alert("Product added to inventory successfully!");
      } else {
        setError("Failed to add product to inventory.");
      }
    } catch (error) {
      setError("Error adding product to inventory.");
    }
  };

  if (!distributor) {
    return <div>Loading...</div>;
  }

  return (
    <div className="app-container">
      <div className="sidebar">
        <div className="logo">
          <h2>DairyOps</h2>
        </div>
        <ul className="nav-menu">
        <li><a href="http://localhost:5173/dorder">Order</a></li>
          <li>Settings</li>
          <li>Feedback Corner</li>
          <li>Reports</li>
        </ul>
      </div>

      <div className="main-content">
        <div className="header">
          <div className="search-bar">
            <input type="text" placeholder="Search..." />
          </div>
          <div className="header-icons">
            <span className="notification-icon">🔔</span>
            <span className="user-avatar">
              <img src="https://via.placeholder.com/40" alt="Distributor Avatar" />
            </span>
          </div>
        </div>

        <div className="profile-details-container">
          <div className="profile-card">
            <img src="https://via.placeholder.com/100" alt="Profile" className="profile-image" />
            {isEditing ? (
              <>
                <input name="name" value={formData.name} onChange={handleChange} placeholder="Name" />
                <input name="address" value={formData.address} onChange={handleChange} placeholder="Address" />
                <input name="contact" value={formData.contact} onChange={handleChange} placeholder="Contact" />
                <input name="region" value={formData.region} onChange={handleChange} placeholder="Region" />
                <button onClick={handleSave}>Save</button>
              </>
            ) : (
              <>
                <h3>{distributor.name}</h3>
                <p>ID Number: {distributor.distributorId}</p>
                <p>Email: {distributor.email}</p>
                <p>Address: {distributor.address}</p>
                <p>Contact: {distributor.contact}</p>
                <p>Region: {distributor.region}</p>
                <button onClick={handleEditClick}>Edit</button>
              </>
            )}
          </div>

          <div className="orders-section">
            <h4>Orders to Fulfill</h4>
            {error ? (
              <p>{error}</p>
            ) : (
              <table>
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Product Description</th>
                    <th>Quantity</th>
                    <th>Delivery Status</th>
                    <th>Invoice</th>
                   
                  </tr>
                </thead>
                <tbody>
                  {orders.map((order) => (
                    <tr key={order.orderId}>
                      <td>{new Date(order.orderDate).toLocaleDateString()}</td>
                      <td>{order.description}</td>
                      <td>{order.quantity}</td>
                      <td>{order.status}</td>
                      <td><a href={`http://localhost:5173/invoice/${order.orderId}`}>Invoice</a></td>
                     
                    
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DistributorProfile;
