import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import Sidebar from "../components/Sidebar";
import {
    FaUsers,
    FaUserGraduate,
    FaChalkboardTeacher,
    FaClipboardList,
    FaCalendarCheck,
    FaUserPlus,
    FaChartBar,
    FaBook,
    FaFileAlt,
    FaMoneyBillWave,
} from "react-icons/fa";
import "./Dashboard.css";

function Dashboard() {
    const navigate = useNavigate();
    const [stats, setStats] = useState({
        stats: {
            students: 0,
            teachers: 0,
            users: 0,
            pendingAdmissions: 0,
            subjects: 0,
            reportCards: 0,
            publishedReportCards: 0,
            feeSummary: { total_fees: 0, total_paid: 0, balance: 0 },
        },
        todayAttendance: {
            total: 0,
            present: 0,
            absent: 0,
            late: 0,
            percentage: 0,
        },
        recentStudents: [],
        recentAdmissions: [],
    });
    const [schoolProfile, setSchoolProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [profileLoaded, setProfileLoaded] = useState(false);

    const token = localStorage.getItem("token");

    const fetchDashboardStats = async () => {
        try {
            setLoading(true);
            const response = await api.get("/dashboard/stats", {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            setStats(response.data);
        } catch (error) {
            console.error("Error fetching dashboard stats:", error);
            if (error.response?.status === 401) {
                localStorage.removeItem("token");
                navigate("/login");
            }
        } finally {
            setLoading(false);
        }
    };

    const fetchSchoolProfile = async () => {
        try {
            const response = await api.get("/settings/profile", {
                headers: { Authorization: `Bearer ${token}` }
            });
            setSchoolProfile(response.data);
            setProfileLoaded(true);
        } catch (error) {
            console.error("Error fetching school profile:", error);
            setProfileLoaded(true);
        }
    };

    useEffect(() => {
        fetchDashboardStats();
        fetchSchoolProfile();
    }, []);

    const handleLogout = () => {
        localStorage.removeItem("token");
        navigate("/login");
    };

    const formatDate = (dateString) => {
        if (!dateString) return "";
        const date = new Date(dateString);
        return date.toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
        });
    };

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'ETB',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(amount);
    };

    const statCards = [
        { 
            title: "Students", 
            value: stats.stats.students, 
            icon: <FaUserGraduate />, 
            color: "#f4a261"
        },
        { 
            title: "Teachers", 
            value: stats.stats.teachers, 
            icon: <FaChalkboardTeacher />, 
            color: "#22C55E"
        },
        { 
            title: "Pending Admissions", 
            value: stats.stats.pendingAdmissions, 
            icon: <FaClipboardList />, 
            color: "#F59E0B"
        },
        { 
            title: "Subjects", 
            value: stats.stats.subjects, 
            icon: <FaBook />, 
            color: "#8B5CF6"
        },
    ];

    const quickActions = [
        { title: "Add Student", icon: <FaUserPlus />, path: "/students", color: "#f4a261" },
        { title: "Add Teacher", icon: <FaChalkboardTeacher />, path: "/teachers", color: "#22C55E" },
        { title: "New Admission", icon: <FaClipboardList />, path: "/admissions", color: "#F59E0B" },
        { title: "Mark Attendance", icon: <FaCalendarCheck />, path: "/attendance", color: "#3B82F6" },
        { title: "Manage Subjects", icon: <FaBook />, path: "/subjects", color: "#8B5CF6" },
        { title: "View Reports", icon: <FaChartBar />, path: "/reports", color: "#EC4899" },
    ];

    const getGreeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return "Good Morning";
        if (hour < 17) return "Good Afternoon";
        return "Good Evening";
    };

    const schoolName = schoolProfile?.school_name || 'GSEMS';
    const schoolMotto = schoolProfile?.motto || 'Welcome back! Here\'s what\'s happening with your school today.';

    return (
        <div className="dashboard-container">
            <Sidebar />

            <div className="dashboard-content">
                <div className="dashboard-header">
                    <div>
                        <h1 className="page-title">{getGreeting()} 👋</h1>
                        <p className="welcome-text">{schoolMotto}</p>
                        <p className="school-name">{schoolName}</p>
                    </div>
                    <button onClick={handleLogout} className="logout-btn">
                        Logout
                    </button>
                </div>

                {loading ? (
                    <div className="loading-state">
                        <p>Loading dashboard...</p>
                    </div>
                ) : (
                    <>
                        <div className="stats-grid">
                            {statCards.map((stat, index) => (
                                <div key={index} className="stat-card">
                                    <div className="stat-icon" style={{ color: stat.color }}>
                                        {stat.icon}
                                    </div>
                                    <div className="stat-info">
                                        <h3>{stat.value}</h3>
                                        <p>{stat.title}</p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="attendance-summary">
                            <div className="attendance-header">
                                <h2><FaCalendarCheck /> Today's Attendance</h2>
                                <span className="attendance-date">{new Date().toLocaleDateString()}</span>
                            </div>
                            <div className="attendance-stats">
                                <div className="attendance-stat">
                                    <span className="attendance-label">Total</span>
                                    <span className="attendance-value">{stats.todayAttendance.total}</span>
                                </div>
                                <div className="attendance-stat present">
                                    <span className="attendance-label">Present</span>
                                    <span className="attendance-value">{stats.todayAttendance.present}</span>
                                </div>
                                <div className="attendance-stat absent">
                                    <span className="attendance-label">Absent</span>
                                    <span className="attendance-value">{stats.todayAttendance.absent}</span>
                                </div>
                                <div className="attendance-stat late">
                                    <span className="attendance-label">Late</span>
                                    <span className="attendance-value">{stats.todayAttendance.late}</span>
                                </div>
                                <div className="attendance-stat percentage">
                                    <span className="attendance-label">Attendance Rate</span>
                                    <span className="attendance-value">{stats.todayAttendance.percentage}%</span>
                                </div>
                            </div>
                        </div>

                        <div className="dashboard-grid">
                            <div className="dashboard-card">
                                <h2>Recent Students</h2>
                                {stats.recentStudents.length === 0 ? (
                                    <p className="no-data">No students yet</p>
                                ) : (
                                    <table className="recent-table">
                                        <thead>
                                            <tr>
                                                <th>Student ID</th>
                                                <th>Name</th>
                                                <th>Grade</th>
                                                <th>Date</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {stats.recentStudents.map((student) => (
                                                <tr key={student.id}>
                                                    <td>{student.student_id}</td>
                                                    <td>{student.first_name} {student.last_name}</td>
                                                    <td>{student.grade_level}</td>
                                                    <td>{formatDate(student.created_at)}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                )}
                            </div>

                            <div className="dashboard-card">
                                <h2>Recent Admissions</h2>
                                {stats.recentAdmissions.length === 0 ? (
                                    <p className="no-data">No admissions yet</p>
                                ) : (
                                    <table className="recent-table">
                                        <thead>
                                            <tr>
                                                <th>Application No</th>
                                                <th>Name</th>
                                                <th>Status</th>
                                                <th>Date</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {stats.recentAdmissions.map((admission) => (
                                                <tr key={admission.id}>
                                                    <td>{admission.application_no}</td>
                                                    <td>{admission.first_name} {admission.last_name}</td>
                                                    <td>
                                                        <span className={`status-badge ${admission.status?.toLowerCase()}`}>
                                                            {admission.status || "PENDING"}
                                                        </span>
                                                    </td>
                                                    <td>{formatDate(admission.created_at)}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                )}
                            </div>
                        </div>

                        <div className="stats-row">
                            <div className="stat-mini">
                                <FaFileAlt className="stat-mini-icon" />
                                <div>
                                    <span className="stat-mini-value">{stats.stats.reportCards}</span>
                                    <span className="stat-mini-label">Total Report Cards</span>
                                </div>
                            </div>
                            <div className="stat-mini">
                                <FaClipboardList className="stat-mini-icon" />
                                <div>
                                    <span className="stat-mini-value">{stats.stats.publishedReportCards}</span>
                                    <span className="stat-mini-label">Published</span>
                                </div>
                            </div>
                            <div className="stat-mini">
                                <FaMoneyBillWave className="stat-mini-icon" />
                                <div>
                                    <span className="stat-mini-value">{formatCurrency(stats.stats.feeSummary.total_paid)}</span>
                                    <span className="stat-mini-label">Total Fees Collected</span>
                                </div>
                            </div>
                            <div className="stat-mini">
                                <FaMoneyBillWave className="stat-mini-icon" style={{ color: '#F59E0B' }} />
                                <div>
                                    <span className="stat-mini-value">{formatCurrency(stats.stats.feeSummary.balance)}</span>
                                    <span className="stat-mini-label">Outstanding Balance</span>
                                </div>
                            </div>
                        </div>

                        <div className="quick-actions">
                            <h2>Quick Actions</h2>
                            <div className="actions-grid">
                                {quickActions.map((action, index) => (
                                    <button
                                        key={index}
                                        className="action-btn"
                                        style={{ '--hover-color': action.color }}
                                        onClick={() => navigate(action.path)}
                                    >
                                        <span className="action-icon" style={{ color: action.color }}>{action.icon}</span>
                                        {action.title}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}

export default Dashboard;