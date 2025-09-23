import React, { useState, useEffect } from 'react';
import axios from 'axios';
import PropertyCard from '../components/PropertyCard';
import './Home.css';

const Home = () => {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    city: '',
    minPrice: '',
    maxPrice: '',
    bhk: '',
    area: '',
    suggestNearby: true,
    radiusKm: 5,
    lat: '',
    lng: ''
  });
  const [suggested, setSuggested] = useState(false);
  const [useCustomRadius, setUseCustomRadius] = useState(false);
  const [detectedCity, setDetectedCity] = useState('');
  const PRICE_MIN = 0;
  const PRICE_MAX = 100000;
  const PRICE_STEP = 100;

  useEffect(() => {
    fetchProperties();
  }, []);

  const fetchProperties = async () => {
    try {
      setLoading(true);
      setSuggested(false);
      const params = new URLSearchParams();
      if (filters.city) params.append('city', filters.city);
      if (filters.minPrice) params.append('minPrice', filters.minPrice);
      if (filters.maxPrice) params.append('maxPrice', filters.maxPrice);
      if (filters.bhk) params.append('bhk', filters.bhk);
      if (filters.area) params.append('area', filters.area);
      if (filters.suggestNearby) params.append('suggestNearby', 'true');
      if (filters.radiusKm) params.append('radiusKm', String(filters.radiusKm));
      if (filters.lat && filters.lng) {
        params.append('lat', filters.lat);
        params.append('lng', filters.lng);
        // Always restrict to nearby results when coordinates are provided
        params.append('nearbyOnly', 'true');
      }

      const response = await axios.get(`${import.meta.env.VITE_API_URL}/properties?${params}`);
      if (response.headers && (response.headers['x-suggested'] === 'true' || response.headers['X-Suggested'] === 'true')) {
        setSuggested(true);
      }
      setProperties(response.data);
    } catch (error) {
      console.error('Error fetching properties:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFilterSubmit = (e) => {
    e.preventDefault();
    fetchProperties();
  };

  const clearFilters = () => {
    setFilters({ city: '', minPrice: '', maxPrice: '', bhk: '', area: '', suggestNearby: true, radiusKm: 5, lat: '', lng: '' });
    fetchProperties();
  };

  const scrollWithOffset = (elementId) => {
    const el = document.getElementById(elementId);
    if (!el) return;
    const navbarOffset = 80; // account for sticky navbar height
    const y = el.getBoundingClientRect().top + window.pageYOffset - navbarOffset;
    window.scrollTo({ top: y, behavior: 'smooth' });
  };

  const scrollToFilters = () => scrollWithOffset('filters-section');

  const scrollToProperties = () => scrollWithOffset('properties-section');

  return (
    <div className="home-page">
      <div className="container">
        {/* Hero Section */}
        <section className="hero-section">
          <div className="hero-content">
            <h1 className="heading-1 text-center">
              Find Your Dream Property
            </h1>
            <p className="hero-subtitle text-center">
              Discover amazing properties in your favorite locations with our comprehensive real estate platform
            </p>
            <div className="hero-actions">
              <button type="button" className="cta-btn cta-primary" onClick={scrollToFilters}>🔎 Search Now</button>
              <button type="button" className="cta-btn cta-ghost" onClick={scrollToProperties}>🏡 Explore Properties</button>
            </div>
          </div>
        </section>

        {/* Filters Section */}
        <section id="filters-section" className="filters-section">
          <div className="card">
            <h2 className="heading-3 mb-3">Search Properties</h2>
            <form onSubmit={handleFilterSubmit} className="filters-form">
              <div className="grid grid-3">
                <div className="form-group">
                  <label className="form-label">City</label>
                  <input
                    type="text"
                    name="city"
                    value={filters.city}
                    onChange={handleFilterChange}
                    placeholder="Enter city name"
                    className="form-input"
                  />
                </div>
                
                <div className="form-group" style={{ gridColumn: 'span 2' }}>
                  <label className="form-label">Price Range</label>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {(() => {
                      const effectiveMin = Number.isFinite(Number(filters.minPrice)) && filters.minPrice !== '' ? Number(filters.minPrice) : PRICE_MIN;
                      const effectiveMax = Number.isFinite(Number(filters.maxPrice)) && filters.maxPrice !== '' ? Number(filters.maxPrice) : PRICE_MAX;
                      return (
                        <>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span>Min: ₹{effectiveMin}</span>
                            <span>Max: ₹{effectiveMax === PRICE_MAX && (filters.maxPrice === '' || filters.maxPrice === undefined) ? 'Any' : effectiveMax}</span>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                            <input
                              type="range"
                              min={String(PRICE_MIN)}
                              max={String(PRICE_MAX - PRICE_STEP)}
                              step={String(PRICE_STEP)}
                              value={effectiveMin}
                              onChange={(e) => {
                                const raw = Number(e.target.value);
                                const newMin = Math.min(raw, (Number.isFinite(effectiveMax) ? effectiveMax : PRICE_MAX) - PRICE_STEP);
                                setFilters(prev => ({ ...prev, minPrice: newMin }));
                              }}
                              style={{ flex: 1 }}
                            />
                            <input
                              type="range"
                              min={String(PRICE_MIN + PRICE_STEP)}
                              max={String(PRICE_MAX)}
                              step={String(PRICE_STEP)}
                              value={effectiveMax}
                              onChange={(e) => {
                                const raw = Number(e.target.value);
                                const newMax = Math.max(raw, (Number.isFinite(effectiveMin) ? effectiveMin : PRICE_MIN) + PRICE_STEP);
                                setFilters(prev => ({ ...prev, maxPrice: newMax }));
                              }}
                              style={{ flex: 1 }}
                            />
                          </div>
                        </>
                      );
                    })()}
                  </div>
                </div>
              </div>

              <div className="grid grid-3" style={{ marginTop: 12 }}>
                <div className="form-group">
                  <label className="form-label">BHK</label>
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    {['', '1', '2', '3', '4'].map((val) => (
                      <button
                        key={val || 'any'}
                        type="button"
                        onClick={() => setFilters(prev => ({ ...prev, bhk: val }))}
                        className="btn"
                        style={{
                          backgroundColor: (filters.bhk === val) ? '#2563eb' : 'transparent',
                          color: (filters.bhk === val) ? '#fff' : 'inherit',
                          border: '1px solid #2563eb'
                        }}
                      >
                        {val ? `${val} BHK` : 'Any'}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Area / Locality</label>
                  <input
                    type="text"
                    name="area"
                    value={filters.area}
                    onChange={handleFilterChange}
                    placeholder="Enter area name"
                    className="form-input"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Suggest nearby if none</label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <input type="checkbox" name="suggestNearby" checked={filters.suggestNearby} onChange={(e) => setFilters(prev => ({ ...prev, suggestNearby: e.target.checked }))} />
                    Enable
                  </label>
                </div>
              </div>

              <div className="grid grid-3" style={{ marginTop: 12 }}>
                <div className="form-group">
                  <label className="form-label">Radius (km)</label>
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    {[1, 2, 5, 10, 20].map((r) => (
                      <button
                        key={r}
                        type="button"
                        onClick={() => { setUseCustomRadius(false); setFilters(prev => ({ ...prev, radiusKm: r })); }}
                        className="btn"
                        style={{
                          backgroundColor: (!useCustomRadius && Number(filters.radiusKm) === r) ? '#2563eb' : 'transparent',
                          color: (!useCustomRadius && Number(filters.radiusKm) === r) ? '#fff' : 'inherit',
                          border: '1px solid #2563eb'
                        }}
                      >
                        {r} km
                      </button>
                    ))}
                    <button
                      type="button"
                      onClick={() => setUseCustomRadius(true)}
                      className="btn"
                      style={{
                        backgroundColor: useCustomRadius ? '#2563eb' : 'transparent',
                        color: useCustomRadius ? '#fff' : 'inherit',
                        border: '1px solid #2563eb'
                      }}
                    >
                      Custom
                    </button>
                  </div>
                  {useCustomRadius && (
                    <input
                      type="number"
                      name="radiusKm"
                      min="1"
                      value={filters.radiusKm}
                      onChange={handleFilterChange}
                      className="form-input"
                      style={{ marginTop: 8 }}
                    />
                  )}
                </div>
              </div>

              <div className="form-group" style={{ marginTop: 8 }}>
                <button type="button" className="cta-btn cta-ghost" onClick={() => {
                  if (navigator.geolocation) {
                    navigator.geolocation.getCurrentPosition((pos) => {
                      const lat = String(pos.coords.latitude);
                      const lng = String(pos.coords.longitude);
                      setFilters(prev => ({ ...prev, lat, lng }));
                      // Reverse geocode to get city label
                      fetch(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}`)
                        .then(r => r.json())
                        .then(data => {
                          const addr = data && data.address ? data.address : {};
                          const cityLike = addr.city || addr.town || addr.village || addr.suburb || addr.hamlet || '';
                          const stateLike = addr.state || addr.county || addr.country_code?.toUpperCase() || '';
                          const label = cityLike ? `${cityLike}${stateLike ? ', ' + stateLike : ''}` : (addr.display_name || '');
                          setDetectedCity(label);
                        })
                        .catch(() => setDetectedCity(''));
                    });
                  }
                }}>📍 Use my location</button>
                {detectedCity && (
                  <div className="text-muted" style={{ marginTop: 6, fontSize: 13 }}>
                    Detected: {detectedCity}
                  </div>
                )}
              </div>
              
              <div className="filters-actions">
                <button type="submit" className="cta-btn cta-primary">
                  🔍 Search Properties
                </button>
                <button type="button" onClick={clearFilters} className="cta-btn cta-ghost">
                  🗑️ Clear Filters
                </button>
              </div>
            </form>
          </div>
        </section>

        {/* Properties Section */}
        <section id="properties-section" className="properties-section">
          <div className="section-header">
            <h2 className="heading-2">
              {loading ? 'Loading Properties...' : `Found ${properties.length} Properties`}
            </h2>
            {!loading && properties.length === 0 && (
              <p className="text-muted text-center">
                No properties found matching your criteria. Try adjusting your filters.
              </p>
            )}
            {!loading && suggested && properties.length > 0 && (
              <p className="text-muted text-center">
                Showing nearby suggestions within {filters.radiusKm} km.
              </p>
            )}
          </div>

          {loading ? (
            <div className="loading-container">
              <div className="loading-spinner"></div>
              <p>Loading properties...</p>
            </div>
          ) : (
            <div className="properties-grid">
              {properties.map(property => (
                <PropertyCard key={property._id} property={property} />
              ))}
            </div>
          )}
        </section>
      </div>
      <button
        type="button"
        className="scroll-to-properties"
        onClick={scrollToProperties}
        aria-label="Scroll to properties"
        title="Scroll to properties"
      >
        ↓
      </button>
    </div>
  );
};

export default Home;
