import React from 'react';
import { Link } from 'react-router-dom';
import './PropertyCard.css';

const PropertyCard = ({ property }) => {
  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
    }).format(price);
  };

  return (
    <div className="property-card">
      <div className="property-image">
        <img 
          src={property.image || '/placeholder-property.jpg'} 
          alt={property.title}
          loading="lazy"
          decoding="async"
          fetchpriority="low"
          onError={(e) => {
            e.target.src = 'https://via.placeholder.com/400x300/667eea/ffffff?text=Property+Image';
          }}
        />
        <div className="property-overlay">
          <div className="property-status">
            {property.available ? (
              <span className="status-available">Available</span>
            ) : (
              <span className="status-unavailable">Unavailable</span>
            )}
          </div>
        </div>
      </div>
      
      <div className="property-content">
        <h3 className="property-title">{property.title}</h3>
        <p className="property-location">📍 {property.city}</p>
        <p className="property-description">{property.description}</p>
        
        <div className="property-footer">
          <div className="property-price">
            <span className="price-label">Price</span>
            <span className="price-value">{formatPrice(property.price)}</span>
          </div>
          
          <Link to={`/property/${property._id}`} className="btn btn-primary">
            View Details
          </Link>
        </div>
      </div>
    </div>
  );
};

export default React.memo(PropertyCard);
