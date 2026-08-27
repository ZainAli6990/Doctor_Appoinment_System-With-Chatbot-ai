import { Routes, Route } from "react-router-dom";

// Public Pages
import Home from "./pages/public/Home";
import Doctors from "./pages/public/Doctors";
import BookAppointment from "./pages/public/BookAppointment";
import NotFound from "./pages/public/NotFound";

// Auth Pages
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import ForgotPassword from "./pages/auth/ForgotPassword";
import ResetPassword from "./pages/auth/ResetPassword";

// Admin Dashboard Pages
import Dashboard from "./pages/dashboard/Dashboard";
import DashboardDoctors from "./pages/dashboard/Doctors";
import AddDoctor from "./pages/dashboard/AddDoctor";
import EditDoctor from "./pages/dashboard/EditDoctor";
import Patients from "./pages/dashboard/Patients";
import Users from "./pages/dashboard/Users";
import Appoinment from "./pages/dashboard/Appoinment";
import Specializations from "./pages/dashboard/Specializations";
import Settings from "./pages/dashboard/Settings";

// Doctor Portal Pages
import DoctorDashboard from "./pages/doctor/Dashboard";
import DoctorAppointments from "./pages/doctor/Appointments";
import DoctorAvailability from "./pages/doctor/Availability";
import DoctorProfile from "./pages/doctor/Profile";

// Patient Portal Pages
import MyAppointments from "./pages/patient/MyAppointments";
import PatientProfile from "./pages/patient/Profile";

import ProtectedRoute from "./routes/ProtectedRoute";
import Chatbot from "./components/chatbot/Chatbot";

function App() {
  return (
    <>
      <Routes>

        {/* Public Routes */}
        <Route path="/" element={<Home />} />
        <Route path="/doctors" element={<Doctors />} />
        <Route path="/book/:id" element={<BookAppointment />} />

        {/* Auth Routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password" element={<ResetPassword />} />

        {/* Patient Portal (role = user) */}
        <Route
          path="/my-appointments"
          element={
            <ProtectedRoute allowedRoles={["user"]}>
              <MyAppointments />
            </ProtectedRoute>
          }
        />

        <Route
          path="/profile"
          element={
            <ProtectedRoute allowedRoles={["user"]}>
              <PatientProfile />
            </ProtectedRoute>
          }
        />

        {/* Doctor Portal (role = doctor) */}
        <Route
          path="/doctor-dashboard"
          element={
            <ProtectedRoute allowedRoles={["doctor"]}>
              <DoctorDashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/doctor/appointments"
          element={
            <ProtectedRoute allowedRoles={["doctor"]}>
              <DoctorAppointments />
            </ProtectedRoute>
          }
        />

        <Route
          path="/doctor/availability"
          element={
            <ProtectedRoute allowedRoles={["doctor"]}>
              <DoctorAvailability />
            </ProtectedRoute>
          }
        />

        <Route
          path="/doctor/profile"
          element={
            <ProtectedRoute allowedRoles={["doctor"]}>
              <DoctorProfile />
            </ProtectedRoute>
          }
        />

        {/* Admin Dashboard (role = admin) */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <Dashboard />
            </ProtectedRoute>
          }
        />

        <Route
          path="/dashboard/doctors"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <DashboardDoctors />
            </ProtectedRoute>
          }
        />

        <Route
          path="/dashboard/add-doctor"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <AddDoctor />
            </ProtectedRoute>
          }
        />

        <Route
          path="/dashboard/edit-doctor/:id"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <EditDoctor />
            </ProtectedRoute>
          }
        />

        <Route
          path="/dashboard/patients"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <Patients />
            </ProtectedRoute>
          }
        />

        <Route
          path="/dashboard/users"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <Users />
            </ProtectedRoute>
          }
        />

        <Route
          path="/dashboard/appointments"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <Appoinment />
            </ProtectedRoute>
          }
        />

        <Route
          path="/dashboard/specializations"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <Specializations />
            </ProtectedRoute>
          }
        />

        <Route
          path="/dashboard/settings"
          element={
            <ProtectedRoute allowedRoles={["admin"]}>
              <Settings />
            </ProtectedRoute>
          }
        />

        {/* 404 */}
        <Route path="*" element={<NotFound />} />

      </Routes>

      {/* AI Chatbot */}
      <Chatbot />
    </>
  );
}

export default App;