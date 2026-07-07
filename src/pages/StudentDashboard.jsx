import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import {
    FaTachometerAlt,
    FaUser,
    FaBook,
    FaCalendarCheck,
    FaStar,
    FaLock,
    FaSignOutAlt,
    FaClipboardList,
    FaBullhorn,
    FaFileDownload,
    FaEye,
} from "react-icons/fa";
import "./StudentDashboard.css";

function StudentDashboard() {
    const navigate = useNavigate();
    const [dashboardData, setDashboardData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState("dashboard");
    const [showPasswordForm, setShowPasswordForm] = useState(false);
    const [passwordData, setPasswordData] = useState({
        current_password: "",
        new_password: "",
        confirm_password: "",
    });
    const [passwordMessage, setPasswordMessage] = useState("");
    const [passwordMessageType, setPasswordMessageType] = useState("");

    const [showForcePasswordChange, setShowForcePasswordChange] = useState(false);
    const [forcePasswordData, setForcePasswordData] = useState({
        new_password: "",
        confirm_password: "",
    });
    const [forcePasswordMessage, setForcePasswordMessage] = useState("");
    const [forcePasswordMessageType, setForcePasswordMessageType] = useState("");

    const [announcements, setAnnouncements] = useState([]);
    const [assignments, setAssignments] = useState([]);
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [attendanceMap, setAttendanceMap] = useState({});
    const [gradesData, setGradesData] = useState([]);

    // Report Card Preview State
    const [reportCardData, setReportCardData] = useState(null);
    const [showPreview, setShowPreview] = useState(false);
    const [loadingReport, setLoadingReport] = useState(false);

    const token = localStorage.getItem("token");
    const user = JSON.parse(localStorage.getItem("user") || "{}");
    const student = JSON.parse(localStorage.getItem("student") || "{}");

    const fetchDashboard = async () => {
        try {
            setLoading(true);
            const response = await api.get("/student/dashboard", {
                headers: { Authorization: `Bearer ${token}` },
            });
            setDashboardData(response.data);
        } catch (error) {
            console.error("Error fetching dashboard:", error);
            if (error.response?.status === 401) {
                localStorage.clear();
                navigate("/student-login");
            }
        } finally {
            setLoading(false);
        }
    };

    const fetchGrades = async () => {
        try {
            const response = await api.get("/student/grades?semester=Semester%201&academic_year=2026/27", {
                headers: { Authorization: `Bearer ${token}` },
            });
            setGradesData(response.data);
        } catch (error) {
            console.error("Error fetching grades:", error);
        }
    };

    const fetchAnnouncements = async () => {
        try {
            const response = await api.get("/student/announcements", {
                headers: { Authorization: `Bearer ${token}` },
            });
            setAnnouncements(response.data);
        } catch (error) {
            console.error("Error fetching announcements:", error);
        }
    };

    const fetchAssignments = async () => {
        try {
            const response = await api.get("/student/assignments", {
                headers: { Authorization: `Bearer ${token}` },
            });
            setAssignments(response.data);
        } catch (error) {
            console.error("Error fetching assignments:", error);
        }
    };

    const fetchAttendanceCalendar = async () => {
        try {
            const year = currentMonth.getFullYear();
            const month = currentMonth.getMonth() + 1;
            const response = await api.get(`/student/attendance-calendar?year=${year}&month=${month}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            const map = {};
            response.data.forEach(record => {
                const date = new Date(record.attendance_date).getDate();
                map[date] = record.status;
            });
            setAttendanceMap(map);
        } catch (error) {
            console.error("Error fetching attendance calendar:", error);
        }
    };

    const fetchReportCardData = async () => {
        try {
            setLoadingReport(true);
            const studentId = dashboardData?.student?.id || student?.id;
            const response = await api.get(`/reports/student/${studentId}?semester=Semester%201&academic_year=2026/27`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setReportCardData(response.data);
            setShowPreview(true);
        } catch (error) {
            console.error("Error fetching report card data:", error);
            alert("Failed to load report card preview");
        } finally {
            setLoadingReport(false);
        }
    };

    useEffect(() => {
        if (!token) {
            navigate("/student-login");
            return;
        }
        fetchDashboard();
        fetchGrades();
        fetchAnnouncements();
        fetchAssignments();
        fetchAttendanceCalendar();
    }, []);

    useEffect(() => {
        if (token) {
            fetchAttendanceCalendar();
        }
    }, [currentMonth]);

    useEffect(() => {
        const checkPasswordStatus = async () => {
            try {
                const response = await api.get("/student/check-password", {
                    headers: { Authorization: `Bearer ${token}` }
                });
                if (response.data.is_temporary) {
                    setShowForcePasswordChange(true);
                }
            } catch (error) {
                console.error("Error checking password status:", error);
            }
        };
        if (token) {
            checkPasswordStatus();
        }
    }, []);

    const handleLogout = () => {
        localStorage.clear();
        navigate("/student-login");
    };

    const handleForcePasswordChange = async (e) => {
        e.preventDefault();
        if (forcePasswordData.new_password !== forcePasswordData.confirm_password) {
            setForcePasswordMessage("Passwords do not match");
            setForcePasswordMessageType("error");
            return;
        }
        if (forcePasswordData.new_password.length < 6) {
            setForcePasswordMessage("Password must be at least 6 characters");
            setForcePasswordMessageType("error");
            return;
        }

        try {
            await api.put(
                "/student/change-password-first",
                { new_password: forcePasswordData.new_password },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setForcePasswordMessage("Password changed successfully! Welcome to the portal.");
            setForcePasswordMessageType("success");
            setTimeout(() => {
                setShowForcePasswordChange(false);
                setForcePasswordData({ new_password: "", confirm_password: "" });
            }, 2000);
        } catch (error) {
            setForcePasswordMessage(error.response?.data?.message || "Failed to change password");
            setForcePasswordMessageType("error");
        }
    };

    const handlePasswordChange = async (e) => {
        e.preventDefault();
        if (passwordData.new_password !== passwordData.confirm_password) {
            setPasswordMessage("New passwords do not match");
            setPasswordMessageType("error");
            return;
        }
        if (passwordData.new_password.length < 6) {
            setPasswordMessage("Password must be at least 6 characters");
            setPasswordMessageType("error");
            return;
        }

        try {
            await api.put(
                "/student/change-password",
                {
                    current_password: passwordData.current_password,
                    new_password: passwordData.new_password,
                },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setPasswordMessage("Password changed successfully!");
            setPasswordMessageType("success");
            setPasswordData({ current_password: "", new_password: "", confirm_password: "" });
            setTimeout(() => setShowPasswordForm(false), 2000);
        } catch (error) {
            setPasswordMessage(error.response?.data?.message || "Failed to change password");
            setPasswordMessageType("error");
        }
    };

    const viewReportCard = async () => {
        try {
            const studentId = dashboardData?.student?.id || student?.id;
            const response = await api.get(`/reports/pdf/${studentId}?semester=Semester%201&academic_year=2026/27`, {
                headers: { Authorization: `Bearer ${token}` },
                responseType: 'blob',
            });
            const blob = new Blob([response.data], { type: 'application/pdf' });
            const url = URL.createObjectURL(blob);
            window.open(url, '_blank');
        } catch (error) {
            console.error("Error viewing report card:", error);
            alert("Report card not available yet. Please check with your teacher.");
        }
    };

    const getGradeColor = (grade) => {
        const colors = {
            'A+': '#22C55E',
            'A': '#22C55E',
            'B+': '#3B82F6',
            'B': '#3B82F6',
            'C+': '#F59E0B',
            'C': '#F59E0B',
            'D': '#F97316',
            'F': '#DC2626'
        };
        return colors[grade] || '#6B7280';
    };

    const getGradeDescription = (grade) => {
        const descriptions = {
            'A+': 'Outstanding',
            'A': 'Excellent',
            'B+': 'Very Good',
            'B': 'Good',
            'C+': 'Satisfactory',
            'C': 'Average',
            'D': 'Below Average',
            'F': 'Fail'
        };
        return descriptions[grade] || '';
    };

    const getStatusBadge = (status) => {
        const statusMap = {
            Present: "status-present",
            Absent: "status-absent",
            Late: "status-late",
            Excused: "status-excused",
        };
        return statusMap[status] || "";
    };

    const getStatusEmoji = (status) => {
        const emojiMap = {
            Present: "✅",
            Absent: "❌",
            Late: "⏰",
            Excused: "📝",
        };
        return emojiMap[status] || "";
    };

    const getDaysInMonth = (date) => {
        const year = date.getFullYear();
        const month = date.getMonth();
        return new Date(year, month + 1, 0).getDate();
    };

    const getFirstDayOfMonth = (date) => {
        const year = date.getFullYear();
        const month = date.getMonth();
        return new Date(year, month, 1).getDay();
    };

    const changeMonth = (delta) => {
        const newDate = new Date(currentMonth);
        newDate.setMonth(newDate.getMonth() + delta);
        setCurrentMonth(newDate);
    };

    const navItems = [
        { id: "dashboard", label: "Dashboard", icon: <FaTachometerAlt /> },
        { id: "profile", label: "My Profile", icon: <FaUser /> },
        { id: "subjects", label: "My Subjects", icon: <FaBook /> },
        { id: "attendance", label: "Attendance", icon: <FaCalendarCheck /> },
        { id: "grades", label: "My Grades", icon: <FaStar /> },
        { id: "report-card", label: "Report Card", icon: <FaFileDownload /> },
        { id: "announcements", label: "Announcements", icon: <FaBullhorn /> },
        { id: "assignments", label: "Assignments", icon: <FaClipboardList /> },
        { id: "password", label: "Change Password", icon: <FaLock /> },
    ];

    if (loading) {
        return (
            <div className="student-dashboard-container">
                <div className="loading-state">Loading your dashboard...</div>
            </div>
        );
    }

    if (!dashboardData) {
        return (
            <div className="student-dashboard-container">
                <div className="error-state">Failed to load dashboard</div>
            </div>
        );
    }

    const { student: studentInfo, grades, attendance, summary, recentAttendance, enrolledSubjects } = dashboardData;

    const daysInMonth = getDaysInMonth(currentMonth);
    const firstDay = getFirstDayOfMonth(currentMonth);
    const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

    // ===== FIX: Check report_card data from dashboard directly =====
    const reportCard = dashboardData?.report_card || null;
    const isReportCardPublished = reportCard?.status === 'published';
    const isReportCardDraft = reportCard?.status === 'draft';

    return (
        <div className="student-dashboard-container">
            {showForcePasswordChange && (
                <div className="force-password-overlay">
                    <div className="force-password-modal">
                        <h2>🔒 Change Your Password</h2>
                        <p>This is your first login. Please set a new password.</p>
                        {forcePasswordMessage && (
                            <div className={`password-message ${forcePasswordMessageType}`}>
                                {forcePasswordMessage}
                            </div>
                        )}
                        <form onSubmit={handleForcePasswordChange}>
                            <div className="form-group">
                                <label>New Password</label>
                                <input
                                    type="password"
                                    value={forcePasswordData.new_password}
                                    onChange={(e) => setForcePasswordData({ ...forcePasswordData, new_password: e.target.value })}
                                    required
                                    placeholder="Enter new password (min 6 characters)"
                                    autoFocus
                                />
                            </div>
                            <div className="form-group">
                                <label>Confirm New Password</label>
                                <input
                                    type="password"
                                    value={forcePasswordData.confirm_password}
                                    onChange={(e) => setForcePasswordData({ ...forcePasswordData, confirm_password: e.target.value })}
                                    required
                                    placeholder="Confirm new password"
                                />
                            </div>
                            <button type="submit" className="change-password-btn">
                                Change Password
                            </button>
                        </form>
                    </div>
                </div>
            )}

            <div className="student-sidebar">
                <div className="student-logo">
                    <h2>GSEMS</h2>
                    <p>Student Portal</p>
                </div>

                <nav className="student-nav-menu">
                    {navItems.map((item) => (
                        <button
                            key={item.id}
                            className={`student-nav-link ${activeTab === item.id ? "active" : ""}`}
                            onClick={() => {
                                setActiveTab(item.id);
                                if (item.id === "password") {
                                    setShowPasswordForm(true);
                                } else {
                                    setShowPasswordForm(false);
                                    setPasswordMessage("");
                                }
                                if (item.id === "grades") {
                                    fetchGrades();
                                }
                            }}
                        >
                            <span className="nav-icon">{item.icon}</span>
                            {item.label}
                        </button>
                    ))}
                </nav>

                <div className="student-sidebar-bottom">
                    <div className="student-user-info">
                        <p className="student-name">{studentInfo.first_name} {studentInfo.last_name}</p>
                        <p className="student-id">{studentInfo.student_id}</p>
                    </div>
                    <button onClick={handleLogout} className="student-logout-btn">
                        <FaSignOutAlt /> Logout
                    </button>
                </div>
            </div>

            <div className="student-main-content">
                {activeTab === "dashboard" && (
                    <>
                        <div className="welcome-section">
                            <h1>Dashboard</h1>
                            <p className="welcome-text">
                                Welcome back, {studentInfo.first_name} {studentInfo.last_name}
                            </p>
                            <p className="welcome-grade">
                                Grade {studentInfo.grade_level || "Not Assigned"} 
                                {studentInfo.section ? ` • Section ${studentInfo.section}` : ""}
                            </p>
                        </div>

                        <div className="summary-grid">
                            <div className="summary-card">
                                <span className="summary-icon">📚</span>
                                <div>
                                    <h3>{summary.total_subjects}</h3>
                                    <p>Subjects</p>
                                </div>
                            </div>
                            <div className="summary-card">
                                <span className="summary-icon">📊</span>
                                <div>
                                    <h3>{summary.average || 0}%</h3>
                                    <p>Average Score</p>
                                </div>
                            </div>
                            <div className="summary-card">
                                <span className="summary-icon">🏆</span>
                                <div>
                                    <h3>{summary.overall_grade || "F"}</h3>
                                    <p>Overall Grade</p>
                                </div>
                            </div>
                            <div className="summary-card">
                                <span className="summary-icon">📅</span>
                                <div>
                                    <h3>{attendance.percentage || 0}%</h3>
                                    <p>Attendance</p>
                                </div>
                            </div>
                        </div>

                        <div className="quick-stats">
                            <div className="quick-stat">
                                <span className="quick-stat-label">Grade Level</span>
                                <span className="quick-stat-value">{studentInfo.grade_level || "N/A"}</span>
                            </div>
                            <div className="quick-stat">
                                <span className="quick-stat-label">Section</span>
                                <span className="quick-stat-value">{studentInfo.section || "N/A"}</span>
                            </div>
                            <div className="quick-stat">
                                <span className="quick-stat-label">Subjects Enrolled</span>
                                <span className="quick-stat-value">{summary.total_subjects}</span>
                            </div>
                            <div className="quick-stat">
                                <span className="quick-stat-label">Attendance Rate</span>
                                <span className="quick-stat-value">{attendance.percentage || 0}%</span>
                            </div>
                        </div>

                        <div className="card">
                            <h2>📝 Recent Grades</h2>
                            {grades.length === 0 ? (
                                <p className="no-data">No grades available yet.</p>
                            ) : (
                                <table className="grades-table">
                                    <thead>
                                        <tr>
                                            <th>Subject</th>
                                            <th>Percentage</th>
                                            <th>Grade</th>
                                            <th>Semester</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {grades.slice(0, 4).map((grade, index) => (
                                            <tr key={index}>
                                                <td><strong>{grade.subject_name}</strong></td>
                                                <td>{grade.percentage}%</td>
                                                <td>
                                                    <span 
                                                        className="grade-badge"
                                                        style={{ backgroundColor: getGradeColor(grade.grade) }}
                                                    >
                                                        {grade.grade}
                                                    </span>
                                                </td>
                                                <td>{grade.semester}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            )}
                            {grades.length > 4 && (
                                <button 
                                    className="view-more"
                                    onClick={() => setActiveTab("grades")}
                                >
                                    View All Grades →
                                </button>
                            )}
                        </div>

                        <div className="card">
                            <h2>📅 Recent Attendance</h2>
                            {recentAttendance.length === 0 ? (
                                <p className="no-data">No attendance records yet.</p>
                            ) : (
                                <div className="attendance-grid">
                                    {recentAttendance.map((record, index) => (
                                        <div 
                                            key={index} 
                                            className={`attendance-item ${getStatusBadge(record.status)}`}
                                        >
                                            <span className="attendance-date">
                                                {new Date(record.attendance_date).toLocaleDateString()}
                                            </span>
                                            <span className="attendance-status">
                                                {record.status}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </>
                )}

                {activeTab === "profile" && (
                    <div className="card full-width">
                        <h2>👤 My Profile</h2>
                        <div className="profile-grid">
                            <div className="profile-item">
                                <span className="profile-label">Student ID</span>
                                <span className="profile-value">{studentInfo.student_id}</span>
                            </div>
                            <div className="profile-item">
                                <span className="profile-label">Full Name</span>
                                <span className="profile-value">{studentInfo.first_name} {studentInfo.last_name}</span>
                            </div>
                            <div className="profile-item">
                                <span className="profile-label">Grade Level</span>
                                <span className="profile-value">{studentInfo.grade_level || "N/A"}</span>
                            </div>
                            <div className="profile-item">
                                <span className="profile-label">Section</span>
                                <span className="profile-value">{studentInfo.section || "N/A"}</span>
                            </div>
                            <div className="profile-item">
                                <span className="profile-label">Guardian</span>
                                <span className="profile-value">{studentInfo.guardian_name || "N/A"}</span>
                            </div>
                            <div className="profile-item">
                                <span className="profile-label">Guardian Phone</span>
                                <span className="profile-value">{studentInfo.guardian_phone || "N/A"}</span>
                            </div>
                            <div className="profile-item">
                                <span className="profile-label">Email</span>
                                <span className="profile-value">{studentInfo.email}</span>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === "subjects" && (
                    <div className="card full-width">
                        <h2>📚 My Subjects</h2>
                        {!enrolledSubjects || enrolledSubjects.length === 0 ? (
                            <p className="no-data">No subjects enrolled yet. Please contact your teacher.</p>
                        ) : (
                            <div className="subjects-grid">
                                {enrolledSubjects.map((subject, index) => (
                                    <div key={index} className="subject-card">
                                        <div className="subject-icon">📖</div>
                                        <div className="subject-info">
                                            <h4>{subject.subject_name}</h4>
                                            <p>{subject.subject_code || "No Code"}</p>
                                            <span className="subject-grade" style={{ 
                                                backgroundColor: subject.grade && subject.grade !== 'Not Graded' 
                                                    ? getGradeColor(subject.grade) 
                                                    : '#6B7280',
                                                color: 'white'
                                            }}>
                                                {subject.grade && subject.grade !== 'Not Graded' ? subject.grade : "Not Graded"}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {activeTab === "attendance" && (
                    <div className="card full-width">
                        <h2>📅 My Attendance</h2>
                        
                        <div className="attendance-summary-stats">
                            <div className="att-stat">
                                <span className="att-stat-label">Present</span>
                                <span className="att-stat-value present">{attendance.present}</span>
                            </div>
                            <div className="att-stat">
                                <span className="att-stat-label">Absent</span>
                                <span className="att-stat-value absent">{attendance.absent}</span>
                            </div>
                            <div className="att-stat">
                                <span className="att-stat-label">Late</span>
                                <span className="att-stat-value late">{attendance.late}</span>
                            </div>
                            <div className="att-stat">
                                <span className="att-stat-label">Total</span>
                                <span className="att-stat-value">{attendance.total}</span>
                            </div>
                            <div className="att-stat">
                                <span className="att-stat-label">Rate</span>
                                <span className="att-stat-value rate">{attendance.percentage}%</span>
                            </div>
                        </div>

                        <div className="calendar-container">
                            <div className="calendar-header">
                                <button onClick={() => changeMonth(-1)} className="calendar-nav">◀</button>
                                <h3>{monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}</h3>
                                <button onClick={() => changeMonth(1)} className="calendar-nav">▶</button>
                            </div>
                            <div className="calendar-grid">
                                {weekDays.map((day) => (
                                    <div key={day} className="calendar-weekday">{day}</div>
                                ))}
                                {Array.from({ length: firstDay }).map((_, i) => (
                                    <div key={`empty-${i}`} className="calendar-empty"></div>
                                ))}
                                {Array.from({ length: daysInMonth }).map((_, i) => {
                                    const day = i + 1;
                                    const status = attendanceMap[day];
                                    return (
                                        <div 
                                            key={day} 
                                            className={`calendar-day ${status ? `calendar-${status.toLowerCase()}` : ""}`}
                                        >
                                            <span className="calendar-day-number">{day}</span>
                                            {status && <span className="calendar-day-status">{getStatusEmoji(status)}</span>}
                                        </div>
                                    );
                                })}
                            </div>
                            <div className="calendar-legend">
                                <div className="legend-item">
                                    <span className="legend-dot present-dot"></span> Present
                                </div>
                                <div className="legend-item">
                                    <span className="legend-dot absent-dot"></span> Absent
                                </div>
                                <div className="legend-item">
                                    <span className="legend-dot late-dot"></span> Late
                                </div>
                                <div className="legend-item">
                                    <span className="legend-dot excused-dot"></span> Excused
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === "grades" && (
                    <div className="card full-width">
                        <h2>📝 My Grades</h2>
                        {gradesData.length === 0 ? (
                            <p className="no-data">No grades available yet.</p>
                        ) : (
                            <>
                                {(() => {
                                    const allTypes = new Set();
                                    gradesData.forEach(grade => {
                                        if (grade.quiz_max > 0) allTypes.add('Quiz');
                                        if (grade.mid_max > 0) allTypes.add('Mid');
                                        if (grade.final_max > 0) allTypes.add('Final');
                                        if (grade.assignment_max > 0) allTypes.add('Assignment');
                                        if (grade.test_max > 0) allTypes.add('Test');
                                        if (grade.project_max > 0) allTypes.add('Project');
                                        if (grade.other_max > 0) {
                                            grade.other_assessments.forEach(a => {
                                                allTypes.add(a.assessment_name);
                                            });
                                        }
                                    });
                                    
                                    const displayTypes = ['Quiz', 'Mid', 'Final'];
                                    allTypes.forEach(type => {
                                        if (!displayTypes.includes(type)) {
                                            displayTypes.push(type);
                                        }
                                    });

                                    const activeTypes = displayTypes.filter(type => {
                                        if (['Quiz', 'Mid', 'Final'].includes(type)) {
                                            return gradesData.some(g => {
                                                if (type === 'Quiz') return g.quiz_max > 0;
                                                if (type === 'Mid') return g.mid_max > 0;
                                                if (type === 'Final') return g.final_max > 0;
                                                return false;
                                            });
                                        }
                                        return gradesData.some(g => {
                                            if (type === 'Assignment') return g.assignment_max > 0;
                                            if (type === 'Test') return g.test_max > 0;
                                            if (type === 'Project') return g.project_max > 0;
                                            return g.other_assessments.some(a => a.assessment_name === type);
                                        });
                                    });

                                    const getTypeScore = (grade, type) => {
                                        if (type === 'Quiz') return grade.quiz_max > 0 ? `${grade.quiz_score}/${grade.quiz_max}` : '-';
                                        if (type === 'Mid') return grade.mid_max > 0 ? `${grade.mid_score}/${grade.mid_max}` : '-';
                                        if (type === 'Final') return grade.final_max > 0 ? `${grade.final_score}/${grade.final_max}` : '-';
                                        if (type === 'Assignment') return grade.assignment_max > 0 ? `${grade.assignment_score}/${grade.assignment_max}` : '-';
                                        if (type === 'Test') return grade.test_max > 0 ? `${grade.test_score}/${grade.test_max}` : '-';
                                        if (type === 'Project') return grade.project_max > 0 ? `${grade.project_score}/${grade.project_max}` : '-';
                                        const found = grade.other_assessments.find(a => a.assessment_name === type);
                                        return found ? `${found.score}/${found.max_points}` : '-';
                                    };

                                    return (
                                        <>
                                            <div className="table-responsive">
                                                <table className="grades-table full">
                                                    <thead>
                                                        <tr>
                                                            <th>Subject</th>
                                                            {activeTypes.map(type => (
                                                                <th key={type}>{type}</th>
                                                            ))}
                                                            <th>Total</th>
                                                            <th>Grade</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {gradesData.map((grade, index) => (
                                                            <tr key={index}>
                                                                <td><strong>{grade.subject_name}</strong></td>
                                                                {activeTypes.map(type => (
                                                                    <td key={type}>{getTypeScore(grade, type)}</td>
                                                                ))}
                                                                <td>{grade.total_score}/{grade.total_points}</td>
                                                                <td>
                                                                    <span 
                                                                        className="grade-badge"
                                                                        style={{ backgroundColor: getGradeColor(grade.grade) }}
                                                                    >
                                                                        {grade.grade}
                                                                    </span>
                                                                </td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </table>
                                            </div>

                                            <div className="grade-breakdown">
                                                <h3>📋 Assessment Breakdown</h3>
                                                {gradesData.map((grade, index) => (
                                                    <div key={index} className="subject-breakdown">
                                                        <h4>{grade.subject_name}</h4>
                                                        <div className="assessment-breakdown-grid">
                                                            {grade.assessments && grade.assessments.length > 0 ? (
                                                                grade.assessments.map((a, i) => (
                                                                    <div key={i} className="assessment-item-breakdown">
                                                                        <span className="assessment-name">{a.assessment_name}</span>
                                                                        <span className="assessment-score">{a.score}/{a.max_points}</span>
                                                                        <span className="assessment-percentage">{parseFloat(a.percentage).toFixed(1)}%</span>
                                                                    </div>
                                                                ))
                                                            ) : (
                                                                <span className="no-assessment">No individual assessments</span>
                                                            )}
                                                        </div>
                                                        <div className="subject-total-breakdown">
                                                            <span>Total: {grade.total_score}/{grade.total_points} ({grade.percentage}%)</span>
                                                            <span className="subject-grade-breakdown">Grade: {grade.grade}</span>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </>
                                    );
                                })()}
                            </>
                        )}
                    </div>
                )}

                {activeTab === "report-card" && (
                    <div className="card full-width">
                        <h2>📄 Report Card</h2>
                        
                        {isReportCardPublished ? (
                            <div>
                                <div className="report-card-actions">
                                    <button onClick={viewReportCard} className="download-report-btn">
                                        <FaFileDownload /> Download PDF
                                    </button>
                                    <button 
                                        onClick={() => {
                                            fetchReportCardData();
                                        }} 
                                        className="preview-report-btn"
                                    >
                                        <FaEye /> Preview
                                    </button>
                                </div>

                                {loadingReport && <p className="loading-text">Loading report card...</p>}

                                {showPreview && reportCardData && (
                                    <div className="report-card-preview">
                                        <div className="preview-header">
                                            <h3>Report Card Preview</h3>
                                            <button className="close-preview-btn" onClick={() => setShowPreview(false)}>
                                                ✕
                                            </button>
                                        </div>
                                        <div className="preview-content">
                                            <div className="preview-school-header">
                                                <h2>German School of Excellence</h2>
                                                <p>Excellence in Learning, Leadership for Tomorrow</p>
                                                <p>Adama, Ethiopia</p>
                                            </div>

                                            <h3 className="preview-title">STUDENT REPORT CARD</h3>
                                            <p className="preview-semester">{reportCardData.semester} • {reportCardData.academic_year}</p>

                                            <div className="preview-student-info">
                                                <div className="preview-info-row">
                                                    <span><strong>Student Name:</strong> {reportCardData.student.first_name} {reportCardData.student.last_name}</span>
                                                    <span><strong>Student ID:</strong> {reportCardData.student.student_id}</span>
                                                </div>
                                                <div className="preview-info-row">
                                                    <span><strong>Grade Level:</strong> {reportCardData.student.grade_level}</span>
                                                    <span><strong>Section:</strong> {reportCardData.student.section || 'N/A'}</span>
                                                </div>
                                                <div className="preview-info-row">
                                                    <span><strong>Guardian:</strong> {reportCardData.student.guardian_name || 'N/A'}</span>
                                                    <span><strong>Attendance:</strong> {reportCardData.attendance.percentage}%</span>
                                                </div>
                                            </div>

                                            <table className="preview-grades-table">
                                                <thead>
                                                    <tr>
                                                        <th>Subject</th>
                                                        <th>Score</th>
                                                        <th>Points</th>
                                                        <th>Percentage</th>
                                                        <th>Grade</th>
                                                        <th>Remark</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {reportCardData.grades.map((grade, index) => (
                                                        <tr key={index}>
                                                            <td><strong>{grade.subject_name}</strong></td>
                                                            <td>{grade.total_score}</td>
                                                            <td>{grade.total_points}</td>
                                                            <td>{grade.percentage}%</td>
                                                            <td>
                                                                <span className="preview-grade-badge" style={{ backgroundColor: getGradeColor(grade.grade) }}>
                                                                    {grade.grade}
                                                                </span>
                                                            </td>
                                                            <td>{getGradeDescription(grade.grade)}</td>
                                                        </tr>
                                                    ))}
                                                </tbody>
                                            </table>

                                            <div className="preview-summary">
                                                <div className="preview-summary-left">
                                                    <span><strong>Overall Average:</strong> {reportCardData.average}%</span>
                                                    <span><strong>Overall Grade:</strong> <span className="preview-grade-badge" style={{ backgroundColor: getGradeColor(reportCardData.overall_grade) }}>{reportCardData.overall_grade}</span></span>
                                                </div>
                                                <div className="preview-summary-right">
                                                    <span><strong>Class Rank:</strong> #{reportCardData.rank}</span>
                                                    <span><strong>Attendance:</strong> {reportCardData.attendance.percentage}%</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        ) : isReportCardDraft ? (
                            <div className="report-card-status draft">
                                <span>📝 Your report card is being prepared. Please check back later.</span>
                                <p className="draft-notice">The teacher is currently reviewing your grades.</p>
                            </div>
                        ) : (
                            <div className="report-card-status not-published">
                                <span>⏳ Your report card has not been published yet. Please check with your teacher.</span>
                            </div>
                        )}
                    </div>
                )}

                {activeTab === "announcements" && (
                    <div className="card full-width">
                        <h2>📢 Announcements</h2>
                        {announcements.length === 0 ? (
                            <p className="no-data">No announcements yet.</p>
                        ) : (
                            <div className="announcements-list">
                                {announcements.map((announcement) => (
                                    <div key={announcement.id} className="announcement-item">
                                        <div className="announcement-header">
                                            <h3>{announcement.title}</h3>
                                            <span className="announcement-date">
                                                {new Date(announcement.created_at).toLocaleDateString()}
                                            </span>
                                        </div>
                                        <p className="announcement-content">{announcement.content}</p>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {activeTab === "assignments" && (
                    <div className="card full-width">
                        <h2>📝 Assignments</h2>
                        {assignments.length === 0 ? (
                            <p className="no-data">No assignments yet.</p>
                        ) : (
                            <div className="assignments-list">
                                {assignments.map((assignment) => (
                                    <div key={assignment.id} className="assignment-item">
                                        <div className="assignment-header">
                                            <h3>{assignment.title}</h3>
                                            <span className={`assignment-status ${assignment.is_submitted ? "submitted" : "pending"}`}>
                                                {assignment.is_submitted ? "✅ Submitted" : "⏳ Pending"}
                                            </span>
                                        </div>
                                        <p className="assignment-subject">{assignment.subject_name}</p>
                                        <p className="assignment-description">{assignment.description}</p>
                                        <div className="assignment-footer">
                                            <span className="assignment-due">Due: {new Date(assignment.due_date).toLocaleDateString()}</span>
                                            <span className="assignment-points">Max Points: {assignment.max_points}</span>
                                            {assignment.file_url && (
                                                <a href={assignment.file_url} className="assignment-download" download>
                                                    <FaFileDownload /> Download
                                                </a>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {activeTab === "password" && (
                    <div className="card full-width">
                        <h2>🔒 Change Password</h2>
                        {passwordMessage && (
                            <div className={`password-message ${passwordMessageType}`}>
                                {passwordMessage}
                            </div>
                        )}
                        <form onSubmit={handlePasswordChange} className="password-form">
                            <div className="form-group">
                                <label>Current Password</label>
                                <input
                                    type="password"
                                    value={passwordData.current_password}
                                    onChange={(e) => setPasswordData({ ...passwordData, current_password: e.target.value })}
                                    required
                                    placeholder="Enter current password"
                                />
                            </div>
                            <div className="form-group">
                                <label>New Password</label>
                                <input
                                    type="password"
                                    value={passwordData.new_password}
                                    onChange={(e) => setPasswordData({ ...passwordData, new_password: e.target.value })}
                                    required
                                    placeholder="Enter new password (min 6 characters)"
                                />
                            </div>
                            <div className="form-group">
                                <label>Confirm New Password</label>
                                <input
                                    type="password"
                                    value={passwordData.confirm_password}
                                    onChange={(e) => setPasswordData({ ...passwordData, confirm_password: e.target.value })}
                                    required
                                    placeholder="Confirm new password"
                                />
                            </div>
                            <div className="password-actions">
                                <button type="submit" className="change-password-btn">
                                    Change Password
                                </button>
                                <button 
                                    type="button" 
                                    className="cancel-password-btn"
                                    onClick={() => {
                                        setShowPasswordForm(false);
                                        setActiveTab("dashboard");
                                        setPasswordData({ current_password: "", new_password: "", confirm_password: "" });
                                        setPasswordMessage("");
                                    }}
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                )}
            </div>
        </div>
    );
}

export default StudentDashboard;