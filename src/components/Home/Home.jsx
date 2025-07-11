import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { useNavigate, Navigate } from 'react-router-dom';
import { Context } from '../../main';
import { FaEdit } from 'react-icons/fa';
import './Home.css';

const Home = () => {
  const { isAuthorized, BACKEND_URL } = useContext(Context);
  const navigate = useNavigate();
  const [announcements, setAnnouncements] = useState([]);
  const [sponsors, setSponsors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedAnnouncements, setExpandedAnnouncements] = useState({});
  const [mailSubject, setMailSubject] = useState('');
  const [mailBody, setMailBody] = useState('');
  const [mailStatus, setMailStatus] = useState(null);
  const [sending, setSending] = useState(false);

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

  useEffect(() => {
    if (!isAuthorized) {
      navigate("/login");
      return;
    }

    const fetchData = async () => {
      try {
        setLoading(true);
        const [announcementRes, sponsorRes] = await Promise.all([
          authAxios.get('/api/announcement'),
          authAxios.get('/api/sponsors')
        ]);
        setAnnouncements(announcementRes.data.announcements || []);
        setSponsors(sponsorRes.data.sponsors || []);
      } catch (error) {
        setError(error.response?.data?.message || "Failed to fetch data");
        console.error("Fetch error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [isAuthorized, navigate]);

  const toggleDescription = (id) => {
    setExpandedAnnouncements((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const handleSendMail = async () => {
  if (!mailSubject.trim() || !mailBody.trim()) {
    setMailStatus({ type: 'error', message: 'Subject and body are required.' });
    return;
  }

  setSending(true);
  setMailStatus(null);
  try {
    const fullMailBody = `Hi,\n\n${mailBody}\n\nBest regards,\nRUET Cyber Security Club`;

    const response = await authAxios.post('/api/club-member/send-mail-to-all', {
      subject: mailSubject,
      text: fullMailBody,
    });

    setMailStatus({ type: 'success', message: response.data.message });
    setMailSubject('');
    setMailBody('');
  } catch (error) {
    setMailStatus({
      type: 'error',
      message: error.response?.data?.message || 'Failed to send emails.',
    });
  } finally {
    setSending(false);
  }
};

  if (!isAuthorized) {
    return <Navigate to="/login" />;
  }

  if (loading) {
    return <div className="loading-container">Loading...</div>;
  }

  if (error) {
    return <div className="error-container">Error: {error}</div>;
  }

  return (
    <div className="home-container">
      <div className="announcement-section">
        <h2>Announcements</h2>
        <button className="create-btn" onClick={() => navigate('/create_announcement')}>
          Create Announcement
        </button>
        <div className="announcement-list">
          {announcements.length > 0 ? (
            announcements.map((announcement) => (
              <div key={announcement._id} className="announcement-box">
                <div className="announcement-content">
                  <h3>{announcement.title}</h3>
                  <p><strong>Date:</strong> {new Date(announcement.date).toISOString().split('T')[0]}</p>
                  <p>
                    <strong>Description:</strong>
                    {expandedAnnouncements[announcement._id]
                      ? announcement.description
                      : `${announcement.description.substring(0, 150)}... `}
                    <button
                      className="read-more-btn"
                      onClick={() => toggleDescription(announcement._id)}
                    >
                      {expandedAnnouncements[announcement._id] ? 'Show Less' : 'Read More'}
                    </button>
                  </p>
                  {announcement.post_url && (
                    <p>
                      <strong>Link:</strong>
                      <a href={announcement.post_url} target="_blank" rel="noopener noreferrer">
                        {announcement.post_url}
                      </a>
                    </p>
                  )}
                </div>
                <div className="announcement-footer">
                  <FaEdit
                    className="edit-icon"
                    onClick={() => navigate(`/edit_announcement/${announcement._id}`)}
                    aria-label="Edit announcement"
                  />
                </div>
              </div>
            ))
          ) : (
            <p>No announcements available. Please check back later.</p>
          )}
        </div>
      </div>

      <div className="sponsor-section">
        <h2>Sponsors</h2>
        <button className="create-btn" onClick={() => navigate('/create_sponsor')}>
          Create Sponsor
        </button>
        <div className="sponsor-list">
          {sponsors.length > 0 ? (
            sponsors.map((sponsor) => (
              <div key={sponsor._id} className="sponsor-box">
                <div className="sponsor-content">
                  {sponsor.logo_url && (
                    <img
                      src={sponsor.logo_url}
                      alt={sponsor.name}
                      className="sponsor-logo"
                    />
                  )}
                  <h3>{sponsor.name}</h3>
                </div>
                <div className="sponsor-footer">
                  <FaEdit
                    className="edit-icon"
                    onClick={() => navigate(`/edit_sponsor/${sponsor._id}`)}
                    aria-label="Edit sponsor"
                  />
                </div>
              </div>
            ))
          ) : (
            <p>No sponsors available. Please check back later.</p>
          )}
        </div>
      </div>

      <div className="navigation-buttons">
        <button className="create-btn" onClick={() => navigate('/all-club-members')}>
          Club Member Info
        </button>
      </div>

      <div className="mailer-section">
        <h2>Send Email to All Club Members</h2>
        <div className="mailer-form">
          <input
            type="text"
            placeholder="Subject"
            value={mailSubject}
            onChange={(e) => setMailSubject(e.target.value)}
            className="mailer-input"
          />
          <textarea
            placeholder="Body"
            value={mailBody}
            onChange={(e) => setMailBody(e.target.value)}
            className="mailer-textarea"
            rows={6}
          />
          <button
            className="create-btn"
            onClick={handleSendMail}
            disabled={sending}
          >
            {sending ? 'Sending...' : 'Send Mail'}
          </button>
          {mailStatus && (
            <div className={`mail-status ${mailStatus.type}`}>
              {mailStatus.message}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Home;
