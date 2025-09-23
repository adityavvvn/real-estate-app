import React from 'react';
import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './AddProperty.css';

export default function AddProperty() {
  const navigate = useNavigate();
  const mapRef = useRef(null);
  const markerRef = useRef(null);
  const mapInitializedRef = useRef(false);
  const [locating, setLocating] = useState(false);
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

  // Initialize Leaflet map once
  useEffect(() => {
    if (typeof window === 'undefined' || !window.L) return;
    if (mapInitializedRef.current) return;

    const L = window.L;
    const initialLat = form.lat ? Number(form.lat) : 20.5937; // India approx center
    const initialLng = form.lng ? Number(form.lng) : 78.9629;

    const map = L.map('add-map', {
      center: [initialLat, initialLng],
      zoom: form.lat && form.lng ? 14 : 5,
      scrollWheelZoom: false
    });
    mapRef.current = map;

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors'
    }).addTo(map);

    const marker = L.marker([initialLat, initialLng], { draggable: true }).addTo(map);
    markerRef.current = marker;

    marker.on('dragend', () => {
      const pos = marker.getLatLng();
      setForm(prev => ({ ...prev, lat: String(pos.lat.toFixed(6)), lng: String(pos.lng.toFixed(6)) }));
    });

    map.on('click', (e) => {
      marker.setLatLng(e.latlng);
      setForm(prev => ({ ...prev, lat: String(e.latlng.lat.toFixed(6)), lng: String(e.latlng.lng.toFixed(6)) }));
    });

    mapInitializedRef.current = true;
  }, [form.lat, form.lng]);

  // Keep map and marker in sync when lat/lng fields change or when using geolocation
  useEffect(() => {
    if (!mapInitializedRef.current || !mapRef.current || !markerRef.current) return;
    const latNum = Number(form.lat);
    const lngNum = Number(form.lng);
    if (!Number.isFinite(latNum) || !Number.isFinite(lngNum)) return;
    const current = markerRef.current.getLatLng();
    if (Math.abs(current.lat - latNum) > 1e-6 || Math.abs(current.lng - lngNum) > 1e-6) {
      markerRef.current.setLatLng([latNum, lngNum]);
      mapRef.current.setView([latNum, lngNum], Math.max(mapRef.current.getZoom(), 14));
    }
  }, [form.lat, form.lng]);

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
            <div id="add-map" className="map-container" />
            <button
              type="button"
              onClick={async () => {
                if (!navigator.geolocation) {
                  setError('Geolocation is not supported by your browser.');
                  return;
                }
                setLocating(true);
                const getPosition = (options) => new Promise((resolve, reject) => {
                  navigator.geolocation.getCurrentPosition(resolve, reject, options);
                });
                try {
                  // Try high-accuracy first
                  const pos = await getPosition({ enableHighAccuracy: true, timeout: 15000, maximumAge: 0 });
                  const { latitude, longitude, accuracy } = pos.coords;
                  setForm(prev => ({ ...prev, lat: String(latitude), lng: String(longitude) }));
                  // If accuracy is poor (>100m), try a quick fallback without high accuracy
                  if (accuracy && accuracy > 100) {
                    try {
                      const pos2 = await getPosition({ enableHighAccuracy: false, timeout: 5000, maximumAge: 0 });
                      const { latitude: lat2, longitude: lng2 } = pos2.coords;
                      setForm(prev => ({ ...prev, lat: String(lat2), lng: String(lng2) }));
                    } catch {}
                  }
                } catch (err) {
                  // Fallback attempt (non high-accuracy)
                  try {
                    const pos = await getPosition({ enableHighAccuracy: false, timeout: 7000, maximumAge: 0 });
                    const { latitude, longitude } = pos.coords;
                    setForm(prev => ({ ...prev, lat: String(latitude), lng: String(longitude) }));
                  } catch (err2) {
                    setError('Unable to detect precise location. Please check permissions and GPS.');
                  }
                } finally {
                  setLocating(false);
                }
              }}
              className="btn-outline"
              disabled={locating}
            >{locating ? '📍 Locating…' : '📍 Use my location'}</button>

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
