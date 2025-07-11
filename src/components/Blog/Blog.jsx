import React, { useState, useEffect, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaEdit } from 'react-icons/fa';
import axios from 'axios';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './Blog.css';
import { Context } from '../../main';

const Blog = () => {
  const [blogData, setBlogData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const { BACKEND_URL, isAuthorized } = useContext(Context);

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
      navigate('/login');
      return;
    }
    fetchBlogs();
  }, [isAuthorized, navigate]);

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-US', options);
  };

  const fetchBlogs = async () => {
    try {
      setLoading(true);
      const response = await authAxios.get('/api/blogs/get_blogs');
      setBlogData(response.data.blogs);
    } catch (err) {
      setError(err.message);
      toast.error("Failed to fetch blogs");
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteBlog = async (id) => {
    if (!window.confirm("Are you sure you want to delete this blog?")) return;

    try {
      await authAxios.delete(`/api/blogs/delete_blog/${id}`);
      toast.success("Blog deleted successfully", {
        autoClose: 1000,
        onClose: () => fetchBlogs()
      });
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to delete blog");
    }
  };

  const truncateDescription = (description) => {
    if (!description) return '';
    const words = description.split(' ');
    return words.slice(0, 20).join(' ') + (words.length > 20 ? '...' : '');
  };

  if (loading) return <div className="blog-container">Loading blogs...</div>;
  if (error) return <div className="blog-container">Error: {error}</div>;

  return (
    <div className="blog-container">
      <ToastContainer />
      <div className="blog-header">
        <h2>All Blogs</h2>
        <button
          className="post-blog-btn"
          onClick={() => navigate('/post_blog')}
        >
          Post a Blog
        </button>
      </div>

      <div className="blog-list">
        {blogData.length > 0 ? (
          blogData.map((blog) => (
            <div key={blog._id} className="blog-card">
              <div className="blog-card-content">
                <h3>{blog.title}</h3>
                <p><strong>Author:</strong> {blog.author}</p>
                <p><strong>Date:</strong> {formatDate(blog.date)}</p>
                <p><strong>Description:</strong> {truncateDescription(blog.description)}</p>
              </div>

              <div className="blog-card-footer">
                <div className="blog-meta">
                  <p><strong>Likes:</strong> {blog.likes || 0}</p>
                </div>
                <FaEdit
                  className="edit-icon"
                  onClick={() => navigate(`/blog/${blog._id}`)}
                />
              </div>
            </div>
          ))
        ) : (
          <p>No blogs available. Please check back later.</p>
        )}
      </div>
    </div>
  );
};

export default Blog;