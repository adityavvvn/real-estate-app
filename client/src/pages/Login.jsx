import React from 'react';
import { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import '../styles/AuthPage.css';


function Login() {
  const [form, setForm] = useState({ email: '', password: '' });
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
        <h2>Login</h2>
        <input
          type="email"
          placeholder="Email"
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
          
          required
        />
        <button type="submit">Login</button>
      </form>
    </div>
  );
}

export default Login;
