import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Link as ScrollLink } from "react-scroll";
import { FaBars, FaTimes } from "react-icons/fa";
import { FaHeartPulse, FaRightFromBracket } from "react-icons/fa6";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";
import api from "../../services/api";

const PORTAL_BY_ROLE = {
  admin: { label: "Dashboard", path: "/dashboard" },
  doctor: { label: "Doctor Dashboard", path: "/doctor-dashboard" },
  user: { label: "My Appointments", path: "/my-appointments" },
};

export default function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuth();
  const toast = useToast();
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const linkClass =
    "relative cursor-pointer font-medium text-ink/80 transition-colors duration-200 hover:text-primary after:absolute after:-bottom-1.5 after:left-0 after:h-[2px] after:w-0 after:bg-accent after:transition-all after:duration-300 hover:after:w-full";

  const portal = user?.role ? PORTAL_BY_ROLE[user.role] : null;

  const handleLogout = async () => {
    try {
      if (localStorage.getItem("token")) await api.post("/logout");
    } catch (error) {
      console.log(error);
    } finally {
      logout();
      toast.success("Logged out successfully.");
      setMenuOpen(false);
      navigate("/");
    }
  };

  const mobileLinks = [
    { to: "/", label: "Home" },
    { to: "/doctors", label: "Doctors" },
    ...(isAuthenticated && portal
      ? [
          { to: portal.path, label: portal.label },
          ...(user.role === "user" ? [{ to: "/profile", label: "Profile" }] : []),
        ]
      : [
          { to: "/login", label: "Login" },
          { to: "/register", label: "Register" },
        ]),
  ];

  return (
    <nav
      className={`fixed top-0 left-0 z-50 w-full transition-all duration-300 ${
        scrolled
          ? "bg-paper/90 backdrop-blur-md shadow-[0_1px_0_rgba(18,33,31,0.06)] py-3"
          : "bg-transparent py-5"
      }`}
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between px-6">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2.5 group">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-white shadow-md transition-transform duration-300 group-hover:scale-105">
            <FaHeartPulse className="text-lg" />
          </span>
          <span className="font-display text-xl font-semibold text-ink">
            Sehat<span className="text-accent">Care</span>
          </span>
        </Link>

        {/* Desktop Menu */}
        <div className="hidden md:flex items-center gap-9">
          {location.pathname === "/" ? (
            <>
              <ScrollLink to="hero" smooth={true} duration={500} className={linkClass}>
                Home
              </ScrollLink>
              <ScrollLink to="featured-doctors" smooth={true} duration={500} className={linkClass}>
                Doctors
              </ScrollLink>
              <ScrollLink to="departments" smooth={true} duration={500} className={linkClass}>
                Departments
              </ScrollLink>
              <ScrollLink to="contact" smooth={true} duration={500} className={linkClass}>
                Contact
              </ScrollLink>
            </>
          ) : (
            <>
              <Link to="/" className={linkClass}>Home</Link>
              <Link to="/doctors" className={linkClass}>Doctors</Link>
            </>
          )}

          {isAuthenticated && portal ? (
            <>
              {user.role === "user" && (
                <Link to="/profile" className={linkClass}>Profile</Link>
              )}
              <Link to={portal.path} className="btn-primary !px-5 !py-2.5 text-sm">
                {portal.label}
              </Link>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 font-medium text-ink/70 hover:text-danger transition-colors text-sm"
              >
                <FaRightFromBracket />
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className={linkClass}>Login</Link>
              <Link to="/register" className="btn-primary !px-5 !py-2.5 text-sm">
                Register
              </Link>
            </>
          )}
        </div>

        {/* Mobile Button */}
        <button
          className="md:hidden flex h-10 w-10 items-center justify-center rounded-lg bg-primary-light text-primary text-xl"
          onClick={() => setMenuOpen(!menuOpen)}
        >
          {menuOpen ? <FaTimes /> : <FaBars />}
        </button>
      </div>

      {/* Mobile Menu */}
      {menuOpen && (
        <div className="md:hidden mt-4 mx-4 rounded-2xl border border-line bg-white shadow-xl overflow-hidden reveal-up">
          {mobileLinks.map((item) => (
            <Link
              key={item.label}
              to={item.to}
              className="block px-6 py-4 font-medium text-ink border-b border-line/60 last:border-b-0 hover:bg-primary-light hover:text-primary transition-colors"
              onClick={() => setMenuOpen(false)}
            >
              {item.label}
            </Link>
          ))}
          {isAuthenticated && (
            <button
              onClick={handleLogout}
              className="w-full text-left px-6 py-4 font-medium text-danger hover:bg-danger-light transition-colors"
            >
              Logout
            </button>
          )}
        </div>
      )}
    </nav>
  );
}
