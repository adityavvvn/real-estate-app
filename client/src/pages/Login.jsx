import React from 'react';
import { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import '../styles/AuthPage.css';


function Login() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const login = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(`${import.meta.env.VITE_API_URL}/auth/login`, form);
      localStorage.setItem('token', res.data.token);
      alert('Login successful!');
      navigate('/');
    } catch (err) {
      alert('Login failed: ' + err.response?.data?.error || err.message);
    }
  };

  return (
    <div className="auth-container">
      <form className="auth-box" onSubmit={login}>
        <div className="auth-header">
          <h2 className="auth-title">Welcome back</h2>
          <p className="auth-subtitle">Sign in to continue</p>
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

        <button className="auth-button" type="submit">Sign in</button>

        <div className="auth-footer">
          <span>Don't have an account? </span>
          <Link className="auth-link" to="/register">Create one</Link>
        </div>
      </form>
    </div>
  );
}

export default Login;
