import { useEffect, useState } from 'react';
import axios from 'axios';
import PropertyCard from '../components/PropertyCard';

function Properties() {
  const [properties, setProperties] = useState([]);
  const [city, setCity] = useState('');

  const loadProperties = async () => {
    try {
      const url = city
        ? `${import.meta.env.VITE_API_URL}/properties?city=${city}`
        : `${import.meta.env.VITE_API_URL}/properties`;
      const res = await axios.get(url);
      setProperties(res.data);
    } catch (err) {
      console.error('Failed to load properties', err);
    }
  };

  useEffect(() => {
    loadProperties();
  }, [city]);

  return (
    <div style={{ padding: '2rem' }}>
      <h2 style={{ textAlign: 'center' }}>🏠 Explore Properties</h2>
      
      <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
        <input
          type="text"
          placeholder="Search by city (e.g., Bangalore)"
          value={city}
          onChange={(e) => setCity(e.target.value)}
          style={{
            padding: '0.5rem 1rem',
            width: '250px',
            borderRadius: '5px',
            border: '1px solid #aaa',
            fontSize: '1rem',
          }}
        />
      </div>

      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'center',
        }}
      >
        {properties.length > 0 ? (
          properties.map((p) => (
            <PropertyCard key={p._id} property={p} />
          ))
        ) : (
          <p style={{ textAlign: 'center' }}>No properties found.</p>
        )}
      </div>
    </div>
  );
}

export default Properties;
