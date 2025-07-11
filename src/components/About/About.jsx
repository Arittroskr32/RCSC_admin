import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './About.css';
import '@fortawesome/fontawesome-free/css/all.min.css';
import { Context } from '../../main'; 

const About = () => {
  const { BACKEND_URL, isAuthorized } = useContext(Context);
  const [achievements, setAchievements] = useState([]);
  const [developerTeam, setDeveloperTeam] = useState([]);
  const [expandedAchievementId, setExpandedAchievementId] = useState(null);
  const [loading, setLoading] = useState({
    achievements: false,
    developers: false
  });
  const navigate = useNavigate();

  if(!isAuthorized){
    navigate('/login');
  }

  // Fetch achievements
  const fetchAchievements = async () => {
    setLoading(prev => ({...prev, achievements: true}));
    try {
      const response = await axios.get(`${BACKEND_URL}/api/achievements`);
      setAchievements(Array.isArray(response.data.achievements) ? response.data.achievements : []);
    } catch (error) {
      console.error("Error fetching achievements:", error);
    } finally {
      setLoading(prev => ({...prev, achievements: false}));
    }
  };

  // Fetch developers
  const fetchDevelopers = async () => {
    setLoading(prev => ({...prev, developers: true}));
    try {
      const response = await axios.get(`${BACKEND_URL}/api/dev_team`);
      setDeveloperTeam(Array.isArray(response.data.devTeam) ? response.data.devTeam : []);
    } catch (error) {
      console.error("Error fetching developers:", error);
    } finally {
      setLoading(prev => ({...prev, developers: false}));
    }
  };

  useEffect(() => {
    fetchAchievements();
    fetchDevelopers();
  }, []);

  const toggleDescription = (id) => {
    setExpandedAchievementId(expandedAchievementId === id ? null : id);
  };

  const handleCreateAchievement = () => {
    navigate('/create_achievement');
  };

  const handleCreateDeveloper = () => {
    navigate('/create_developer');
  };

  const openEditPage = (type, id) => {
    if (type === 'achievement') {
      navigate(`/edit_achievement/${id}`);
    } else if (type === 'developer_team') {
      navigate(`/edit_developer/${id}`);
    }
  };

  return (
    <div className="about-container">
      {/* Buttons to create achievement and developer */}
      <div className="create-buttons">
        <button onClick={handleCreateAchievement} className="create-button">
          Create Achievement
        </button>
        <button onClick={handleCreateDeveloper} className="create-button">
          Create Developer
        </button>
      </div>

      {/* Achievements Section */}
      <h1>Achievements</h1>
      {loading.achievements ? (
        <p>Loading achievements...</p>
      ) : (
        <div className="achievement-list">
          {achievements.length > 0 ? (
            achievements.map((achievement) => (
              <div key={achievement._id} className="achievement-item">
                <div className="achievement-info">
                  <h3>{achievement.title}</h3>
                  <p>
                    {expandedAchievementId === achievement._id
                      ? achievement.description
                      : `${achievement.description.split(' ').slice(0, 30).join(' ')}...`}
                  </p>
                  <button
                    className="show-more-button"
                    onClick={() => toggleDescription(achievement._id)}
                  >
                    {expandedAchievementId === achievement._id ? 'Show Less' : 'Show More'}
                  </button>
                </div>
                <div className='edit-div'>
                  <i
                    className="fas fa-edit edit-icon"
                    onClick={() => openEditPage('achievement', achievement._id)}
                  ></i>
                </div>
              </div>
            ))
          ) : (
            <p>No achievements found.</p>
          )}
        </div>
      )}

      {/* Developer Team Section */}
      <h1>Developer Team</h1>
      {loading.developers ? (
        <p>Loading developers...</p>
      ) : (
        <div className="developer-team-list">
          {developerTeam.length > 0 ? (
            developerTeam.map((member) => (
              <div key={member._id} className="developer-team-item">
                <div className="developer-info">
                  <img src={member.image} alt={member.name} className="developer-image" />
                  <h3>{member.name}</h3>
                  <p>Roll: {member.roll}</p>
                  <p>Dept: {member.dept}</p>
                </div>
                <div>
                  <i
                    className="fas fa-edit edit-icon"
                    onClick={() => openEditPage('developer_team', member._id)}
                  ></i>
                </div>
              </div>
            ))
          ) : (
            <p>No developers found.</p>
          )}
        </div>
      )}
    </div>
  );
};

export default About;