import React, { useEffect, useState, useContext } from 'react';
import axios from 'axios';
import { Context } from '../../main';
import { Navigate } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './all_club_Members.css';

const all_club_Members = () => {
  const { isAuthorized, BACKEND_URL } = useContext(Context);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchEmail, setSearchEmail] = useState('');
  const [memberDetails, setMemberDetails] = useState(null);
  const [newMember, setNewMember] = useState({
    name: '',
    email: '',
    series: '',
    phone: '',
    dept: '',
  });

  const authAxios = axios.create({
    baseURL: BACKEND_URL,
    withCredentials: true,
  });

  authAxios.interceptors.request.use(config => {
    const token = document.cookie.split('; ').find(row => row.startsWith('token='))?.split('=')[1];
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  });

  if (!isAuthorized) return <Navigate to="/login" />;

  // Fetch all members
  const fetchMembers = async () => {
    try {
      setLoading(true);
      const { data } = await authAxios.get('/api/club-member');
      setMembers(data.data || []);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to fetch members');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMembers();
  }, []);

  // Add member
  const handleAdd = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await authAxios.post('/api/club-member', newMember);
      toast.success(data.message);
      setNewMember({ name: '', email: '', series: '', phone: '', dept: '' });
      fetchMembers();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Add failed');
    } finally {
      setLoading(false);
    }
  };

  // Delete member
  const handleDelete = async (email) => {
    try {
      const { data } = await authAxios.delete('/api/club-member', { data: { email } });
      toast.success(data.message);
      fetchMembers();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Delete failed');
    }
  };

  // Search member by email
  const handleSearch = async (e) => {
    e.preventDefault();
    try {
      const { data } = await authAxios.post('/api/club-member/get-member', { email: searchEmail });
      setMemberDetails(data.data);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Search failed');
      setMemberDetails(null);
    }
  };

  return (
    <div className="club-container">
      <h2>Manage Club Members</h2>

      {/* Add Member */}
      <section className="add-member-section">
        <h3>Add Club Member</h3>
        <form onSubmit={handleAdd} className="add-member-form">
          {['name', 'email', 'series', 'phone', 'dept'].map((field) => (
            <input
              key={field}
              type="text"
              name={field}
              value={newMember[field]}
              onChange={(e) => setNewMember({ ...newMember, [field]: e.target.value })}
              placeholder={field.charAt(0).toUpperCase() + field.slice(1)}
              required
              disabled={loading}
            />
          ))}
          <button type="submit" disabled={loading}>
            {loading ? 'Adding...' : 'Add Member'}
          </button>
        </form>
      </section>

      {/* View Member */}
      <section className="view-member-section">
        <h3>View Member by Email</h3>
        <form onSubmit={handleSearch} className="view-member-form">
          <input
            type="email"
            placeholder="Enter Email"
            value={searchEmail}
            onChange={(e) => setSearchEmail(e.target.value)}
            required
          />
          <button type="submit" disabled={loading}>Search</button>
        </form>

        {memberDetails && (
          <div className="member-details">
            <p><strong>Name:</strong> {memberDetails.name}</p>
            <p><strong>Email:</strong> {memberDetails.email}</p>
            <p><strong>Series:</strong> {memberDetails.series}</p>
            <p><strong>Phone:</strong> {memberDetails.phone}</p>
            <p><strong>Dept:</strong> {memberDetails.dept}</p>
          </div>
        )}
      </section>

      {/* All Members Table */}
      <section className="all-members-section">
        <h3>All Members</h3>
        {loading ? (
          <p>Loading members...</p>
        ) : (
          <table className="members-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Series</th>
                <th>Phone</th>
                <th>Dept</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {members.map((member) => (
                <tr key={member.email}>
                  <td>{member.name}</td>
                  <td>{member.email}</td>
                  <td>{member.series}</td>
                  <td>{member.phone}</td>
                  <td>{member.dept}</td>
                  <td>
                    <button className="delete-btn" onClick={() => handleDelete(member.email)}>
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </div>
  );
};

export default all_club_Members;
