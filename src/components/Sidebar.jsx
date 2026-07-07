import { Link } from "react-router-dom";

import {
  FaTachometerAlt,
  FaUserGraduate,
  FaChalkboardTeacher,
  FaClipboardList,
  FaCalendarCheck,
  FaBook,
  FaMoneyBillWave,
  FaChartBar,
  FaCog,
  FaUserTie,
  FaUsers,
  FaClipboardCheck,
  FaBullhorn,
  FaBell,
} from "react-icons/fa";

import "./Sidebar.css";

function Sidebar() {
  return (
    <div className="sidebar">
      <div className="logo">
        <h2>GSEMS</h2>
        <p>German School ERP</p>
      </div>

      <div className="menu">
        <Link to="/dashboard">
          <FaTachometerAlt />
          Dashboard
        </Link>

        <Link to="/students">
          <FaUserGraduate />
          Students
        </Link>

        <Link to="/teachers">
          <FaChalkboardTeacher />
          Teachers
        </Link>

        <Link to="/admissions">
          <FaClipboardList />
          Admissions
        </Link>

        <Link to="/attendance">
          <FaCalendarCheck />
          Attendance
        </Link>

        <Link to="/subjects">
          <FaBook />
          Subjects
        </Link>

        <Link to="/teacher-subjects">
          <FaUserTie />
          Teacher Subjects
        </Link>

        <Link to="/student-subjects">
          <FaUsers />
          Student Subjects
        </Link>

        <Link to="/assessments">
          <FaClipboardCheck />
          Assessments
        </Link>

        <Link to="/reports">
          <FaChartBar />
          Reports
        </Link>

        <Link to="/announcements">
          <FaBullhorn />
          Announcements
        </Link>

        <Link to="/notifications">
          <FaBell />
          Notifications
        </Link>

        <Link to="/payments">
          <FaMoneyBillWave />
          Payments
        </Link>

        <Link to="/settings">
          <FaCog />
          Settings
        </Link>
      </div>

      <div className="bottom">
        <p>German School of Excellence</p>
        <p>Adama, Ethiopia</p>
      </div>
    </div>
  );
}

export default Sidebar;