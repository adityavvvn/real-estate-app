import React from 'react';
import { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import '../styles/AuthPage.css';

function Register() {
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: ''
  });
  const [showPassword, setShowPassword] = useState(false);

  const navigate = useNavigate();

  const register = async (e) => {
    e.preventDefault();
    try {
      await axios.post(`${import.meta.env.VITE_API_URL}/auth/register`, form);
      alert('Registration successful! Please login.');
      navigate('/login');
    } catch (err) {
      alert('Registration failed: ' + err.response?.data?.error || err.message);
    }
  };

  return (
    <div className="auth-container">  
      <form className="auth-box" onSubmit={register}>
        <div className="auth-header">
          <h2 className="auth-title">Create your account</h2>
          <p className="auth-subtitle">Join to list and explore properties</p>
        </div>

        <div className="input-group">
          <label className="input-label" htmlFor="name">Name</label>
          <div className="input-wrapper">
            <input
              id="name"
              className="auth-input"
              type="text"
              placeholder="Jane Doe"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
            />
          </div>
        </div>

        <div className="input-group">
          <label className="input-label" htmlFor="email">Email</label>
          <div className="input-wrapper">
            <input
              id="email"
              className="auth-input"
              type="email"
              placeholder="you@example.com"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              required
            />
          </div>
        </div>

        <div className="input-group">
          <label className="input-label" htmlFor="password">Password</label>
          <div className="input-wrapper">
            <input
              id="password"
              className="auth-input"
              type={showPassword ? 'text' : 'password'}
              placeholder="••••••••"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              required
            />
            <button
              type="button"
              className="password-toggle"
              onClick={() => setShowPassword((v) => !v)}
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? 'Hide' : 'Show'}
            </button>
          </div>
        </div>

        <button className="auth-button" type="submit">Create account</button>

        <div className="auth-footer">
          <span>Already have an account? </span>
          <Link className="auth-link" to="/login">Sign in</Link>
        </div>
      </form>
    </div>
  );
}

export default Register;
