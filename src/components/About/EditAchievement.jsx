import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { useNavigate, useParams, Navigate } from 'react-router-dom';
import { Context } from '../../main';
import './EditAchievement.css';

const EditAchievement = () => {
  const { id } = useParams();
  const { isAuthorized, BACKEND_URL } = useContext(Context);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: ''
  });

  // Create axios instance with credentials
  const authAxios = axios.create({
    baseURL: BACKEND_URL,
    withCredentials: true,
  });

  // Add request interceptor for auth token
  authAxios.interceptors.request.use(config => {
    const token = document.cookie.split('; ').find(row => row.startsWith('token='))?.split('=')[1];
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  });

  if (!isAuthorized) {
    return <Navigate to="/login" />;
  }

  useEffect(() => {
    const fetchAchievement = async () => {
      try {
        const { data } = await authAxios.get(`/api/achievements/${id}`);
        if (!data.data) {
          setNotFound(true);
          return;
        }
        setFormData(data.data);
      } catch (error) {
        if (error.response?.status === 404) {
          setNotFound(true);
        } else {
          console.error("Fetch error:", error);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchAchievement();
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await authAxios.put(`/api/achievements/${id}`, formData);
      setTimeout(() => navigate('/about_us'), 1000);
    } catch (error) {
      console.error("Update error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this achievement?")) {
      return;
    }

    try {
      setLoading(true);
      await authAxios.delete(`/api/achievements/${id}`);
      setTimeout(() => navigate('/about_us'), 1000);
    } catch (error) {
      console.error("Delete error:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="loading-container">Loading...</div>;
  }

  if (notFound) {
    return <div className="not-found">Achievement not found</div>;
  }

  return (
    <div className="edit-achievement-container">
      <h1>Edit Achievement</h1>
      <form onSubmit={handleSave}>
        <div className="form-group">
          <label htmlFor="title">Title</label>
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            required
            disabled={loading}
          />
        </div>
        <div className="form-group">
          <label htmlFor="description">Description</label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows="5"
            required
            disabled={loading}
          />
        </div>
        <div className="form-actions">
          <button 
            type="submit" 
            className="save-change"
            disabled={loading}
          >
            {loading ? 'Saving...' : 'Save Changes'}
          </button>
          <button 
            type="button" 
            className="delete-button"
            onClick={handleDelete}
            disabled={loading}
          >
            {loading ? 'Deleting...' : 'Delete Achievement'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditAchievement;