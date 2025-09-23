import React from 'react';
import { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './AddProperty.css';

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
    <div className="add-container">
      <form onSubmit={handleSubmit} className="add-card">
        <h2 className="add-title">Add Property</h2>
        <div className="add-subtitle">Required fields are marked with *</div>
        <div className="add-grid">
          {/* Left column: Basic Details */}
          <div>
            <h3 className="section-title">Basic Details</h3>
            <input
              type="text"
              name="title"
              placeholder="Title *"
              value={form.title}
              onChange={handleChange}
              required
              className="text-input"
            />
            <input
              type="number"
              name="price"
              placeholder="Price *"
              value={form.price}
              onChange={handleChange}
              required
              className="text-input"
            />
            <input
              type="text"
              name="city"
              placeholder="City *"
              value={form.city}
              onChange={handleChange}
              required
              className="text-input"
            />
            <div className="chips-group">
              <label className="chips-label">BHK</label>
              <div className="chips">
                {['', '1', '2', '3', '4'].map((val) => (
                  <button
                    key={val || 'any'}
                    type="button"
                    onClick={() => { setShowCustomBhk(false); setForm(prev => ({ ...prev, bhk: val })); }}
                    className={`chip ${form.bhk === val && !showCustomBhk ? 'chip-active' : ''}`}
                  >
                    {val ? `${val} BHK` : 'Any'}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => setShowCustomBhk(true)}
                  className={`chip ${showCustomBhk ? 'chip-active' : ''}`}
                >Custom</button>
              </div>
              {showCustomBhk && (
                <input
                  type="number"
                  name="bhk"
                  placeholder="Enter BHK"
                  value={form.bhk}
                  onChange={handleChange}
                  className="text-input"
                />
              )}
            </div>
            <input
              type="text"
              name="areaName"
              placeholder="Area / Locality (optional)"
              value={form.areaName}
              onChange={handleChange}
              className="text-input"
            />
            <label className="checkbox-row">
              <input
                type="checkbox"
                name="available"
                checked={form.available}
                onChange={handleChange}
                className="checkbox"
              />
              Available
            </label>
          </div>

          {/* Right column: Location, Images, Description */}
          <div>
            <h3 className="section-title">Location</h3>
            <div className="row-gap">
              <input
                type="number"
                name="lat"
                placeholder="Latitude (optional)"
                value={form.lat}
                onChange={handleChange}
                className="text-input flex-1"
              />
              <input
                type="number"
                name="lng"
                placeholder="Longitude (optional)"
                value={form.lng}
                onChange={handleChange}
                className="text-input flex-1"
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
              className="btn-outline"
            >📍 Use my location</button>

            <h3 className="section-title">Images</h3>
            <input
              type="text"
              name="image"
              placeholder="Image URL (main) *"
              value={form.image}
              onChange={handleChange}
              required
              className="text-input"
            />
            {form.image ? (
              <img src={form.image} alt="Main" className="preview-main" />
            ) : null}
            <textarea
              name="images"
              placeholder="Additional image URLs (one per line)"
              value={form.images}
              onChange={handleChange}
              className="textarea"
            />
            {form.images && form.images.split('\n').filter(Boolean).length > 0 && (
              <div className="preview-grid">
                {form.images.split('\n').map((u, idx) => u.trim()).filter(Boolean).slice(0, 6).map((url, i) => (
                  <img key={i} src={url} alt={`Img-${i}`} className="preview-thumb" />
                ))}
              </div>
            )}

            <h3 className="section-title">Description</h3>
            <textarea
              name="description"
              placeholder="Description *"
              value={form.description}
              onChange={handleChange}
              required
              className="textarea lg"
            />
          </div>

          {/* Full width actions */}
          <div className="actions">
            {error && <p className="error-text">{error}</p>}
            <button
              type="submit"
              className="btn-primary"
            >
              Add Property
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
