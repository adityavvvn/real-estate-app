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
    bhk: '',
    areaName: '',
    lat: '',
    lng: '',
    description: '',
    image: '',
    images: '',
    available: true // new: default to available
  });
  const [error, setError] = useState('');
  const [showCustomBhk, setShowCustomBhk] = useState(false);

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
    // Basic client-side validation
    if (!form.title || !form.city || !form.price || !form.image || !form.description) {
      setError('Please fill all required fields.');
      return;
    }
    if (Number(form.price) <= 0) {
      setError('Price must be greater than 0.');
      return;
    }
    try {
      const token = localStorage.getItem('token');
      // Convert images textarea to array, trim empty lines
      const imagesArr = form.images
        ? form.images.split('\n').map(url => url.trim()).filter(Boolean)
        : [];
      const payload = {
        title: form.title,
        price: form.price,
        city: form.city,
        bhk: form.bhk ? Number(form.bhk) : undefined,
        areaName: form.areaName || undefined,
        description: form.description,
        image: form.image,
        images: imagesArr,
        available: form.available,
      };
      // If lat/lng provided, include GeoJSON location
      if (form.lat && form.lng) {
        const latNum = Number(form.lat);
        const lngNum = Number(form.lng);
        if (Number.isFinite(latNum) && Number.isFinite(lngNum)) {
          payload.location = { type: 'Point', coordinates: [lngNum, latNum] };
        }
      }
      await axios.post('http://localhost:5000/properties', payload, {
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
          width: '820px'
        }}
      >
        <h2 style={{ textAlign: 'center', marginBottom: '1rem' }}>Add Property</h2>
        <div style={{ marginBottom: 8, color: '#555', fontSize: 12 }}>Required fields are marked with *</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
          {/* Left column: Basic Details */}
          <div>
            <h3 style={{ margin: '0.5rem 0' }}>Basic Details</h3>
            <input
              type="text"
              name="title"
              placeholder="Title *"
              value={form.title}
              onChange={handleChange}
              required
              style={{ width: '100%', marginBottom: '1rem', padding: '0.5rem' }}
            />
            <input
              type="number"
              name="price"
              placeholder="Price *"
              value={form.price}
              onChange={handleChange}
              required
              style={{ width: '100%', marginBottom: '1rem', padding: '0.5rem' }}
            />
            <input
              type="text"
              name="city"
              placeholder="City *"
              value={form.city}
              onChange={handleChange}
              required
              style={{ width: '100%', marginBottom: '1rem', padding: '0.5rem' }}
            />
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', marginBottom: 6 }}>BHK</label>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {['', '1', '2', '3', '4'].map((val) => (
                  <button
                    key={val || 'any'}
                    type="button"
                    onClick={() => { setShowCustomBhk(false); setForm(prev => ({ ...prev, bhk: val })); }}
                    className="btn"
                    style={{
                      backgroundColor: (form.bhk === val && !showCustomBhk) ? '#2563eb' : 'transparent',
                      color: (form.bhk === val && !showCustomBhk) ? '#fff' : 'inherit',
                      border: '1px solid #2563eb',
                      padding: '6px 10px'
                    }}
                  >
                    {val ? `${val} BHK` : 'Any'}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => setShowCustomBhk(true)}
                  className="btn"
                  style={{
                    backgroundColor: showCustomBhk ? '#2563eb' : 'transparent',
                    color: showCustomBhk ? '#fff' : 'inherit',
                    border: '1px solid #2563eb',
                    padding: '6px 10px'
                  }}
                >Custom</button>
              </div>
              {showCustomBhk && (
                <input
                  type="number"
                  name="bhk"
                  placeholder="Enter BHK"
                  value={form.bhk}
                  onChange={handleChange}
                  style={{ width: '100%', marginTop: 8, padding: '0.5rem' }}
                />
              )}
            </div>
            <input
              type="text"
              name="areaName"
              placeholder="Area / Locality (optional)"
              value={form.areaName}
              onChange={handleChange}
              style={{ width: '100%', marginBottom: '1rem', padding: '0.5rem' }}
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
          </div>

          {/* Right column: Location, Images, Description */}
          <div>
            <h3 style={{ margin: '0.5rem 0' }}>Location</h3>
            <div style={{ display: 'flex', gap: 8 }}>
              <input
                type="number"
                name="lat"
                placeholder="Latitude (optional)"
                value={form.lat}
                onChange={handleChange}
                style={{ flex: 1, marginBottom: '1rem', padding: '0.5rem' }}
              />
              <input
                type="number"
                name="lng"
                placeholder="Longitude (optional)"
                value={form.lng}
                onChange={handleChange}
                style={{ flex: 1, marginBottom: '1rem', padding: '0.5rem' }}
              />
            </div>
            <button
              type="button"
              onClick={() => {
                if (navigator.geolocation) {
                  navigator.geolocation.getCurrentPosition((pos) => {
                    setForm(prev => ({ ...prev, lat: String(pos.coords.latitude), lng: String(pos.coords.longitude) }));
                  });
                }
              }}
              style={{ marginBottom: '1rem', padding: '0.5rem', border: '1px solid #2563eb', background: 'transparent', cursor: 'pointer', width: '100%' }}
            >📍 Use my location</button>

            <h3 style={{ margin: '0.5rem 0' }}>Images</h3>
            <input
              type="text"
              name="image"
              placeholder="Image URL (main) *"
              value={form.image}
              onChange={handleChange}
              required
              style={{ width: '100%', marginBottom: '0.5rem', padding: '0.5rem' }}
            />
            {form.image ? (
              <img src={form.image} alt="Main" style={{ width: '100%', height: 140, objectFit: 'cover', borderRadius: 6, marginBottom: '1rem' }} />
            ) : null}
            <textarea
              name="images"
              placeholder="Additional image URLs (one per line)"
              value={form.images}
              onChange={handleChange}
              style={{ width: '100%', marginBottom: '1rem', padding: '0.5rem', minHeight: '60px' }}
            />
            {form.images && form.images.split('\n').filter(Boolean).length > 0 && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, marginBottom: '1rem' }}>
                {form.images.split('\n').map((u, idx) => u.trim()).filter(Boolean).slice(0, 6).map((url, i) => (
                  <img key={i} src={url} alt={`Img-${i}`} style={{ width: '100%', height: 80, objectFit: 'cover', borderRadius: 6 }} />
                ))}
              </div>
            )}

            <h3 style={{ margin: '0.5rem 0' }}>Description</h3>
            <textarea
              name="description"
              placeholder="Description *"
              value={form.description}
              onChange={handleChange}
              required
              style={{ width: '100%', marginBottom: '1rem', padding: '0.5rem', minHeight: 100 }}
            />
          </div>

          {/* Full width actions */}
          <div style={{ gridColumn: '1 / -1' }}>
            {error && <p style={{ color: 'red', textAlign: 'center', marginBottom: 8 }}>{error}</p>}
            <button
              type="submit"
              style={{
                width: '100%',
                padding: '0.75rem',
                backgroundColor: '#4CAF50',
                color: 'white',
                border: 'none',
                cursor: 'pointer',
                fontWeight: 600
              }}
            >
              Add Property
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
