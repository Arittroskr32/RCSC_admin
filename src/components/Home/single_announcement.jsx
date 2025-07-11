import React, { useState, useEffect, useContext } from 'react';
import { useParams, Navigate, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Context } from '../../main';
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./single_announcement.css";

const SingleAnnouncement = () => {
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
    title: '',
    description: '',
    image: '',
    post_url: '',
    date: ''
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
    const fetchAnnouncement = async () => {
      try {
        setLoading(prev => ({...prev, fetch: true}));
        const { data } = await authAxios.get(`/api/announcement/${id}`);
        
        if (!data.data) {
          setNotFound(true);
          return;
        }
        
        setFormData(data.data);
      } catch (error) {
        if (error.response?.status === 404) {
          setNotFound(true);
        } else {
          toast.error(error.response?.data?.message || "Failed to fetch announcement");
          console.error("Fetch error:", error);
        }
      } finally {
        setLoading(prev => ({...prev, fetch: false}));
      }
    };

    fetchAnnouncement();
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
      const { data } = await authAxios.put(`/api/announcement/${id}`, formData);
      toast.success(data.message || "Announcement updated successfully");
      setTimeout(() => navigate('/'), 1000);
    } catch (error) {
      console.error("Update error:", error);
      toast.error(error.response?.data?.message || "Failed to update announcement");
    } finally {
      setLoading(prev => ({...prev, save: false}));
    }
  };

  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this announcement?")) {
      return;
    }

    try {
      setLoading(prev => ({...prev, delete: true}));
      await authAxios.delete(`/api/announcement/${id}`);
      toast.success("Announcement deleted successfully");
      setTimeout(() => navigate('/'), 1000);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to delete announcement");
    } finally {
      setLoading(prev => ({...prev, delete: false}));
    }
  };

  if (loading.fetch) {
    return <p>Loading...</p>;
  }

  if (notFound || (!formData.title && !loading.fetch)) {
    return <p>Announcement not found</p>;
  }

  return (
    <div className="announcement">
      <h2>Edit Announcement</h2>
      <form onSubmit={handleSave}>
        <label>Title:</label>
        <input
          type="text"
          name="title"
          value={formData.title}
          onChange={handleChange}
          required
          disabled={loading.save || loading.delete}
        />

        <label>Image URL:</label>
        <input
          type="text"
          name="image"
          value={formData.image}
          onChange={handleChange}
          disabled={loading.save || loading.delete}
        />

        <label>Description:</label>
        <textarea
          name="description"
          value={formData.description}
          onChange={handleChange}
          required
          disabled={loading.save || loading.delete}
        />

        <label>Post Link:</label>
        <input
          type="text"
          name="post_url"
          value={formData.post_url}
          onChange={handleChange}
          disabled={loading.save || loading.delete}
        />

        <button 
          type="button" 
          onClick={handleSave} 
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

export default SingleAnnouncement;