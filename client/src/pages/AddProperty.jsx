import React from 'react';
import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

export default function AddProperty() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    title: '',
    price: '',
    city: '',
    description: '',
    image: '',
    images: '',
    available: true // new: default to available
  });
  const [error, setError] = useState('');

  // 🚨 Protect this route
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      navigate('/login');
    }
  }, [navigate]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm({
      ...form,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      // Convert images textarea to array, trim empty lines
      const imagesArr = form.images
        ? form.images.split('\n').map(url => url.trim()).filter(Boolean)
        : [];
      await axios.post('http://localhost:5000/properties', {
        ...form,
        images: imagesArr,
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      navigate('/');
    } catch (err) {
      console.error(err);
      setError('Failed to add property');
    }
  };

  return (
    <div
      style={{
        backgroundImage: 'url(https://images.unsplash.com/photo-1600585154340-be6161a56a0c)',
        backgroundSize: 'cover',
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}
    >
      <form
        onSubmit={handleSubmit}
        style={{
          backgroundColor: 'rgba(255, 255, 255, 0.9)',
          padding: '2rem',
          borderRadius: '10px',
          boxShadow: '0 0 10px rgba(0,0,0,0.3)',
          width: '300px'
        }}
      >
        <h2 style={{ textAlign: 'center', marginBottom: '1rem' }}>Add Property</h2>
        <input
          type="text"
          name="title"
          placeholder="Title"
          value={form.title}
          onChange={handleChange}
          required
          style={{ width: '100%', marginBottom: '1rem', padding: '0.5rem' }}
        />
        <input
          type="number"
          name="price"
          placeholder="Price"
          value={form.price}
          onChange={handleChange}
          required
          style={{ width: '100%', marginBottom: '1rem', padding: '0.5rem' }}
        />
        <input
          type="text"
          name="city"
          placeholder="City"
          value={form.city}
          onChange={handleChange}
          required
          style={{ width: '100%', marginBottom: '1rem', padding: '0.5rem' }}
        />
        <input
          type="text"
          name="image"
          placeholder="Image URL (main)"
          value={form.image}
          onChange={handleChange}
          required
          style={{ width: '100%', marginBottom: '1rem', padding: '0.5rem' }}
        />
        <textarea
          name="images"
          placeholder="Additional image URLs (one per line)"
          value={form.images}
          onChange={handleChange}
          style={{ width: '100%', marginBottom: '1rem', padding: '0.5rem', minHeight: '60px' }}
        />
        <label style={{ display: 'flex', alignItems: 'center', marginBottom: '1rem' }}>
          <input
            type="checkbox"
            name="available"
            checked={form.available}
            onChange={handleChange}
            style={{ marginRight: 8 }}
          />
          Available
        </label>
        <textarea
          name="description"
          placeholder="Description"
          value={form.description}
          onChange={handleChange}
          required
          style={{ width: '100%', marginBottom: '1rem', padding: '0.5rem' }}
        />
        {error && <p style={{ color: 'red', textAlign: 'center' }}>{error}</p>}
        <button
          type="submit"
          style={{
            width: '100%',
            padding: '0.5rem',
            backgroundColor: '#4CAF50',
            color: 'white',
            border: 'none',
            cursor: 'pointer'
          }}
        >
          Add Property
        </button>
      </form>
    </div>
  );
}
