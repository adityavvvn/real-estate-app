import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './PropertyList.css';  // reuse your existing card styles
import { useNavigate } from 'react-router-dom';

function MyProperties() {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchMyProperties();
  }, []);

  const fetchMyProperties = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        alert('Please log in to view your properties');
        return;
      }

      const res = await axios.get(`${import.meta.env.VITE_API_URL}/properties/my-properties`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setProperties(res.data);
    } catch (err) {
      console.error(err);
      alert('Failed to load your properties');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this property?')) return;
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`${import.meta.env.VITE_API_URL}/properties/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setProperties((prev) => prev.filter((p) => p._id !== id));
    } catch (err) {
      console.error(err);
      alert('Failed to delete property');
    }
  };

  const handleEdit = (id) => {
    navigate(`/edit-property/${id}`);
  };

  return (
    <div className="property-page">
      <h1>My Properties</h1>
      {loading ? (
        <p className="text-center">Loading...</p>
      ) : properties.length === 0 ? (
        <p className="text-center">You haven't added any properties yet.</p>
      ) : (
        <div className="property-list">
          {properties.map((prop) => (
            <div key={prop._id} className="property-card">
              <img src={prop.image} alt={prop.title} />
              <h3>{prop.title}</h3>
              <p>{prop.city} — ₹{prop.price}</p>
              <p>{prop.description}</p>
              <div className="card-actions">
                <button onClick={() => handleEdit(prop._id)} className="btn btn-primary">Edit</button>
                <button onClick={() => handleDelete(prop._id)} className="btn btn-danger">Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default MyProperties;
