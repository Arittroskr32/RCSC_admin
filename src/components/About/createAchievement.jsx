import React, { useState, useContext } from 'react';
import axios from 'axios'; // Added missing axios import
import './createAchievement.css';
import { useNavigate, Navigate } from 'react-router-dom';
import { Context } from '../../main';
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const CreateAchievement = () => {
  const { isAuthorized, BACKEND_URL } = useContext(Context); // Added missing BACKEND_URL
  const navigate = useNavigate();
  const [achievementData, setAchievementData] = useState({
    title: '',
    description: ''
  });
  const [loading, setLoading] = useState(false);

  if (!isAuthorized) {
    return <Navigate to="/login" />;
  }

  // Moved authAxios inside the component to access BACKEND_URL
  const authAxios = axios.create({
    baseURL: BACKEND_URL,
    withCredentials: true,
  });

  // Add interceptor to include token from cookies
  authAxios.interceptors.request.use(config => {
    const token = document.cookie.split('; ').find(row => row.startsWith('token='))?.split('=')[1];
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setAchievementData({
      ...achievementData,
      [name]: value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data } = await authAxios.post('/api/achievements', achievementData, {
        headers: {
          "Content-Type": "application/json",
        }
      });

      toast.success(data.message || "Achievement created successfully!");
      setAchievementData({
        title: '',
        description: ''
      });

      setTimeout(() => navigate('/about_us'), 1000);
      
    } catch (error) {
      console.error("Creation error:", error);
      toast.error(
        error.response?.data?.message || "Failed to create achievement"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="create-achievement-container">
      <ToastContainer />
      <h1>Create Achievement</h1>
      <form onSubmit={handleSubmit} className="create-achievement-form">
        <div className="form-group">
          <label htmlFor="title">Title:</label>
          <input
            type="text"
            id="title"
            name="title"
            value={achievementData.title}
            onChange={handleChange}
            required
            disabled={loading}
          />
        </div>

        <div className="form-group">
          <label htmlFor="description">Description:</label>
          <textarea
            id="description"
            name="description"
            value={achievementData.description}
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
          {loading ? 'Creating...' : 'Create Achievement'}
        </button>
      </form>
    </div>
  );
};

export default CreateAchievement;