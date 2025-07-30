import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

function EditProperty() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState({ title: '', city: '', price: '', description: '', image: '', images: '', available: true });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchProperty = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get(`${import.meta.env.VITE_API_URL}/properties/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        setForm({
          title: res.data.title || '',
          city: res.data.city || '',
          price: res.data.price || '',
          description: res.data.description || '',
          image: res.data.image || '',
          images: res.data.images && Array.isArray(res.data.images) ? res.data.images.join('\n') : '',
          available: typeof res.data.available === 'boolean' ? res.data.available : true
        });
      } catch (err) {
        setError('Failed to load property');
      } finally {
        setLoading(false);
      }
    };
    fetchProperty();
  }, [id]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm({
      ...form,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const token = localStorage.getItem('token');
      // Convert images textarea to array, trim empty lines
      const imagesArr = form.images
        ? form.images.split('\n').map(url => url.trim()).filter(Boolean)
        : [];
      await axios.put(`${import.meta.env.VITE_API_URL}/properties/${id}`, {
        ...form,
        images: imagesArr,
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      navigate('/my-properties');
    } catch (err) {
      setError('Failed to update property');
    }
  };

  if (loading) return <p style={{ textAlign: 'center' }}>Loading...</p>;
  if (error) return <p style={{ color: 'red', textAlign: 'center' }}>{error}</p>;

  return (
    <div className="property-page">
      <h1>Edit Property</h1>
      <form className="property-form" onSubmit={handleSubmit} style={{ maxWidth: 400, margin: '0 auto' }}>
        <label>Title
          <input name="title" value={form.title} onChange={handleChange} required />
        </label>
        <label>City
          <input name="city" value={form.city} onChange={handleChange} required />
        </label>
        <label>Price
          <input name="price" type="number" value={form.price} onChange={handleChange} required />
        </label>
        <label>Description
          <textarea name="description" value={form.description} onChange={handleChange} required />
        </label>
        {/* Optionally show image preview */}
        {form.image && <img src={form.image} alt="Property" style={{ width: '100%', marginBottom: 8 }} />}
        <input name="image" value={form.image} onChange={handleChange} required />
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
        <button type="submit" style={{ marginTop: 12 }}>Update Property</button>
      </form>
    </div>
  );
}

export default EditProperty; 