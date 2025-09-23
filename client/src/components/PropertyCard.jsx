import React, { useMemo, useState } from 'react';
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

  const allImages = useMemo(() => {
    const list = [];
    const primary = property.image || '';
    if (primary) list.push(primary);
    if (Array.isArray(property.images)) {
      for (const url of property.images) {
        if (url && !list.includes(url)) list.push(url);
      }
    }
    if (list.length === 0) list.push('/placeholder-property.jpg');
    return list;
  }, [property.image, property.images]);

  const [activeIdx, setActiveIdx] = useState(0);
  const mainImage = allImages[activeIdx] || '/placeholder-property.jpg';
  const hasCarousel = allImages.length > 1;
  const go = (dir) => {
    setActiveIdx((i) => (i + dir + allImages.length) % allImages.length);
  };

  return (
    <div className="property-card">
      <div className="property-image">
        <img 
          src={mainImage} 
          alt={property.title}
          loading="lazy"
          decoding="async"
          fetchpriority="low"
          onError={(e) => {
            e.target.src = 'https://via.placeholder.com/400x300/667eea/ffffff?text=Property+Image';
          }}
        />
        {hasCarousel && (
          <>
            <button className="carousel-btn prev" type="button" onClick={(e) => { e.preventDefault(); e.stopPropagation(); go(-1); }} aria-label="Previous image">‹</button>
            <button className="carousel-btn next" type="button" onClick={(e) => { e.preventDefault(); e.stopPropagation(); go(1); }} aria-label="Next image">›</button>
            <div className="carousel-dots">
              {allImages.map((_, idx) => (
                <button
                  key={idx}
                  type="button"
                  className={`dot ${idx === activeIdx ? 'active' : ''}`}
                  onClick={(e) => { e.preventDefault(); e.stopPropagation(); setActiveIdx(idx); }}
                  aria-label={`Go to image ${idx + 1}`}
                />
              ))}
            </div>
          </>
        )}
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
