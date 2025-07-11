import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { useParams, useNavigate, Navigate } from 'react-router-dom';
import { Context } from '../../main';
import './Edit_developer.css';

const Edit_developer = () => {
  const { id } = useParams();
  const { isAuthorized, BACKEND_URL } = useContext(Context);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    roll: '',
    dept: '',
    image: ''
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
    const fetchDeveloper = async () => {
      try {
        const { data } = await authAxios.get(`/api/dev_team/${id}`);
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

    fetchDeveloper();
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
      await authAxios.put(`/api/dev_team/${id}`, formData);
      setTimeout(() => navigate('/about_us'), 1000);
    } catch (error) {
      console.error("Update error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this developer?")) {
      return;
    }

    try {
      setLoading(true);
      await authAxios.delete(`/api/dev_team/${id}`);
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
    return <div className="not-found">Developer not found</div>;
  }

  return (
    <div className="edit-developer-container">
      <h1>Edit Developer</h1>
      <form onSubmit={handleSave}>
        <div className="form-group">
          <label>Name</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            disabled={loading}
          />
        </div>
        <div className="form-group">
          <label>Roll</label>
          <input
            type="text"
            name="roll"
            value={formData.roll}
            onChange={handleChange}
            required
            disabled={loading}
          />
        </div>
        <div className="form-group">
          <label>Department</label>
          <input
            type="text"
            name="dept"
            value={formData.dept}
            onChange={handleChange}
            required
            disabled={loading}
          />
        </div>
        <div className="form-group">
          <label>Image URL</label>
          <input
            type="text"
            name="image"
            value={formData.image}
            onChange={handleChange}
            disabled={loading}
          />
        </div>
        <div className="form-actions">
          <button 
            type="submit" 
            className="save-button"
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
            {loading ? 'Deleting...' : 'Delete Developer'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default Edit_developer;