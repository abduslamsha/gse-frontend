import { useEffect, useState } from "react";
import api from "../services/api";
import Sidebar from "../components/Sidebar";
import "./Announcements.css";

function Announcements() {
    const [announcements, setAnnouncements] = useState([]);
    const [loading, setLoading] = useState(false);
    const [showForm, setShowForm] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [message, setMessage] = useState("");
    const [messageType, setMessageType] = useState("");

    const [formData, setFormData] = useState({
        title: "",
        content: "",
        target_audience: "ALL",
        grade_level: "",
    });

    const token = localStorage.getItem("token");

    const fetchAnnouncements = async () => {
        try {
            setLoading(true);
            const response = await api.get("/announcements", {
                headers: { Authorization: `Bearer ${token}` },
            });
            setAnnouncements(response.data);
        } catch (error) {
            console.error("Error fetching announcements:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAnnouncements();
    }, []);

    const showMessage = (msg, type) => {
        setMessage(msg);
        setMessageType(type);
        setTimeout(() => {
            setMessage("");
            setMessageType("");
        }, 5000);
    };

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const clearForm = () => {
        setFormData({
            title: "",
            content: "",
            target_audience: "ALL",
            grade_level: "",
        });
        setEditingId(null);
        setShowForm(false);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!formData.title || !formData.content) {
            showMessage("Title and content are required", "error");
            return;
        }

        try {
            setLoading(true);
            if (editingId) {
                await api.put(
                    `/announcements/${editingId}`,
                    formData,
                    { headers: { Authorization: `Bearer ${token}` } }
                );
                showMessage("Announcement updated successfully!", "success");
            } else {
                await api.post(
                    "/announcements/create",
                    formData,
                    { headers: { Authorization: `Bearer ${token}` } }
                );
                showMessage("Announcement created successfully!", "success");
            }
            clearForm();
            fetchAnnouncements();
        } catch (error) {
            console.error("Error saving announcement:", error);
            showMessage(error.response?.data?.message || "Failed to save announcement", "error");
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (announcement) => {
        setEditingId(announcement.id);
        setFormData({
            title: announcement.title,
            content: announcement.content,
            target_audience: announcement.target_audience || "ALL",
            grade_level: announcement.grade_level || "",
        });
        setShowForm(true);
        window.scrollTo({ top: 0, behavior: "smooth" });
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Delete this announcement?")) return;
        try {
            setLoading(true);
            await api.delete(`/announcements/${id}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            showMessage("Announcement deleted successfully!", "success");
            fetchAnnouncements();
        } catch (error) {
            console.error("Error deleting announcement:", error);
            showMessage("Failed to delete announcement", "error");
        } finally {
            setLoading(false);
        }
    };

    const handleTogglePublish = async (id, currentStatus) => {
        try {
            setLoading(true);
            await api.patch(
                `/announcements/${id}/toggle`,
                { is_published: !currentStatus },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            showMessage(
                `Announcement ${!currentStatus ? 'published' : 'unpublished'} successfully!`,
                "success"
            );
            fetchAnnouncements();
        } catch (error) {
            console.error("Error toggling publish:", error);
            showMessage("Failed to toggle publish status", "error");
        } finally {
            setLoading(false);
        }
    };

    const getAudienceLabel = (audience) => {
        const labels = {
            ALL: "👥 Everyone",
            STUDENTS: "🎓 Students Only",
            TEACHERS: "👨‍🏫 Teachers Only",
            ADMINS: "🛠️ Admins Only",
        };
        return labels[audience] || audience;
    };

    const getStatusBadge = (isPublished) => {
        if (isPublished) {
            return <span className="status-badge published">✅ Published</span>;
        }
        return <span className="status-badge draft">📝 Draft</span>;
    };

    return (
        <div className="announcements-container">
            <Sidebar />

            <div className="announcements-content">
                <h1 className="page-title">📢 Announcements</h1>

                {message && (
                    <div className={`message ${messageType}`}>
                        {message}
                    </div>
                )}

                <div className="section-header">
                    <h2>Manage Announcements</h2>
                    <button 
                        className="btn-add"
                        onClick={() => {
                            setShowForm(!showForm);
                            if (!showForm) {
                                setEditingId(null);
                                setFormData({
                                    title: "",
                                    content: "",
                                    target_audience: "ALL",
                                    grade_level: "",
                                });
                            }
                        }}
                    >
                        {showForm ? "✕ Cancel" : "+ New Announcement"}
                    </button>
                </div>

                {showForm && (
                    <div className="form-card">
                        <h3>{editingId ? "✏️ Edit Announcement" : "📝 New Announcement"}</h3>
                        <form onSubmit={handleSubmit} className="announcement-form">
                            <div className="form-grid">
                                <div className="form-group full-width">
                                    <label>Title *</label>
                                    <input
                                        type="text"
                                        name="title"
                                        value={formData.title}
                                        onChange={handleChange}
                                        placeholder="Enter announcement title"
                                        required
                                    />
                                </div>
                                <div className="form-group full-width">
                                    <label>Content *</label>
                                    <textarea
                                        name="content"
                                        value={formData.content}
                                        onChange={handleChange}
                                        placeholder="Write the announcement content..."
                                        rows="4"
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Target Audience</label>
                                    <select
                                        name="target_audience"
                                        value={formData.target_audience}
                                        onChange={handleChange}
                                    >
                                        <option value="ALL">👥 Everyone</option>
                                        <option value="STUDENTS">🎓 Students Only</option>
                                        <option value="TEACHERS">👨‍🏫 Teachers Only</option>
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label>Grade Level (Optional)</label>
                                    <input
                                        type="text"
                                        name="grade_level"
                                        value={formData.grade_level}
                                        onChange={handleChange}
                                        placeholder="e.g., Grade 10"
                                    />
                                    <small className="helper-text">Leave empty for all grades</small>
                                </div>
                            </div>
                            <div className="form-actions">
                                <button type="submit" className="save-btn">
                                    {editingId ? "💾 Update" : "➕ Create"} Announcement
                                </button>
                                <button type="button" className="cancel-btn" onClick={clearForm}>
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                )}

                <div className="announcements-list-admin">
                    {loading ? (
                        <p className="loading-text">Loading...</p>
                    ) : announcements.length === 0 ? (
                        <div className="no-data">
                            <p>📭 No announcements yet</p>
                            <p className="no-data-sub">Click "New Announcement" to create your first one!</p>
                        </div>
                    ) : (
                        announcements.map((announcement) => (
                            <div key={announcement.id} className="announcement-item-admin">
                                <div className="announcement-header">
                                    <div className="announcement-title-group">
                                        <h3>{announcement.title}</h3>
                                        {getStatusBadge(announcement.is_published)}
                                    </div>
                                    <div className="announcement-meta">
                                        <span className={`audience-badge ${announcement.target_audience?.toLowerCase()}`}>
                                            {getAudienceLabel(announcement.target_audience)}
                                        </span>
                                        {announcement.grade_level && (
                                            <span className="grade-tag">📚 {announcement.grade_level}</span>
                                        )}
                                        <span className="announcement-date">
                                            🕐 {new Date(announcement.created_at).toLocaleDateString()}
                                        </span>
                                    </div>
                                </div>
                                <p className="announcement-content">{announcement.content}</p>
                                <div className="announcement-actions">
                                    <button 
                                        onClick={() => handleTogglePublish(announcement.id, announcement.is_published)}
                                        className={`btn-publish ${announcement.is_published ? 'published' : 'draft'}`}
                                    >
                                        {announcement.is_published ? '📢 Unpublish' : '📢 Publish'}
                                    </button>
                                    <button onClick={() => handleEdit(announcement)} className="btn-edit">
                                        ✏️ Edit
                                    </button>
                                    <button onClick={() => handleDelete(announcement.id)} className="btn-delete">
                                        🗑️ Delete
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}

export default Announcements;