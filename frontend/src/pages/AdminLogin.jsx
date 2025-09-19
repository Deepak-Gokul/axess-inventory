import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { adminLogin } from '../utils/api.js';
import { FiEye,FiEyeOff } from "react-icons/fi";

const AdminLogin = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const location = useLocation();

  const params = new URLSearchParams(location.search);
  const redirect = params.get("redirect");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const res = await adminLogin(email, password); // login sets HttpOnly cookie and returns role
      const role = res.data.role;
      if (role === 'admin') {
        // Allow admin to access /item or /item/*
        if (redirect && (redirect === '/item' || redirect.startsWith('/item'))) {
          navigate(redirect);
          return;
        }
        setError('Normal admin cannot access dashboard.');
        return;
      }
      if (redirect) {
        navigate(redirect);
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
        console.log(err)
      setError(err.response?.data?.error || 'Login failed');
      console.log(error)
      console.log(err.response?.data)
      console.log(err.response?.data?.error)
    }
  };

  return (
    <div className="min-h-screen flex flex-col gap-5 items-center justify-center bg-gray-100">
        <h1 className='text-4xl font-extrabold'>Axess Inventory</h1>
      <form onSubmit={handleSubmit} className="bg-white p-8 rounded shadow-md w-80">
        <h2 className="text-2xl font-bold mb-6 text-center">Admin Login</h2>
        {error && <div className="text-red-500 mb-4">{error}</div>}
        <div className="mb-4">
          <label className="block mb-1 font-semibold">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full border px-3 py-2 rounded"
          />
        </div>
        <div className="mb-4 relative">
          <label className="block mb-1 font-semibold">Password</label>
          <div className='flex items-center'>
          <input
            type={showPassword ? 'text' : 'password'}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full border px-3 py-2 rounded"
          />
          <button
            type="button"
            aria-label={showPassword ? "Hide password" : "Show password"}
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-2 cursor-pointer text-sm text-gray-600"
          >
            {showPassword ? <FiEye />: <FiEyeOff/>}
          </button>
        </div>
        </div>
        <button
          type="submit"
          className="w-full cursor-pointer bg-blue-500 text-white py-2 rounded hover:bg-blue-600 transition"
        >
          Login
        </button>
      </form>
    </div>
  );
};

export default AdminLogin;