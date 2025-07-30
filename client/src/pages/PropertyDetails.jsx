import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import './PropertyDetails.css';

const PropertyDetails = () => {
  const { id } = useParams();
  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [cityCoords, setCityCoords] = useState([20.5937, 78.9629]); // Default to India
  const [activeTab, setActiveTab] = useState('details');
  const [contactForm, setContactForm] = useState({
    name: '',
    email: '',
    message: ''
  });
  const [bookingForm, setBookingForm] = useState({
    name: '',
    email: '',
    date: '',
    time: '',
    message: ''
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchProperty();
  }, [id]);

  const fetchProperty = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/properties/${id}`);
      setProperty(res.data);
      
      if (res.data.city) {
        try {
          const geo = await axios.get(`https://nominatim.openstreetmap.org/search`, {
            params: {
              q: res.data.city,
              format: 'json',
              limit: 1
            },
            headers: { 
              'Accept-Language': 'en', 
              'User-Agent': 'RealEstateApp/1.0' 
            }
          });
          if (geo.data && geo.data.length > 0) {
            setCityCoords([parseFloat(geo.data[0].lat), parseFloat(geo.data[0].lon)]);
          }
        } catch (geoError) {
          console.warn('Geocoding failed, using fallback coordinates:', geoError);
          const fallbackCoords = {
            'mumbai': [19.0760, 72.8777],
            'delhi': [28.7041, 77.1025],
            'bangalore': [12.9716, 77.5946],
            'hyderabad': [17.3850, 78.4867],
            'chennai': [13.0827, 80.2707],
            'kolkata': [22.5726, 88.3639],
            'pune': [18.5204, 73.8567],
            'ahmedabad': [23.0225, 72.5714],
            'jaipur': [26.9124, 75.7873],
            'lucknow': [26.8467, 80.9462]
          };
          const cityName = res.data.city.toLowerCase();
          for (const [city, coords] of Object.entries(fallbackCoords)) {
            if (cityName.includes(city.toLowerCase()) || city.toLowerCase().includes(cityName)) {
              setCityCoords(coords);
              break;
            }
          }
        }
      }
    } catch (error) {
      console.error('Error fetching property:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleContactSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await axios.post(`${import.meta.env.VITE_API_URL}/properties/${id}/contact`, contactForm);
      alert('Contact message sent successfully!');
      setContactForm({ name: '', email: '', message: '' });
    } catch (error) {
      console.error('Error sending contact message:', error);
      alert('Failed to send message. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleBookingSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await axios.post(`${import.meta.env.VITE_API_URL}/properties/${id}/book`, bookingForm);
      alert('Booking request sent successfully!');
      setBookingForm({ name: '', email: '', date: '', time: '', message: '' });
    } catch (error) {
      console.error('Error sending booking request:', error);
      alert('Failed to send booking request. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
    }).format(price);
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading property details...</p>
      </div>
    );
  }

  if (!property) {
    return (
      <div className="error-container">
        <h2>Property not found</h2>
        <p>The property you're looking for doesn't exist.</p>
      </div>
    );
  }

  return (
    <div className="property-details-page">
      <div className="container">
        {/* Hero Section */}
        <section className="property-hero">
          <div className="property-image-container">
            <img 
              src={property.image || 'https://via.placeholder.com/800x400/667eea/ffffff?text=Property+Image'} 
              alt={property.title}
              className="property-hero-image"
            />
            <div className="property-status-badge">
              {property.available ? (
                <span className="status-available">Available</span>
              ) : (
                <span className="status-unavailable">Unavailable</span>
              )}
            </div>
          </div>
        </section>

        {/* Property Info */}
        <section className="property-info">
          <div className="grid grid-2">
            <div className="property-main-info">
              <h1 className="heading-1">{property.title}</h1>
              <p className="property-location">📍 {property.city}</p>
              <p className="property-description">{property.description}</p>
              <div className="property-price">
                <span className="price-label">Price</span>
                <span className="price-value">{formatPrice(property.price)}</span>
              </div>
            </div>
            
            <div className="property-actions">
              <div className="action-buttons">
                <button 
                  className={`btn ${activeTab === 'details' ? 'btn-primary' : 'btn-outline'}`}
                  onClick={() => setActiveTab('details')}
                >
                  📋 Details
                </button>
                <button 
                  className={`btn ${activeTab === 'contact' ? 'btn-primary' : 'btn-outline'}`}
                  onClick={() => setActiveTab('contact')}
                >
                  📞 Contact
                </button>
                <button 
                  className={`btn ${activeTab === 'book' ? 'btn-primary' : 'btn-outline'}`}
                  onClick={() => setActiveTab('book')}
                >
                  📅 Book Viewing
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Tab Content */}
        <section className="tab-content">
          {activeTab === 'details' && (
            <div className="card">
              <h2 className="heading-2">Property Details</h2>
              <div className="details-grid">
                <div className="detail-item">
                  <span className="detail-label">Title</span>
                  <span className="detail-value">{property.title}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">City</span>
                  <span className="detail-value">{property.city}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Price</span>
                  <span className="detail-value">{formatPrice(property.price)}</span>
                </div>
                <div className="detail-item">
                  <span className="detail-label">Status</span>
                  <span className={`detail-value ${property.available ? 'status-available' : 'status-unavailable'}`}>
                    {property.available ? 'Available' : 'Unavailable'}
                  </span>
                </div>
              </div>
              
              <div className="property-description-full">
                <h3 className="heading-3">Description</h3>
                <p>{property.description}</p>
              </div>
            </div>
          )}

          {activeTab === 'contact' && (
            <div className="card">
              <h2 className="heading-2">Contact Owner</h2>
              <form onSubmit={handleContactSubmit} className="contact-form">
                <div className="form-group">
                  <label className="form-label">Your Name</label>
                  <input
                    type="text"
                    value={contactForm.name}
                    onChange={(e) => setContactForm({...contactForm, name: e.target.value})}
                    className="form-input"
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Your Email</label>
                  <input
                    type="email"
                    value={contactForm.email}
                    onChange={(e) => setContactForm({...contactForm, email: e.target.value})}
                    className="form-input"
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Message</label>
                  <textarea
                    value={contactForm.message}
                    onChange={(e) => setContactForm({...contactForm, message: e.target.value})}
                    className="form-input form-textarea"
                    placeholder="Tell the owner about your interest in this property..."
                    required
                  />
                </div>
                <button type="submit" className="btn btn-primary" disabled={submitting}>
                  {submitting ? 'Sending...' : 'Send Message'}
                </button>
              </form>
            </div>
          )}

          {activeTab === 'book' && (
            <div className="card">
              <h2 className="heading-2">Book a Viewing</h2>
              <form onSubmit={handleBookingSubmit} className="booking-form">
                <div className="grid grid-2">
                  <div className="form-group">
                    <label className="form-label">Your Name</label>
                    <input
                      type="text"
                      value={bookingForm.name}
                      onChange={(e) => setBookingForm({...bookingForm, name: e.target.value})}
                      className="form-input"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Your Email</label>
                    <input
                      type="email"
                      value={bookingForm.email}
                      onChange={(e) => setBookingForm({...bookingForm, email: e.target.value})}
                      className="form-input"
                      required
                    />
                  </div>
                </div>
                <div className="grid grid-2">
                  <div className="form-group">
                    <label className="form-label">Preferred Date</label>
                    <input
                      type="date"
                      value={bookingForm.date}
                      onChange={(e) => setBookingForm({...bookingForm, date: e.target.value})}
                      className="form-input"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Preferred Time</label>
                    <input
                      type="time"
                      value={bookingForm.time}
                      onChange={(e) => setBookingForm({...bookingForm, time: e.target.value})}
                      className="form-input"
                    />
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Additional Message</label>
                  <textarea
                    value={bookingForm.message}
                    onChange={(e) => setBookingForm({...bookingForm, message: e.target.value})}
                    className="form-input form-textarea"
                    placeholder="Any specific requirements or questions..."
                  />
                </div>
                <button type="submit" className="btn btn-primary" disabled={submitting}>
                  {submitting ? 'Sending...' : 'Book Viewing'}
                </button>
              </form>
            </div>
          )}
        </section>

        {/* Map Section */}
        <section className="map-section">
          <div className="card">
            <h2 className="heading-2">Location</h2>
            <div className="map-container">
              <MapContainer 
                center={cityCoords} 
                zoom={13} 
                style={{ height: '400px', width: '100%' }}
              >
                <TileLayer
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                />
                <Marker position={cityCoords}>
                  <Popup>
                    <strong>{property.title}</strong><br />
                    {property.city}
                  </Popup>
                </Marker>
              </MapContainer>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default PropertyDetails; 