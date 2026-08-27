import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  FaHouse,
  FaUserDoctor,
  FaUsers,
  FaCalendarCheck,
  FaStethoscope,
  FaGear,
  FaRightFromBracket,
  FaHeartPulse,
  FaClock,
} from "react-icons/fa6";
import api from "../../services/api";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";

const ADMIN_MENU = [
  { name: "Dashboard", icon: <FaHouse />, path: "/dashboard" },
  { name: "Doctors", icon: <FaUserDoctor />, path: "/dashboard/doctors" },
  { name: "Users", icon: <FaUsers />, path: "/dashboard/users" },
  { name: "Patients", icon: <FaUsers />, path: "/dashboard/patients" },
  { name: "Appointments", icon: <FaCalendarCheck />, path: "/dashboard/appointments" },
  { name: "Specializations", icon: <FaStethoscope />, path: "/dashboard/specializations" },
  { name: "Settings", icon: <FaGear />, path: "/dashboard/settings" },
];

const DOCTOR_MENU = [
  { name: "Dashboard", icon: <FaHouse />, path: "/doctor-dashboard" },
  { name: "Appointments", icon: <FaCalendarCheck />, path: "/doctor/appointments" },
  { name: "Availability", icon: <FaClock />, path: "/doctor/availability" },
  { name: "Profile", icon: <FaGear />, path: "/doctor/profile" },
];

export default function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const toast = useToast();

  const isDoctor = user?.role === "doctor";
  const menuItems = isDoctor ? DOCTOR_MENU : ADMIN_MENU;
  const profilePath = isDoctor ? "/doctor/profile" : "/dashboard/settings";

  const handleLogout = async () => {
    try {
      if (localStorage.getItem("token")) {
        await api.post("/logout");
      }
    } catch (error) {
      console.log(error);
    } finally {
      logout();
      toast.success("Logged out successfully.");
      navigate("/login");
    }
  };

  return (
    <aside className="fixed left-0 top-0 w-72 h-screen bg-primary-dark text-white flex flex-col z-40">
      {/* Logo */}
      <div className="p-6 border-b border-white/10">
        <div className="flex items-center gap-2.5">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent text-white shadow-md">
            <FaHeartPulse className="text-lg" />
          </span>
          <span className="font-display text-xl font-semibold">
            Sehat<span className="text-accent">Care</span>
          </span>
        </div>
        <p className="text-white/50 mt-3 text-xs font-medium uppercase tracking-widest">
          {isDoctor ? "Doctor Portal" : "Admin Dashboard"}
        </p>
      </div>

      {/* Menu */}
      <nav className="flex-1 overflow-y-auto px-4 py-6">
        {menuItems.map((item) => {
          const active = location.pathname === item.path;
          return (
            <Link
              key={item.name}
              to={item.path}
              className={`flex items-center gap-4 px-4 py-3.5 rounded-xl mb-2 transition-all duration-200 relative ${
                active
                  ? "bg-white text-primary-dark font-semibold shadow-lg"
                  : "text-white/70 hover:bg-white/10 hover:text-white"
              }`}
            >
              {active && (
                <span className="absolute -left-4 top-1/2 -translate-y-1/2 h-6 w-1 rounded-full bg-accent" />
              )}
              <span className="text-lg">{item.icon}</span>
              <span className="text-sm">{item.name}</span>
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-white/10">
        {user && (
          <Link
            to={profilePath}
            className="flex items-center gap-3 px-3 py-2.5 mb-3 rounded-xl hover:bg-white/10 transition-colors"
          >
            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent text-white text-sm font-bold">
              {user.name?.charAt(0)?.toUpperCase() ?? "A"}
            </span>
            <div className="text-left overflow-hidden">
              <p className="text-sm font-semibold text-white truncate">{user.name}</p>
              <p className="text-xs text-white/50 truncate">{user.email}</p>
            </div>
          </Link>
        )}

        <button
          onClick={handleLogout}
          className="flex items-center justify-center gap-3 w-full bg-danger hover:bg-danger/85 py-3 rounded-xl transition-colors font-medium"
        >
          <FaRightFromBracket />
          Logout
        </button>

        <p className="text-center text-xs text-white/40 mt-4">
          Doctor Booking System v1.0
        </p>
      </div>
    </aside>
  );
}
