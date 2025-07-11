import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Context } from '../../main';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './Member_display.css';

const Member_display = () => {
  const { id } = useParams();
  const { BACKEND_URL, isAuthorized } = useContext(Context);
  const [formData, setFormData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // Create authenticated axios instance
  const authAxios = axios.create({
    baseURL: BACKEND_URL,
    withCredentials: true,
  });

  useEffect(() => {
    if (!isAuthorized) {
      navigate("/login");
    }
  }, [isAuthorized, navigate]);

  // Add request interceptor for auth token
  authAxios.interceptors.request.use(config => {
    const token = document.cookie.split('; ').find(row => row.startsWith('token='))?.split('=')[1];
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  });

  useEffect(() => {
    if (!id) {
      setError('Member ID is missing from the URL!');
      toast.error('Member ID is missing!');
      navigate('/error');
      return;
    }

    const fetchMember = async () => {
      try {
        const { data } = await authAxios.get(`/api/members/getmember/${id}`);
        setFormData(data.data);
      } catch (err) {
        console.error('Error fetching member:', err);
        setError(err.response?.data?.message || 'Failed to fetch member');
        toast.error(err.response?.data?.message || 'Failed to fetch member');
        navigate('/error');
      } finally {
        setLoading(false);
      }
    };

    fetchMember();
  }, [id, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      await authAxios.put(`/api/members/updatemember/${id}`, formData);
      toast.success('Member updated successfully!');
      setTimeout(() => {
        navigate('/member');
      }, 1000); // 1 second delay
    } catch (err) {
      console.error('Update failed:', err);
      toast.error(err.response?.data?.message || 'Update failed!');
    }
  };

  const handleDelete = async () => {
    const confirmDelete = window.confirm('Are you sure you want to delete this member?');
    if (confirmDelete) {
      try {
        await authAxios.delete(`/api/members/deletemember/${id}`);
        toast.success('Member deleted successfully!');
        setTimeout(() => {
          navigate('/member');
        }, 1000); // 1 second delay
      } catch (err) {
        console.error('Delete failed:', err);
        toast.error(err.response?.data?.message || 'Delete failed!');
      }
    }
  };

  if (loading) return <div className="loading">Loading...</div>;
  if (error) return <div className="error">{error}</div>;
  if (!formData) return <div className="error">Member not found</div>;

  return (
    <div className="member-display-container">
      <ToastContainer 
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="colored"
      />
      
      <h2>Update Member Information</h2>
      <form onSubmit={handleUpdate}>
        <label>
          Name:
          <input
            type="text"
            name="name"
            value={formData.name || ''}
            onChange={handleChange}
            placeholder="e.g. John Doe"
            required
          />
        </label>

        <label>
          Post:
          <input
            type="text"
            name="post"
            value={formData.post || ''}
            onChange={handleChange}
            placeholder="e.g. President"
            required
          />
        </label>

        <label>
          Department:
          <input
            type="text"
            name="department"
            value={formData.department || ''}
            onChange={handleChange}
            placeholder="e.g. CSE"
            required
          />
        </label>

        <label>
          Roll:
          <input
            type="text"
            name="roll"
            value={formData.roll || ''}
            onChange={handleChange}
            placeholder="e.g. 2103003"
            required
          />
        </label>

        <label>
          Contact:
          <input
            type="text"
            name="contact"
            value={formData.contact || ''}
            onChange={handleChange}
            placeholder="e.g. 0123456789"
            required
          />
        </label>

        <label>
          Series:
          <input
            type="text"
            name="series"
            value={formData.series || ''}
            onChange={handleChange}
            placeholder="e.g. 21"
            required
          />
        </label>

        <label>
          Image-URL:
          <input
            type="text"
            name="image_url"
            value={formData.image_url || ''}
            onChange={handleChange}
            placeholder="e.g. 21"
            required
          />
        </label>

        <label>
          Committee:
          <select
            name="committee"
            value={formData.committee || 'new'}
            onChange={handleChange}
          >
            <option value="new">Current Committee</option>
            <option value="old">Previous Committee</option>
          </select>
        </label>

        <div className="button-group">
          <button type="submit" className="update-button">
            Update Information
          </button>
          <button 
            type="button" 
            onClick={handleDelete} 
            className="delete-button"
          >
            Delete Member
          </button>
        </div>
      </form>
    </div>
  );
};

export default Member_display;