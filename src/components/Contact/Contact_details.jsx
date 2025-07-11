import React, { useState, useEffect, useContext } from "react";
import { useParams, useNavigate, Navigate } from "react-router-dom";
import { Context } from "../../main";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./Contact_details.css";

const Contact_details = () => {
  const { isAuthorized, BACKEND_URL } = useContext(Context);
  const { contactId } = useParams();
  const navigate = useNavigate();

  const [messageData, setMessageData] = useState(null);
  const [reply, setReply] = useState("");
  const [loading, setLoading] = useState({
    fetch: true,
    delete: false,
    reply: false,
  });
  const [error, setError] = useState(null);

  const authAxios = axios.create({
    baseURL: BACKEND_URL,
    withCredentials: true,
  });

  authAxios.interceptors.request.use((config) => {
    const token = document.cookie
      .split("; ")
      .find((row) => row.startsWith("token="))
      ?.split("=")[1];
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  });

  // Fetch message details
  useEffect(() => {
    if (!isAuthorized) return;

    const fetchMessageDetails = async () => {
      try {
        setLoading((prev) => ({ ...prev, fetch: true }));
        setError(null);

        const response = await authAxios.get(
          `/api/contact/get_messages/${contactId}`
        );

        if (!response.data || !response.data.data) {
          throw new Error("Message data not found in response");
        }

        setMessageData(response.data.data);
      } catch (error) {
        console.error("Fetch error:", error);
        if (error.response) {
          if (error.response.status === 404) {
            setError("Message not found");
          } else {
            setError(error.response.data?.message || "Failed to fetch message");
            toast.error(error.response.data?.message || "Failed to fetch message");
          }
        } else if (error.request) {
          setError("No response from server");
          toast.error("Server is not responding");
        } else {
          setError(error.message || "Failed to fetch message");
          toast.error(error.message || "Failed to fetch message");
        }
      } finally {
        setLoading((prev) => ({ ...prev, fetch: false }));
      }
    };

    fetchMessageDetails();
  }, [contactId, isAuthorized]);

  // Reply to message
  const handleReply = async () => {
    if (!reply.trim()) {
      toast.error("Reply message cannot be empty");
      return;
    }
  
    try {
      setLoading((prev) => ({ ...prev, reply: true }));
  
      const messageBody = `
Dear ${messageData.username},

Thank you for reaching out to the RUET Cyber Security Club. We appreciate your interest and the time you took to contact us.

Your Message:
> "${messageData.message}"

---
Our Response:
${reply}
---
If you have any further questions or need additional support, feel free to reply to this email. We're always happy to help.

Best regards,  
RCSC Admin Team  
RUET Cyber Security Club
`;
      const payload = {
        to: messageData.email,
        username: messageData.username,
        subject: "Response from RUET Cyber Security Club!",
        text: messageBody,
      };
  
      await authAxios.post(`/api/contact/reply`, payload);
  
      toast.success("Reply sent successfully!");
      setReply("");
    } catch (error) {
      console.error("Reply error:", error);
      toast.error(error.response?.data?.message || "Failed to send reply");
    } finally {
      setLoading((prev) => ({ ...prev, reply: false }));
    }
  };
  

  // Delete message
  const handleDelete = async () => {
    if (!window.confirm("Are you sure you want to delete this message?")) return;

    try {
      setLoading((prev) => ({ ...prev, delete: true }));

      await authAxios.delete(`/api/contact/delete_message/${contactId}`);

      toast.success("Message deleted successfully", {
        position: "top-right",
        autoClose: 1000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });

      setTimeout(() => {
        navigate("/contact");
      }, 1000);
    } catch (error) {
      console.error("Delete error:", error);
      toast.error(error.response?.data?.message || "Failed to delete message");
    } finally {
      setLoading((prev) => ({ ...prev, delete: false }));
    }
  };

  if (!isAuthorized) {
    return <Navigate to="/login" />;
  }

  if (loading.fetch) {
    return <div className="contact-details">Loading message details...</div>;
  }

  if (error) {
    return (
      <div className="contact-details">
        <h2>Error</h2>
        <p>{error}</p>
        <button onClick={() => navigate("/contact")}>Back to Messages</button>
      </div>
    );
  }

  return (
    <div className="contact-details">
      <ToastContainer />
      {messageData ? (
        <>
          <h2>Message Details</h2>
          <p><strong>Name:</strong> {messageData.username}</p>
          <p><strong>Email:</strong> {messageData.email}</p>
          <p><strong>Phone:</strong> {messageData.phone}</p>
          <p><strong>Message:</strong> {messageData.message}</p>

          <h3>Send a Reply</h3>
          <textarea
            placeholder="Write your reply here..."
            value={reply}
            onChange={(e) => setReply(e.target.value)}
            className="reply-textarea"
          />

          <div className="button-group">
            <button
              className="reply-btn"
              onClick={handleReply}
              disabled={loading.reply}
            >
              {loading.reply ? "Sending..." : "Send Reply"}
            </button>

            <button
              className="delete-btn"
              onClick={handleDelete}
              disabled={loading.delete}
            >
              {loading.delete ? "Deleting..." : "Delete Message"}
            </button>
          </div>
        </>
      ) : (
        <p>No message data available</p>
      )}
    </div>
  );
};

export default Contact_details;
