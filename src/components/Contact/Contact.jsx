import React, { useEffect, useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { Context } from "../../main";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./Contact.css";

const Contact = () => {
    const { isAuthorized, BACKEND_URL } = useContext(Context);
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    if (!isAuthorized) {
        navigate("/login");
    }

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

    useEffect(() => {

        const fetchMessages = async () => {
            try {
                setLoading(true);
                const { data } = await authAxios.get("/api/contact/get_messages");
                setMessages(data.messages || []);
            } catch (error) {
                toast.error(error.response?.data?.message || "Failed to fetch messages");
            } finally {
                setLoading(false);
            }
        };

        fetchMessages();
    }, []);

    if (loading) {
        return <div className="contact-container">Loading messages...</div>;
    }

    return (
        <div className="contact-container">
            <ToastContainer />
            <h2>All Messages</h2>
            {messages.length > 0 ? (
                <ul className="contact-list">
                    {messages.map((msg) => (
                        <li 
                            key={msg._id} 
                            className="contact-item" 
                            onClick={() => navigate(`/contact/${msg._id}`)}
                        >
                            <p><strong>Name:</strong> {msg.username}</p>
                            <p><strong>Email:</strong> {msg.email}</p>
                            <p><strong>Phone:</strong> {msg.phone}</p>
                            <p><strong>Message:</strong> {msg.message.substring(0, 50)}...</p>
                        </li>
                    ))}
                </ul>
            ) : (
                <p>No messages found</p>
            )}
        </div>
    );
};

export default Contact;