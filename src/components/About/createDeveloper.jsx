import React, { useState, useContext } from 'react';
import axios from 'axios';
import { useNavigate, Navigate } from 'react-router-dom';
import { Context } from '../../main';
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import './createDeveloper.css';

const CreateDeveloper = () => {
  const { isAuthorized, BACKEND_URL } = useContext(Context);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [developerData, setDeveloperData] = useState({
    name: '',
    image: '',
    roll: '',
    dept: ''
  });

  if (!isAuthorized) {
    return <Navigate to="/login" />;
  }

  const authAxios = axios.create({
    baseURL: BACKEND_URL,
    withCredentials: true,
  });

  authAxios.interceptors.request.use(config => {
    const token = document.cookie.split('; ').find(row => row.startsWith('token='))?.split('=')[1];
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setDeveloperData({
      ...developerData,
      [name]: value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data } = await authAxios.post('/api/dev_team', developerData, {
        headers: {
          "Content-Type": "application/json",
        }
      });

      toast.success(data.message || "Developer created successfully!");
      setDeveloperData({
        name: '',
        image: '',
        roll: '',
        dept: ''
      });

      setTimeout(() => navigate('/about_us'), 1000);
      
    } catch (error) {
      console.error("Creation error:", error);
      toast.error(
        error.response?.data?.message || "Failed to create developer"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="create-developer-container">
      <ToastContainer />
      <h1>Create Developer</h1>
      <form onSubmit={handleSubmit} className="create-developer-form">
        <div className="form-group">
          <label htmlFor="name">Name:</label>
          <input
            type="text"
            id="name"
            name="name"
            value={developerData.name}
            onChange={handleChange}
            required
            disabled={loading}
          />
        </div>

        <div className="form-group">
          <label htmlFor="image">Image URL:</label>
          <input
            type="text"
            id="image"
            name="image"
            value={developerData.image}
            onChange={handleChange}
            required
            disabled={loading}
          />
        </div>

        <div className="form-group">
          <label htmlFor="roll">Roll:</label>
          <input
            type="text"
            id="roll"
            name="roll"
            value={developerData.roll}
            onChange={handleChange}
            required
            disabled={loading}
          />
        </div>

        <div className="form-group">
          <label htmlFor="dept">Department:</label>
          <input
            type="text"
            id="dept"
            name="dept"
            value={developerData.dept}
            onChange={handleChange}
            required
            disabled={loading}
          />
        </div>

        <button 
          type="submit" 
          className="submit-button"
          disabled={loading}
        >
          {loading ? 'Creating...' : 'Create Developer'}
        </button>
      </form>
    </div>
  );
};

export default CreateDeveloper;