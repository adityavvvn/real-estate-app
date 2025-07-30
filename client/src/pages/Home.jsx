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
    maxPrice: ''
  });

  useEffect(() => {
    fetchProperties();
  }, []);

  const fetchProperties = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filters.city) params.append('city', filters.city);
      if (filters.minPrice) params.append('minPrice', filters.minPrice);
      if (filters.maxPrice) params.append('maxPrice', filters.maxPrice);

      const response = await axios.get(`${import.meta.env.VITE_API_URL}/properties?${params}`);
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
    setFilters({ city: '', minPrice: '', maxPrice: '' });
    fetchProperties();
  };

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
          </div>
        </section>

        {/* Filters Section */}
        <section className="filters-section">
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
                
                <div className="form-group">
                  <label className="form-label">Min Price</label>
                  <input
                    type="number"
                    name="minPrice"
                    value={filters.minPrice}
                    onChange={handleFilterChange}
                    placeholder="Min price"
                    className="form-input"
                  />
                </div>
                
                <div className="form-group">
                  <label className="form-label">Max Price</label>
                  <input
                    type="number"
                    name="maxPrice"
                    value={filters.maxPrice}
                    onChange={handleFilterChange}
                    placeholder="Max price"
                    className="form-input"
                  />
                </div>
              </div>
              
              <div className="filters-actions">
                <button type="submit" className="btn btn-primary">
                  🔍 Search Properties
                </button>
                <button type="button" onClick={clearFilters} className="btn btn-outline">
                  🗑️ Clear Filters
                </button>
              </div>
            </form>
          </div>
        </section>

        {/* Properties Section */}
        <section className="properties-section">
          <div className="section-header">
            <h2 className="heading-2">
              {loading ? 'Loading Properties...' : `Found ${properties.length} Properties`}
            </h2>
            {!loading && properties.length === 0 && (
              <p className="text-muted text-center">
                No properties found matching your criteria. Try adjusting your filters.
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
    </div>
  );
};

export default Home;
