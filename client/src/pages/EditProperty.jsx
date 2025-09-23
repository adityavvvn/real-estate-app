import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import './EditProperty.css';

function EditProperty() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState({ title: '', city: '', price: '', bhk: '', areaName: '', lat: '', lng: '', description: '', image: '', images: '', available: true });
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
          bhk: (typeof res.data.bhk === 'number' ? String(res.data.bhk) : ''),
          areaName: res.data.areaName || '',
          lat: res.data.location && Array.isArray(res.data.location.coordinates) ? String(res.data.location.coordinates[1]) : '',
          lng: res.data.location && Array.isArray(res.data.location.coordinates) ? String(res.data.location.coordinates[0]) : '',
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
      const payload = {
        title: form.title,
        city: form.city,
        price: form.price,
        bhk: form.bhk ? Number(form.bhk) : undefined,
        areaName: form.areaName || undefined,
        description: form.description,
        image: form.image,
        images: imagesArr,
        available: form.available,
      };
      if (form.lat && form.lng) {
        const latNum = Number(form.lat);
        const lngNum = Number(form.lng);
        if (Number.isFinite(latNum) && Number.isFinite(lngNum)) {
          payload.location = { type: 'Point', coordinates: [lngNum, latNum] };
        }
      }
      await axios.put(`${import.meta.env.VITE_API_URL}/properties/${id}`, payload, {
        headers: { Authorization: `Bearer ${token}` }
      });
      navigate('/my-properties');
    } catch (err) {
      setError('Failed to update property');
    }
  };

  if (loading) return <p className="text-center">Loading...</p>;
  if (error) return <p className="text-center" style={{ color: 'red' }}>{error}</p>;

  return (
    <div className="edit-property-page">
      <div className="container">
        <h1 className="heading-1 text-center mb-4">Edit Property</h1>
        <div className="card edit-card">
          <form className="edit-form" onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label" htmlFor="title">Title</label>
              <input id="title" className="form-input" name="title" value={form.title} onChange={handleChange} required />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="city">City</label>
              <input id="city" className="form-input" name="city" value={form.city} onChange={handleChange} required />
            </div>

            <div className="grid grid-2">
              <div className="form-group">
                <label className="form-label" htmlFor="bhk">BHK</label>
                <input id="bhk" className="form-input" name="bhk" type="number" value={form.bhk} onChange={handleChange} />
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="price">Price</label>
                <input id="price" className="form-input" name="price" type="number" value={form.price} onChange={handleChange} required />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="areaName">Area / Locality</label>
              <input id="areaName" className="form-input" name="areaName" value={form.areaName} onChange={handleChange} />
            </div>

            <div className="grid grid-2">
              <div className="form-group">
                <label className="form-label" htmlFor="lat">Latitude</label>
                <input id="lat" className="form-input" name="lat" type="number" value={form.lat} onChange={handleChange} />
              </div>
              <div className="form-group">
                <label className="form-label" htmlFor="lng">Longitude</label>
                <input id="lng" className="form-input" name="lng" type="number" value={form.lng} onChange={handleChange} />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="description">Description</label>
              <textarea id="description" className="form-input form-textarea" name="description" value={form.description} onChange={handleChange} required />
            </div>

            {form.image && (
              <div className="form-group">
                <img className="image-preview" src={form.image} alt="Property" />
              </div>
            )}

            <div className="form-group">
              <label className="form-label" htmlFor="image">Main Image URL</label>
              <input id="image" className="form-input" name="image" value={form.image} onChange={handleChange} required />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="images">Additional image URLs (one per line)</label>
              <textarea
                id="images"
                className="form-input form-textarea"
                name="images"
                placeholder="https://...\nhttps://..."
                value={form.images}
                onChange={handleChange}
              />
            </div>

            <div className="form-group available-row">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  name="available"
                  checked={form.available}
                  onChange={handleChange}
                />
                <span>Available</span>
              </label>
            </div>

            <button type="submit" className="btn btn-primary submit-btn">Update Property</button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default EditProperty; 