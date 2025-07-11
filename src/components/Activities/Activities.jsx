import React, { useEffect, useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './Activities.css';
import { Context } from '../../main'; 

const Activities = () => {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { BACKEND_URL, isAuthorized } = useContext(Context);

  const authAxios = axios.create({
    baseURL: BACKEND_URL,
    withCredentials: true,
  });
  
  if(!isAuthorized){
    navigate('/login');
  }

  authAxios.interceptors.request.use(config => {
    const token = document.cookie.split('; ').find(row => row.startsWith('token='))?.split('=')[1];
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  });

  useEffect(() => {
    const fetchActivities = async () => {
      try {
        setLoading(true);
        const response = await authAxios.get('/api/activities');
        let activitiesData = [];
        
        if (Array.isArray(response.data)) {
          activitiesData = response.data;
        } else if (response.data && Array.isArray(response.data.activities)) {
          activitiesData = response.data.activities;
        } else if (response.data && Array.isArray(response.data.data)) {
          activitiesData = response.data.data;
        }
        
        setActivities(activitiesData);
      } catch (error) {
        toast.error(error.response?.data?.message || "Failed to fetch activities");
        console.error("Fetch error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchActivities();
  }, []);

  const handleEdit = (id) => {
    navigate(`/edit_activity/${id}`);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this activity?")) return;

    try {
      await authAxios.delete(`/api/activities/${id}`);
      toast.success("Activity deleted successfully", {
        autoClose: 1000,
        onClose: () => navigate('/')
      });
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to delete activity");
      console.error("Delete error:", error);
    }
  };

  const truncateDescription = (description) => {
    if (!description) return '';
    const words = description.split(' ');
    return words.length > 30 ? words.slice(0, 30).join(' ') + '...' : description;
  };

  // Categorize activities by event_type
  const groupedActivities = {
    events: activities.filter(activity => activity?.event_type === 'events'),
    projects: activities.filter(activity => activity?.event_type === 'projects'),
    upcoming: activities.filter(activity => activity?.event_type === 'upcoming'),
    workshops: activities.filter(activity => activity?.event_type === 'workshops')
  };

  const handleCreateActivity = () => {
    navigate('/create_activities');
  };

  if (loading) {
    return <div className="activities-container">Loading activities...</div>;
  }

  return (
    <div className="activities-container">
      <ToastContainer />
      {/* Create Activity Button */}
      <button className="create-activity-btn" onClick={handleCreateActivity}>
        Create Activity
      </button>

      {/* Events Section */}
      <div className="section">
        <h2>Events</h2>
        {groupedActivities.events.length > 0 ? (
          groupedActivities.events.map((activity) => (
            <div key={activity._id} className="activity-item">
              <div className="activity-details">
                <h3>{activity.title}</h3>
                <p>{truncateDescription(activity.description)}</p>
                <span>{activity.date}</span>
              </div>

              <div className="activity-actions">
                <button className="edit-icon" onClick={() => handleEdit(activity._id)}>
                  <i className="fas fa-edit"></i>
                </button>
                <button className="delete-icon" onClick={() => handleDelete(activity._id)}>
                  <i className="fas fa-trash-alt"></i>
                </button>
              </div>
            </div>
          ))
        ) : (
          <p>No events found</p>
        )}
      </div>

      {/* Projects Section */}
      <div className="section">
        <h2>Projects</h2>
        {groupedActivities.projects.length > 0 ? (
          groupedActivities.projects.map((activity) => (
            <div key={activity._id} className="activity-item">
              <div className="activity-details">
                <h3>{activity.title}</h3>
                <p>{truncateDescription(activity.description)}</p>
                <span>{activity.date}</span>
              </div>

              <div className="activity-actions">
                <button className="edit-icon" onClick={() => handleEdit(activity._id)}>
                  <i className="fas fa-edit"></i>
                </button>
                <button className="delete-icon" onClick={() => handleDelete(activity._id)}>
                  <i className="fas fa-trash-alt"></i>
                </button>
              </div>
            </div>
          ))
        ) : (
          <p>No projects found</p>
        )}
      </div>

      {/* Upcoming Section */}
      <div className="section">
        <h2>Upcoming</h2>
        {groupedActivities.upcoming.length > 0 ? (
          groupedActivities.upcoming.map((activity) => (
            <div key={activity._id} className="activity-item">
              <div className="activity-details">
                <h3>{activity.title}</h3>
                <p>{truncateDescription(activity.description)}</p>
                <span>{activity.date}</span>
              </div>

              <div className="activity-actions">
                <button className="edit-icon" onClick={() => handleEdit(activity._id)}>
                  <i className="fas fa-edit"></i>
                </button>
                <button className="delete-icon" onClick={() => handleDelete(activity._id)}>
                  <i className="fas fa-trash-alt"></i>
                </button>
              </div>
            </div>
          ))
        ) : (
          <p>No upcoming activities found</p>
        )}
      </div>

      {/* Workshops Section */}
      <div className="section">
        <h2>Workshops</h2>
        {groupedActivities.workshops.length > 0 ? (
          groupedActivities.workshops.map((activity) => (
            <div key={activity._id} className="activity-item">
              <div className="activity-details">
                <h3>{activity.title}</h3>
                <p>{truncateDescription(activity.description)}</p>
                <span>{activity.date}</span>
              </div>

              <div className="activity-actions">
                <button className="edit-icon" onClick={() => handleEdit(activity._id)}>
                  <i className="fas fa-edit"></i>
                </button>
                <button className="delete-icon" onClick={() => handleDelete(activity._id)}>
                  <i className="fas fa-trash-alt"></i>
                </button>
              </div>
            </div>
          ))
        ) : (
          <p>No workshops found</p>
        )}
      </div>
    </div>
  );
};

export default Activities;