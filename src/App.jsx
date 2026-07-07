import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Students from "./pages/Students";
import Teachers from "./pages/Teachers";
import Attendance from "./pages/Attendance";
import Admissions from "./pages/Admissions";
import Subjects from "./pages/Subjects";
import TeacherSubjects from "./pages/TeacherSubjects";
import StudentSubjects from "./pages/StudentSubjects";
import Assessments from "./pages/Assessments";
import Reports from "./pages/Reports";
import Payments from "./pages/Payments";
import Settings from "./pages/Settings";
import StudentLogin from "./pages/StudentLogin";
import StudentDashboard from "./pages/StudentDashboard";
import ForgotPassword from "./pages/ForgotPassword";
import Announcements from "./pages/Announcements";
import Notifications from "./pages/Notifications";

function App() {
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");
  
  const isAuthenticated = !!token;
  const isAdmin = role === "ADMIN";
  const isStudent = role === "STUDENT";

  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/student-login" element={<StudentLogin />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/student-forgot-password" element={<ForgotPassword />} />
        
        {/* Admin Routes - Only accessible by ADMIN role */}
        <Route
          path="/"
          element={
            isAuthenticated && isAdmin ? <Dashboard /> : 
            isAuthenticated && isStudent ? <Navigate to="/student-dashboard" /> :
            <Navigate to="/login" />
          }
        />
        <Route
          path="/dashboard"
          element={
            isAuthenticated && isAdmin ? <Dashboard /> : 
            isAuthenticated && isStudent ? <Navigate to="/student-dashboard" /> :
            <Navigate to="/login" />
          }
        />
        <Route
          path="/students"
          element={
            isAuthenticated && isAdmin ? <Students /> : 
            isAuthenticated && isStudent ? <Navigate to="/student-dashboard" /> :
            <Navigate to="/login" />
          }
        />
        <Route
          path="/teachers"
          element={
            isAuthenticated && isAdmin ? <Teachers /> : 
            isAuthenticated && isStudent ? <Navigate to="/student-dashboard" /> :
            <Navigate to="/login" />
          }
        />
        <Route
          path="/attendance"
          element={
            isAuthenticated && isAdmin ? <Attendance /> : 
            isAuthenticated && isStudent ? <Navigate to="/student-dashboard" /> :
            <Navigate to="/login" />
          }
        />
        <Route
          path="/admissions"
          element={
            isAuthenticated && isAdmin ? <Admissions /> : 
            isAuthenticated && isStudent ? <Navigate to="/student-dashboard" /> :
            <Navigate to="/login" />
          }
        />
        <Route
          path="/subjects"
          element={
            isAuthenticated && isAdmin ? <Subjects /> : 
            isAuthenticated && isStudent ? <Navigate to="/student-dashboard" /> :
            <Navigate to="/login" />
          }
        />
        <Route
          path="/teacher-subjects"
          element={
            isAuthenticated && isAdmin ? <TeacherSubjects /> : 
            isAuthenticated && isStudent ? <Navigate to="/student-dashboard" /> :
            <Navigate to="/login" />
          }
        />
        <Route
          path="/student-subjects"
          element={
            isAuthenticated && isAdmin ? <StudentSubjects /> : 
            isAuthenticated && isStudent ? <Navigate to="/student-dashboard" /> :
            <Navigate to="/login" />
          }
        />
        <Route
          path="/assessments"
          element={
            isAuthenticated && isAdmin ? <Assessments /> : 
            isAuthenticated && isStudent ? <Navigate to="/student-dashboard" /> :
            <Navigate to="/login" />
          }
        />
        <Route
          path="/reports"
          element={
            isAuthenticated && isAdmin ? <Reports /> : 
            isAuthenticated && isStudent ? <Navigate to="/student-dashboard" /> :
            <Navigate to="/login" />
          }
        />
        <Route
          path="/payments"
          element={
            isAuthenticated && isAdmin ? <Payments /> : 
            isAuthenticated && isStudent ? <Navigate to="/student-dashboard" /> :
            <Navigate to="/login" />
          }
        />
        <Route
          path="/settings"
          element={
            isAuthenticated && isAdmin ? <Settings /> : 
            isAuthenticated && isStudent ? <Navigate to="/student-dashboard" /> :
            <Navigate to="/login" />
          }
        />
        <Route
          path="/announcements"
          element={
            isAuthenticated && isAdmin ? <Announcements /> : 
            isAuthenticated && isStudent ? <Navigate to="/student-dashboard" /> :
            <Navigate to="/login" />
          }
        />
        <Route
          path="/notifications"
          element={
            isAuthenticated && isAdmin ? <Notifications /> : 
            isAuthenticated && isStudent ? <Navigate to="/student-dashboard" /> :
            <Navigate to="/login" />
          }
        />
        
        {/* Student Routes - Only accessible by STUDENT role */}
        <Route
          path="/student-dashboard"
          element={
            isAuthenticated && isStudent ? <StudentDashboard /> :
            isAuthenticated && isAdmin ? <Navigate to="/dashboard" /> :
            <Navigate to="/student-login" />
          }
        />
        
        {/* Catch all - redirect based on role */}
        <Route
          path="*"
          element={
            isAuthenticated ? 
              (isAdmin ? <Navigate to="/dashboard" /> : <Navigate to="/student-dashboard" />) :
              <Navigate to="/login" />
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;