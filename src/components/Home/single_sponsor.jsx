import React, { useState, useEffect, useContext } from 'react';
import { useParams, Navigate, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Context } from '../../main';
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./single_announcement.css";

const SingleSponsor = () => {
  const { isAuthorized, BACKEND_URL } = useContext(Context);
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState({
    fetch: true,
    save: false,
    delete: false
  });
  const [notFound, setNotFound] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    logo_url: ''
  });

  // Create authenticated axios instance
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
    const fetchSponsor = async () => {
      try {
        setLoading(prev => ({...prev, fetch: true}));
        const { data } = await authAxios.get(`/api/sponsors/${id}`);
        
        if (!data.data) {
          setNotFound(true);
          return;
        }
        
        setFormData(data.data);
      } catch (error) {
        if (error.response?.status === 404) {
          setNotFound(true);
        } else {
          toast.error(error.response?.data?.message || "Failed to fetch sponsor");
          console.error("Fetch error:", error);
        }
      } finally {
        setLoading(prev => ({...prev, fetch: false}));
      }
    };

    fetchSponsor();
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
    setLoading(prev => ({...prev, save: true}));

    try {
      const { data } = await authAxios.put(`/api/sponsors/${id}`, formData);
      toast.success(data.message || "Sponsor updated successfully");
      setTimeout(() => navigate('/'), 1000);
    } catch (error) {
      console.error("Update error:", error);
      toast.error(error.response?.data?.message || "Failed to update sponsor");
    } finally {
      setLoading(prev => ({...prev, save: false}));
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this sponsor?")) {
      return;
    }

    try {
      setLoading(prev => ({...prev, delete: true}));
      await authAxios.delete(`/api/sponsors/${id}`);
      toast.success("Sponsor deleted successfully");
      setTimeout(() => navigate('/'), 1000);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to delete sponsor");
    } finally {
      setLoading(prev => ({...prev, delete: false}));
    }
  };

  if (loading.fetch) {
    return <p>Loading...</p>;
  }

  if (notFound || (!formData.name && !loading.fetch)) {
    return <p>Sponsor not found</p>;
  }

  return (
    <div className="announcement">
      <h2>Edit Sponsor</h2>
      <form onSubmit={handleSave}>
        <label>Name:</label>
        <input
          type="text"
          name="name"
          value={formData.name}
          onChange={handleChange}
          required
          disabled={loading.save || loading.delete}
        />

        <label>Logo URL:</label>
        <input
          type="text"
          name="logo_url"
          value={formData.logo_url}
          onChange={handleChange}
          required
          disabled={loading.save || loading.delete}
        />

        <button 
          type="submit" 
          disabled={loading.save || loading.delete}
        >
          {loading.save ? 'Saving...' : 'Save'}
        </button>
        <button 
          type="button" 
          onClick={handleDelete} 
          className="delete-btn"
          disabled={loading.save || loading.delete}
        >
          {loading.delete ? 'Deleting...' : 'Delete'}
        </button>
      </form>
      <ToastContainer />
    </div>
  );
};

export default SingleSponsor;