import { useEffect, useState } from "react";
import api from "../services/api";
import Sidebar from "../components/Sidebar";
import "./Settings.css";

function Settings() {
    const [activeTab, setActiveTab] = useState("profile");
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState("");
    const [messageType, setMessageType] = useState("");

    // School Profile
    const [profile, setProfile] = useState({
        school_name: "",
        address: "",
        phone: "",
        email: "",
        motto: "",
        website: "",
        logo_url: "",
        footer_text: "",
        primary_color: "#f4a261",
        secondary_color: "#081120",
    });

    // Academic Years
    const [academicYears, setAcademicYears] = useState([]);
    const [newAcademicYear, setNewAcademicYear] = useState({
        name: "",
        start_date: "",
        end_date: "",
        is_active: false,
    });
    const [editingAcademicYear, setEditingAcademicYear] = useState(null);

    // Semesters
    const [semesters, setSemesters] = useState([]);
    const [newSemester, setNewSemester] = useState({
        name: "",
        academic_year_id: "",
        start_date: "",
        end_date: "",
        is_active: false,
    });
    const [editingSemester, setEditingSemester] = useState(null);

    // System Settings
    const [systemSettings, setSystemSettings] = useState([]);

    // Grade Ranges
    const [gradeRanges, setGradeRanges] = useState([]);

    // User Management
    const [users, setUsers] = useState([]);
    const [showUserForm, setShowUserForm] = useState(false);
    const [editingUserId, setEditingUserId] = useState(null);
    const [newUser, setNewUser] = useState({
        username: "",
        email: "",
        password: "",
        role: "STAFF",
        phone: "",
        first_name: "",
        last_name: "",
    });

    // ===== RESET PASSWORD STATE =====
    const [showResetModal, setShowResetModal] = useState(false);
    const [resetPasswordData, setResetPasswordData] = useState({
        user_id: null,
        username: "",
        email: "",
        new_password: "",
        confirm_password: "",
    });

    // Fee Types
    const [feeTypes, setFeeTypes] = useState([]);
    const [showFeeForm, setShowFeeForm] = useState(false);
    const [editingFeeId, setEditingFeeId] = useState(null);
    const [newFee, setNewFee] = useState({
        name: "",
        description: "",
        amount: "",
        is_required: true,
        grade_level: "",
    });

    // Backup Logs
    const [backupLogs, setBackupLogs] = useState([]);

    const token = localStorage.getItem("token");

    // ==================== FETCH ALL SETTINGS ====================
    const fetchAllSettings = async () => {
        try {
            setLoading(true);
            const response = await api.get("/settings/all", {
                headers: { Authorization: `Bearer ${token}` },
            });
            
            const data = response.data;
            
            if (data.school_profile) {
                setProfile(data.school_profile);
            }
            
            setAcademicYears(data.academic_years || []);
            setSemesters(data.semesters || []);
            setSystemSettings(data.system_settings || []);
            setGradeRanges(data.grade_ranges || []);
            setUsers(data.users || []);
            setFeeTypes(data.fee_types || []);
            setBackupLogs(data.backup_logs || []);
            
        } catch (error) {
            console.error("Error fetching settings:", error);
            showMessage("Failed to load settings", "error");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAllSettings();
    }, []);

    // ==================== SHOW MESSAGE ====================
    const showMessage = (msg, type) => {
        setMessage(msg);
        setMessageType(type);
        setTimeout(() => {
            setMessage("");
            setMessageType("");
        }, 5000);
    };

    // ==================== SCHOOL PROFILE ====================
    const handleProfileChange = (e) => {
        setProfile({
            ...profile,
            [e.target.name]: e.target.value,
        });
    };

    const handleProfileSubmit = async (e) => {
        e.preventDefault();
        try {
            setLoading(true);
            await api.put("/settings/profile", profile, {
                headers: { Authorization: `Bearer ${token}` },
            });
            showMessage("School profile updated successfully!", "success");
            fetchAllSettings();
        } catch (error) {
            console.error("Error updating profile:", error);
            showMessage("Failed to update profile", "error");
        } finally {
            setLoading(false);
        }
    };

    // ==================== ACADEMIC YEARS ====================
    const handleAcademicYearSubmit = async (e) => {
        e.preventDefault();
        try {
            setLoading(true);
            if (editingAcademicYear) {
                await api.put(
                    `/settings/academic-years/${editingAcademicYear}`,
                    newAcademicYear,
                    { headers: { Authorization: `Bearer ${token}` } }
                );
                showMessage("Academic year updated successfully!", "success");
            } else {
                await api.post("/settings/academic-years", newAcademicYear, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                showMessage("Academic year created successfully!", "success");
            }
            setNewAcademicYear({ name: "", start_date: "", end_date: "", is_active: false });
            setEditingAcademicYear(null);
            fetchAllSettings();
        } catch (error) {
            console.error("Error saving academic year:", error);
            showMessage("Failed to save academic year", "error");
        } finally {
            setLoading(false);
        }
    };

    const handleEditAcademicYear = (year) => {
        setEditingAcademicYear(year.id);
        setNewAcademicYear({
            name: year.name,
            start_date: year.start_date?.split('T')[0] || "",
            end_date: year.end_date?.split('T')[0] || "",
            is_active: year.is_active,
        });
    };

    const handleDeleteAcademicYear = async (id) => {
        if (!window.confirm("Delete this academic year?")) return;
        try {
            setLoading(true);
            await api.delete(`/settings/academic-years/${id}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            showMessage("Academic year deleted successfully!", "success");
            fetchAllSettings();
        } catch (error) {
            console.error("Error deleting academic year:", error);
            showMessage("Failed to delete academic year", "error");
        } finally {
            setLoading(false);
        }
    };

    // ==================== SEMESTERS ====================
    const handleSemesterSubmit = async (e) => {
        e.preventDefault();
        try {
            setLoading(true);
            if (editingSemester) {
                await api.put(
                    `/settings/semesters/${editingSemester}`,
                    newSemester,
                    { headers: { Authorization: `Bearer ${token}` } }
                );
                showMessage("Semester updated successfully!", "success");
            } else {
                await api.post("/settings/semesters", newSemester, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                showMessage("Semester created successfully!", "success");
            }
            setNewSemester({ name: "", academic_year_id: "", start_date: "", end_date: "", is_active: false });
            setEditingSemester(null);
            fetchAllSettings();
        } catch (error) {
            console.error("Error saving semester:", error);
            showMessage("Failed to save semester", "error");
        } finally {
            setLoading(false);
        }
    };

    const handleEditSemester = (semester) => {
        setEditingSemester(semester.id);
        setNewSemester({
            name: semester.name,
            academic_year_id: semester.academic_year_id || "",
            start_date: semester.start_date?.split('T')[0] || "",
            end_date: semester.end_date?.split('T')[0] || "",
            is_active: semester.is_active,
        });
    };

    const handleDeleteSemester = async (id) => {
        if (!window.confirm("Delete this semester?")) return;
        try {
            setLoading(true);
            await api.delete(`/settings/semesters/${id}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            showMessage("Semester deleted successfully!", "success");
            fetchAllSettings();
        } catch (error) {
            console.error("Error deleting semester:", error);
            showMessage("Failed to delete semester", "error");
        } finally {
            setLoading(false);
        }
    };

    // ==================== SYSTEM SETTINGS ====================
    const handleSystemSettingChange = (key, value) => {
        setSystemSettings(
            systemSettings.map((s) =>
                s.setting_key === key ? { ...s, setting_value: value } : s
            )
        );
    };

    const handleSystemSettingSubmit = async (e, key) => {
        e.preventDefault();
        try {
            setLoading(true);
            const setting = systemSettings.find((s) => s.setting_key === key);
            await api.put(
                `/settings/system-settings/${key}`,
                { value: setting.setting_value },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            showMessage(`${key} updated successfully!`, "success");
        } catch (error) {
            console.error("Error updating system setting:", error);
            showMessage("Failed to update system setting", "error");
        } finally {
            setLoading(false);
        }
    };

    // ==================== GRADE RANGES ====================
    const handleGradeRangeChange = (id, field, value) => {
        setGradeRanges(
            gradeRanges.map((g) =>
                g.id === id ? { ...g, [field]: value } : g
            )
        );
    };

    const handleGradeRangeSubmit = async (e, id) => {
        e.preventDefault();
        try {
            setLoading(true);
            const grade = gradeRanges.find((g) => g.id === id);
            await api.put(
                `/settings/grade-ranges/${id}`,
                {
                    min_mark: grade.min_mark,
                    max_mark: grade.max_mark,
                    description: grade.description,
                    points: grade.points,
                },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            showMessage("Grade range updated successfully!", "success");
        } catch (error) {
            console.error("Error updating grade range:", error);
            showMessage("Failed to update grade range", "error");
        } finally {
            setLoading(false);
        }
    };

    // ==================== USER MANAGEMENT ====================
    const handleUserSubmit = async (e) => {
        e.preventDefault();
        try {
            setLoading(true);
            if (editingUserId) {
                await api.put(
                    `/settings/users/${editingUserId}`,
                    newUser,
                    { headers: { Authorization: `Bearer ${token}` } }
                );
                showMessage("User updated successfully!", "success");
            } else {
                await api.post("/settings/users", newUser, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                showMessage("User created successfully!", "success");
            }
            setNewUser({ username: "", email: "", password: "", role: "STAFF", phone: "", first_name: "", last_name: "" });
            setEditingUserId(null);
            setShowUserForm(false);
            fetchAllSettings();
        } catch (error) {
            console.error("Error saving user:", error);
            showMessage(error.response?.data?.message || "Failed to save user", "error");
        } finally {
            setLoading(false);
        }
    };

    const handleEditUser = (user) => {
        setEditingUserId(user.id);
        setNewUser({
            username: user.username,
            email: user.email,
            password: "",
            role: user.role,
            phone: user.phone || "",
            first_name: user.first_name || "",
            last_name: user.last_name || "",
        });
        setShowUserForm(true);
    };

    const handleDeleteUser = async (id) => {
        if (!window.confirm("Delete this user?")) return;
        try {
            setLoading(true);
            await api.delete(`/settings/users/${id}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            showMessage("User deleted successfully!", "success");
            fetchAllSettings();
        } catch (error) {
            console.error("Error deleting user:", error);
            showMessage("Failed to delete user", "error");
        } finally {
            setLoading(false);
        }
    };

    // ==================== RESET STUDENT PASSWORD ====================
    const handleResetStudentPassword = (user) => {
        setResetPasswordData({
            user_id: user.id,
            username: user.username,
            email: user.email,
            new_password: "",
            confirm_password: "",
        });
        setShowResetModal(true);
    };

    const handleResetPasswordSubmit = async (e) => {
        e.preventDefault();
        
        if (resetPasswordData.new_password !== resetPasswordData.confirm_password) {
            showMessage("Passwords do not match", "error");
            return;
        }
        
        if (resetPasswordData.new_password.length < 6) {
            showMessage("Password must be at least 6 characters", "error");
            return;
        }
        
        try {
            setLoading(true);
            await api.post(
                "/auth/reset-password/student",
                {
                    user_id: resetPasswordData.user_id,
                    new_password: resetPasswordData.new_password,
                },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            showMessage(`Password reset successfully for ${resetPasswordData.username}!`, "success");
            setShowResetModal(false);
            setResetPasswordData({
                user_id: null,
                username: "",
                email: "",
                new_password: "",
                confirm_password: "",
            });
            fetchAllSettings();
        } catch (error) {
            console.error("Error resetting password:", error);
            showMessage(error.response?.data?.message || "Failed to reset password", "error");
        } finally {
            setLoading(false);
        }
    };

    // ==================== FEE TYPES ====================
    const handleFeeSubmit = async (e) => {
        e.preventDefault();
        try {
            setLoading(true);
            if (editingFeeId) {
                await api.put(
                    `/settings/fee-types/${editingFeeId}`,
                    newFee,
                    { headers: { Authorization: `Bearer ${token}` } }
                );
                showMessage("Fee type updated successfully!", "success");
            } else {
                await api.post("/settings/fee-types", newFee, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                showMessage("Fee type created successfully!", "success");
            }
            setNewFee({ name: "", description: "", amount: "", is_required: true, grade_level: "" });
            setEditingFeeId(null);
            setShowFeeForm(false);
            fetchAllSettings();
        } catch (error) {
            console.error("Error saving fee type:", error);
            showMessage("Failed to save fee type", "error");
        } finally {
            setLoading(false);
        }
    };

    const handleEditFee = (fee) => {
        setEditingFeeId(fee.id);
        setNewFee({
            name: fee.name,
            description: fee.description || "",
            amount: fee.amount,
            is_required: fee.is_required,
            grade_level: fee.grade_level || "",
        });
        setShowFeeForm(true);
    };

    const handleDeleteFee = async (id) => {
        if (!window.confirm("Delete this fee type?")) return;
        try {
            setLoading(true);
            await api.delete(`/settings/fee-types/${id}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            showMessage("Fee type deleted successfully!", "success");
            fetchAllSettings();
        } catch (error) {
            console.error("Error deleting fee type:", error);
            showMessage("Failed to delete fee type", "error");
        } finally {
            setLoading(false);
        }
    };

    // ==================== BACKUP ====================
    const handleBackup = async () => {
        if (!window.confirm("Create a database backup?")) return;
        try {
            setLoading(true);
            const response = await api.post("/settings/backup", {}, {
                headers: { Authorization: `Bearer ${token}` },
            });
            showMessage("Backup started successfully! File: " + response.data.filename, "success");
            fetchAllSettings();
        } catch (error) {
            console.error("Error creating backup:", error);
            showMessage("Failed to create backup", "error");
        } finally {
            setLoading(false);
        }
    };

    // ==================== TABS ====================
    const tabs = [
        { id: "profile", label: "🏫 School Profile" },
        { id: "academic", label: "📅 Academic Years" },
        { id: "semesters", label: "📚 Semesters" },
        { id: "system", label: "⚙️ System Settings" },
        { id: "grades", label: "📊 Grade Ranges" },
        { id: "users", label: "👥 Users" },
        { id: "fees", label: "💰 Fee Types" },
        { id: "backup", label: "💾 Backup" },
    ];

    return (
        <div className="settings-container">
            <Sidebar />

            <div className="settings-content">
                <h1 className="page-title">Settings</h1>

                {message && (
                    <div className={`message ${messageType}`}>
                        {message}
                    </div>
                )}

                <div className="settings-tabs">
                    {tabs.map((tab) => (
                        <button
                            key={tab.id}
                            className={`tab-btn ${activeTab === tab.id ? "active" : ""}`}
                            onClick={() => setActiveTab(tab.id)}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>

                {loading && <div className="loading-state">Loading...</div>}

                {/* ==================== PROFILE TAB ==================== */}
                {activeTab === "profile" && !loading && (
                    <div className="settings-section">
                        <h2>🏫 School Profile</h2>
                        <form onSubmit={handleProfileSubmit} className="settings-form">
                            <div className="form-grid">
                                <div className="form-group">
                                    <label>School Name</label>
                                    <input
                                        type="text"
                                        name="school_name"
                                        value={profile.school_name}
                                        onChange={handleProfileChange}
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Address</label>
                                    <input
                                        type="text"
                                        name="address"
                                        value={profile.address}
                                        onChange={handleProfileChange}
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Phone</label>
                                    <input
                                        type="text"
                                        name="phone"
                                        value={profile.phone}
                                        onChange={handleProfileChange}
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Email</label>
                                    <input
                                        type="email"
                                        name="email"
                                        value={profile.email}
                                        onChange={handleProfileChange}
                                    />
                                </div>
                                <div className="form-group full-width">
                                    <label>Motto</label>
                                    <input
                                        type="text"
                                        name="motto"
                                        value={profile.motto}
                                        onChange={handleProfileChange}
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Website</label>
                                    <input
                                        type="text"
                                        name="website"
                                        value={profile.website || ""}
                                        onChange={handleProfileChange}
                                        placeholder="https://www.gsems.org"
                                    />
                                </div>
                                <div className="form-group full-width">
                                    <label>Footer Text</label>
                                    <input
                                        type="text"
                                        name="footer_text"
                                        value={profile.footer_text || ""}
                                        onChange={handleProfileChange}
                                        placeholder="© 2026 German School of Excellence"
                                    />
                                </div>
                            </div>
                            <button type="submit" className="save-btn">Save Profile</button>
                        </form>
                    </div>
                )}

                {/* ==================== ACADEMIC YEARS TAB ==================== */}
                {activeTab === "academic" && !loading && (
                    <div className="settings-section">
                        <h2>📅 Academic Years</h2>
                        <form onSubmit={handleAcademicYearSubmit} className="settings-form">
                            <div className="form-grid">
                                <div className="form-group">
                                    <label>Year Name</label>
                                    <input
                                        type="text"
                                        placeholder="e.g., 2024/25"
                                        value={newAcademicYear.name}
                                        onChange={(e) =>
                                            setNewAcademicYear({ ...newAcademicYear, name: e.target.value })
                                        }
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Start Date</label>
                                    <input
                                        type="date"
                                        value={newAcademicYear.start_date}
                                        onChange={(e) =>
                                            setNewAcademicYear({ ...newAcademicYear, start_date: e.target.value })
                                        }
                                    />
                                </div>
                                <div className="form-group">
                                    <label>End Date</label>
                                    <input
                                        type="date"
                                        value={newAcademicYear.end_date}
                                        onChange={(e) =>
                                            setNewAcademicYear({ ...newAcademicYear, end_date: e.target.value })
                                        }
                                    />
                                </div>
                                <div className="form-group checkbox-group">
                                    <label>
                                        <input
                                            type="checkbox"
                                            checked={newAcademicYear.is_active}
                                            onChange={(e) =>
                                                setNewAcademicYear({ ...newAcademicYear, is_active: e.target.checked })
                                            }
                                        />
                                        Set as Active
                                    </label>
                                </div>
                            </div>
                            <button type="submit" className="save-btn">
                                {editingAcademicYear ? "Update Year" : "Add Year"}
                            </button>
                            {editingAcademicYear && (
                                <button
                                    type="button"
                                    className="cancel-btn"
                                    onClick={() => {
                                        setEditingAcademicYear(null);
                                        setNewAcademicYear({ name: "", start_date: "", end_date: "", is_active: false });
                                    }}
                                >
                                    Cancel
                                </button>
                            )}
                        </form>

                        <div className="settings-list">
                            <table className="settings-table">
                                <thead>
                                    <tr>
                                        <th>Year</th>
                                        <th>Start</th>
                                        <th>End</th>
                                        <th>Status</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {academicYears.map((year) => (
                                        <tr key={year.id}>
                                            <td><strong>{year.name}</strong></td>
                                            <td>{year.start_date?.split('T')[0]}</td>
                                            <td>{year.end_date?.split('T')[0]}</td>
                                            <td>
                                                <span className={`status-badge ${year.is_active ? "active" : "inactive"}`}>
                                                    {year.is_active ? "Active" : "Inactive"}
                                                </span>
                                            </td>
                                            <td>
                                                <button onClick={() => handleEditAcademicYear(year)} className="btn-edit">Edit</button>
                                                <button onClick={() => handleDeleteAcademicYear(year.id)} className="btn-delete">Delete</button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* ==================== SEMESTERS TAB ==================== */}
                {activeTab === "semesters" && !loading && (
                    <div className="settings-section">
                        <h2>📚 Semesters</h2>
                        <form onSubmit={handleSemesterSubmit} className="settings-form">
                            <div className="form-grid">
                                <div className="form-group">
                                    <label>Semester Name</label>
                                    <input
                                        type="text"
                                        placeholder="e.g., Semester 1"
                                        value={newSemester.name}
                                        onChange={(e) =>
                                            setNewSemester({ ...newSemester, name: e.target.value })
                                        }
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Academic Year</label>
                                    <select
                                        value={newSemester.academic_year_id}
                                        onChange={(e) =>
                                            setNewSemester({ ...newSemester, academic_year_id: e.target.value })
                                        }
                                        required
                                    >
                                        <option value="">Select Year</option>
                                        {academicYears.map((year) => (
                                            <option key={year.id} value={year.id}>
                                                {year.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                                <div className="form-group">
                                    <label>Start Date</label>
                                    <input
                                        type="date"
                                        value={newSemester.start_date}
                                        onChange={(e) =>
                                            setNewSemester({ ...newSemester, start_date: e.target.value })
                                        }
                                    />
                                </div>
                                <div className="form-group">
                                    <label>End Date</label>
                                    <input
                                        type="date"
                                        value={newSemester.end_date}
                                        onChange={(e) =>
                                            setNewSemester({ ...newSemester, end_date: e.target.value })
                                        }
                                    />
                                </div>
                                <div className="form-group checkbox-group">
                                    <label>
                                        <input
                                            type="checkbox"
                                            checked={newSemester.is_active}
                                            onChange={(e) =>
                                                setNewSemester({ ...newSemester, is_active: e.target.checked })
                                            }
                                        />
                                        Set as Active
                                    </label>
                                </div>
                            </div>
                            <button type="submit" className="save-btn">
                                {editingSemester ? "Update Semester" : "Add Semester"}
                            </button>
                            {editingSemester && (
                                <button
                                    type="button"
                                    className="cancel-btn"
                                    onClick={() => {
                                        setEditingSemester(null);
                                        setNewSemester({ name: "", academic_year_id: "", start_date: "", end_date: "", is_active: false });
                                    }}
                                >
                                    Cancel
                                </button>
                            )}
                        </form>

                        <div className="settings-list">
                            <table className="settings-table">
                                <thead>
                                    <tr>
                                        <th>Semester</th>
                                        <th>Academic Year</th>
                                        <th>Start</th>
                                        <th>End</th>
                                        <th>Status</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {semesters.map((semester) => (
                                        <tr key={semester.id}>
                                            <td><strong>{semester.name}</strong></td>
                                            <td>{semester.academic_year_name}</td>
                                            <td>{semester.start_date?.split('T')[0]}</td>
                                            <td>{semester.end_date?.split('T')[0]}</td>
                                            <td>
                                                <span className={`status-badge ${semester.is_active ? "active" : "inactive"}`}>
                                                    {semester.is_active ? "Active" : "Inactive"}
                                                </span>
                                            </td>
                                            <td>
                                                <button onClick={() => handleEditSemester(semester)} className="btn-edit">Edit</button>
                                                <button onClick={() => handleDeleteSemester(semester.id)} className="btn-delete">Delete</button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* ==================== SYSTEM SETTINGS TAB ==================== */}
                {activeTab === "system" && !loading && (
                    <div className="settings-section">
                        <h2>⚙️ System Settings</h2>
                        <div className="settings-list">
                            {systemSettings.map((setting) => (
                                <div key={setting.id} className="setting-item">
                                    <div className="setting-info">
                                        <h4>{setting.setting_key.replace(/_/g, ' ').toUpperCase()}</h4>
                                        <p>{setting.description}</p>
                                    </div>
                                    <form
                                        onSubmit={(e) => handleSystemSettingSubmit(e, setting.setting_key)}
                                        className="setting-form"
                                    >
                                        <input
                                            type="text"
                                            value={setting.setting_value}
                                            onChange={(e) =>
                                                handleSystemSettingChange(setting.setting_key, e.target.value)
                                            }
                                        />
                                        <button type="submit" className="btn-save-small">Save</button>
                                    </form>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* ==================== GRADE RANGES TAB ==================== */}
                {activeTab === "grades" && !loading && (
                    <div className="settings-section">
                        <h2>📊 Grade Ranges</h2>
                        <div className="settings-list">
                            <table className="settings-table">
                                <thead>
                                    <tr>
                                        <th>Grade</th>
                                        <th>Min Score</th>
                                        <th>Max Score</th>
                                        <th>Description</th>
                                        <th>Points</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {gradeRanges.map((grade) => (
                                        <tr key={grade.id}>
                                            <td><strong>{grade.grade}</strong></td>
                                            <td>
                                                <input
                                                    type="number"
                                                    className="grade-input"
                                                    value={grade.min_mark}
                                                    onChange={(e) =>
                                                        handleGradeRangeChange(grade.id, "min_mark", parseFloat(e.target.value))
                                                    }
                                                />
                                            </td>
                                            <td>
                                                <input
                                                    type="number"
                                                    className="grade-input"
                                                    value={grade.max_mark}
                                                    onChange={(e) =>
                                                        handleGradeRangeChange(grade.id, "max_mark", parseFloat(e.target.value))
                                                    }
                                                />
                                            </td>
                                            <td>
                                                <input
                                                    type="text"
                                                    className="grade-input"
                                                    value={grade.description || ""}
                                                    onChange={(e) =>
                                                        handleGradeRangeChange(grade.id, "description", e.target.value)
                                                    }
                                                />
                                            </td>
                                            <td>
                                                <input
                                                    type="number"
                                                    className="grade-input"
                                                    step="0.01"
                                                    value={grade.points || 0}
                                                    onChange={(e) =>
                                                        handleGradeRangeChange(grade.id, "points", parseFloat(e.target.value))
                                                    }
                                                />
                                            </td>
                                            <td>
                                                <button
                                                    onClick={(e) => handleGradeRangeSubmit(e, grade.id)}
                                                    className="btn-save-small"
                                                >
                                                    Save
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* ==================== USERS TAB ==================== */}
                {activeTab === "users" && !loading && (
                    <div className="settings-section">
                        <h2>👥 User Management</h2>
                        
                        <button 
                            className="btn-add" 
                            onClick={() => {
                                setShowUserForm(!showUserForm);
                                setEditingUserId(null);
                                setNewUser({ username: "", email: "", password: "", role: "STAFF", phone: "", first_name: "", last_name: "" });
                            }}
                        >
                            {showUserForm ? "Cancel" : "+ Add User"}
                        </button>

                        {showUserForm && (
                            <form onSubmit={handleUserSubmit} className="settings-form">
                                <div className="form-grid">
                                    <div className="form-group">
                                        <label>Username</label>
                                        <input
                                            type="text"
                                            value={newUser.username}
                                            onChange={(e) => setNewUser({ ...newUser, username: e.target.value })}
                                            required
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>First Name</label>
                                        <input
                                            type="text"
                                            value={newUser.first_name}
                                            onChange={(e) => setNewUser({ ...newUser, first_name: e.target.value })}
                                            required
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Last Name</label>
                                        <input
                                            type="text"
                                            value={newUser.last_name}
                                            onChange={(e) => setNewUser({ ...newUser, last_name: e.target.value })}
                                            required
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Email</label>
                                        <input
                                            type="email"
                                            value={newUser.email}
                                            onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                                            required
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Password {editingUserId && "(leave blank to keep current)"}</label>
                                        <input
                                            type="password"
                                            value={newUser.password}
                                            onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                                            required={!editingUserId}
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Role</label>
                                        <select
                                            value={newUser.role}
                                            onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
                                        >
                                            <option value="ADMIN">Admin</option>
                                            <option value="TEACHER">Teacher</option>
                                            <option value="STAFF">Staff</option>
                                            <option value="STUDENT">Student</option>
                                        </select>
                                    </div>
                                    <div className="form-group">
                                        <label>Phone</label>
                                        <input
                                            type="text"
                                            value={newUser.phone}
                                            onChange={(e) => setNewUser({ ...newUser, phone: e.target.value })}
                                        />
                                    </div>
                                </div>
                                <button type="submit" className="save-btn">
                                    {editingUserId ? "Update User" : "Create User"}
                                </button>
                            </form>
                        )}

                        <div className="settings-list">
                            <table className="settings-table">
                                <thead>
                                    <tr>
                                        <th>Username</th>
                                        <th>Name</th>
                                        <th>Email</th>
                                        <th>Role</th>
                                        <th>Phone</th>
                                        <th>Status</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {users.map((user) => (
                                        <tr key={user.id}>
                                            <td><strong>{user.username}</strong></td>
                                            <td>{user.first_name || ""} {user.last_name || ""}</td>
                                            <td>{user.email}</td>
                                            <td><span className={`role-badge ${user.role?.toLowerCase() || 'staff'}`}>{user.role || 'STAFF'}</span></td>
                                            <td>{user.phone || "-"}</td>
                                            <td>
                                                <span className={`status-badge ${user.is_active ? "active" : "inactive"}`}>
                                                    {user.is_active ? "Active" : "Inactive"}
                                                </span>
                                            </td>
                                            <td>
                                                <button onClick={() => handleEditUser(user)} className="btn-edit">Edit</button>
                                                {user.role === "STUDENT" && (
                                                    <button 
                                                        onClick={() => handleResetStudentPassword(user)} 
                                                        className="btn-reset-password"
                                                        title="Reset Student Password"
                                                    >
                                                        🔑 Reset
                                                    </button>
                                                )}
                                                <button onClick={() => handleDeleteUser(user.id)} className="btn-delete">Delete</button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* ==================== FEE TYPES TAB ==================== */}
                {activeTab === "fees" && !loading && (
                    <div className="settings-section">
                        <h2>💰 Fee Types</h2>
                        
                        <button 
                            className="btn-add" 
                            onClick={() => {
                                setShowFeeForm(!showFeeForm);
                                setEditingFeeId(null);
                                setNewFee({ name: "", description: "", amount: "", is_required: true, grade_level: "" });
                            }}
                        >
                            {showFeeForm ? "Cancel" : "+ Add Fee Type"}
                        </button>

                        {showFeeForm && (
                            <form onSubmit={handleFeeSubmit} className="settings-form">
                                <div className="form-grid">
                                    <div className="form-group">
                                        <label>Fee Name</label>
                                        <input
                                            type="text"
                                            value={newFee.name}
                                            onChange={(e) => setNewFee({ ...newFee, name: e.target.value })}
                                            required
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Description</label>
                                        <input
                                            type="text"
                                            value={newFee.description}
                                            onChange={(e) => setNewFee({ ...newFee, description: e.target.value })}
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Amount (ETB)</label>
                                        <input
                                            type="number"
                                            value={newFee.amount}
                                            onChange={(e) => setNewFee({ ...newFee, amount: e.target.value })}
                                            required
                                        />
                                    </div>
                                    <div className="form-group checkbox-group">
                                        <label>
                                            <input
                                                type="checkbox"
                                                checked={newFee.is_required}
                                                onChange={(e) => setNewFee({ ...newFee, is_required: e.target.checked })}
                                            />
                                            Required
                                        </label>
                                    </div>
                                    <div className="form-group">
                                        <label>Grade Level (optional)</label>
                                        <input
                                            type="text"
                                            value={newFee.grade_level}
                                            onChange={(e) => setNewFee({ ...newFee, grade_level: e.target.value })}
                                            placeholder="e.g., Grade 10"
                                        />
                                    </div>
                                </div>
                                <button type="submit" className="save-btn">
                                    {editingFeeId ? "Update Fee" : "Create Fee"}
                                </button>
                            </form>
                        )}

                        <div className="settings-list">
                            <table className="settings-table">
                                <thead>
                                    <tr>
                                        <th>Name</th>
                                        <th>Description</th>
                                        <th>Amount</th>
                                        <th>Required</th>
                                        <th>Grade</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {feeTypes.map((fee) => (
                                        <tr key={fee.id}>
                                            <td><strong>{fee.name}</strong></td>
                                            <td>{fee.description || "-"}</td>
                                            <td>ETB {fee.amount}</td>
                                            <td>{fee.is_required ? "✅" : "❌"}</td>
                                            <td>{fee.grade_level || "All"}</td>
                                            <td>
                                                <button onClick={() => handleEditFee(fee)} className="btn-edit">Edit</button>
                                                <button onClick={() => handleDeleteFee(fee.id)} className="btn-delete">Delete</button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* ==================== BACKUP TAB ==================== */}
                {activeTab === "backup" && !loading && (
                    <div className="settings-section">
                        <h2>💾 Backup & Maintenance</h2>
                        
                        <div className="backup-actions">
                            <button onClick={handleBackup} className="btn-backup" disabled={loading}>
                                💾 Create Database Backup
                            </button>
                            <p className="backup-info">Backups are stored in the server's backup directory.</p>
                        </div>

                        <h3>Recent Backups</h3>
                        {backupLogs.length === 0 ? (
                            <p className="no-data">No backups found</p>
                        ) : (
                            <table className="settings-table">
                                <thead>
                                    <tr>
                                        <th>File Name</th>
                                        <th>Size</th>
                                        <th>Status</th>
                                        <th>Date</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {backupLogs.map((log) => (
                                        <tr key={log.id}>
                                            <td>{log.file_name || "-"}</td>
                                            <td>{log.file_size || "-"}</td>
                                            <td>
                                                <span className={`status-badge ${log.status === "completed" ? "active" : "inactive"}`}>
                                                    {log.status}
                                                </span>
                                            </td>
                                            <td>{new Date(log.created_at).toLocaleString()}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                )}
            </div>

            {/* ==================== RESET PASSWORD MODAL ==================== */}
            {showResetModal && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <h3>🔑 Reset Student Password</h3>
                        <p className="modal-subtitle">
                            Resetting password for: <strong>{resetPasswordData.username}</strong> ({resetPasswordData.email})
                        </p>
                        <form onSubmit={handleResetPasswordSubmit}>
                            <div className="form-group">
                                <label>New Password</label>
                                <input
                                    type="password"
                                    value={resetPasswordData.new_password}
                                    onChange={(e) => setResetPasswordData({
                                        ...resetPasswordData,
                                        new_password: e.target.value
                                    })}
                                    placeholder="Enter new password (min 6 chars)"
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <label>Confirm Password</label>
                                <input
                                    type="password"
                                    value={resetPasswordData.confirm_password}
                                    onChange={(e) => setResetPasswordData({
                                        ...resetPasswordData,
                                        confirm_password: e.target.value
                                    })}
                                    placeholder="Confirm new password"
                                    required
                                />
                            </div>
                            <div className="modal-actions">
                                <button type="submit" className="save-btn" disabled={loading}>
                                    {loading ? "Resetting..." : "Reset Password"}
                                </button>
                                <button 
                                    type="button" 
                                    className="cancel-btn" 
                                    onClick={() => {
                                        setShowResetModal(false);
                                        setResetPasswordData({
                                            user_id: null,
                                            username: "",
                                            email: "",
                                            new_password: "",
                                            confirm_password: "",
                                        });
                                    }}
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Settings;