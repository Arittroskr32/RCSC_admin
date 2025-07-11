import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { Context } from '../../main';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './AddMember.css';

const AddMember = () => {
  const { isAuthorized, BACKEND_URL } = useContext(Context);
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: '',
    image_url: '',
    post: '',
    roll: '',
    department: '',
    contact: '',
    series: '',
    committee: 'new',
  });
  const [loading, setLoading] = useState(false);

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

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data } = await authAxios.post('/api/members/addmember', formData);
      
      toast.success(data.message || 'Member added successfully!');
      
      // Reset form after successful submission
      setFormData({
        name: '',
        image_url: '',
        post: '',
        roll: '',
        department: '',
        contact: '',
        series: '',
        committee: 'new',
      });

      // Redirect to members page after 2 seconds
      setTimeout(() => navigate('/member'), 2000);
    } catch (error) {
      console.error('Error adding member:', error);
      toast.error(error.response?.data?.message || 'Failed to add member');
    } finally {
      setLoading(false);
    }
  };

  if (!isAuthorized) {
    return null; // Redirect handled by parent
  }

  return (
    <div className="add-member-container">
      <ToastContainer />
      <h2>Add Member</h2>
      <form onSubmit={handleSubmit}>
        <label>
          Name:
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            placeholder="e.g. Arittro Sarkar"
            required
            disabled={loading}
          />
        </label>
        <label>
          Image URL:
          <input
            type="url"
            name="image_url"
            value={formData.image_url}
            onChange={handleChange}
            placeholder="e.g. https://example.com/image.jpg"
            required
            disabled={loading}
          />
        </label>
        <label>
          Post:
          <input
            type="text"
            name="post"
            value={formData.post}
            onChange={handleChange}
            placeholder="e.g. Administrative Operations Manager"
            required
            disabled={loading}
          />
        </label>
        <label>
          Roll:
          <input
            type="text"
            name="roll"
            value={formData.roll}
            onChange={handleChange}
            placeholder="e.g. 2103003"
            required
            disabled={loading}
          />
        </label>
        <label>
          Department:
          <input
            type="text"
            name="department"
            value={formData.department}
            onChange={handleChange}
            placeholder="e.g. CSE"
            required
            disabled={loading}
          />
        </label>
        <label>
          Contact:
          <input
            type="text"
            name="contact"
            value={formData.contact}
            onChange={handleChange}
            placeholder="e.g. 01319392932"
            required
            disabled={loading}
          />
        </label>
        <label>
          Series:
          <input
            type="text"
            name="series"
            value={formData.series}
            onChange={handleChange}
            placeholder="e.g. 21"
            required
            disabled={loading}
          />
        </label>
        <label>
          Committee:
          <select
            name="committee"
            value={formData.committee}
            onChange={handleChange}
            disabled={loading}
          >
            <option value="new">Current Committee</option>
            <option value="old">Previous Committee</option>
          </select>
        </label>
        <button type="submit" disabled={loading}>
          {loading ? 'Adding...' : 'Add Member'}
        </button>
      </form>
    </div>
  );
};

export default AddMember;