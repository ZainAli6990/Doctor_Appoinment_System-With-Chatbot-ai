import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaEnvelope, FaLock, FaHeartPulse } from "react-icons/fa6";
import api from "../../services/api";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";

const HOME_BY_ROLE = {
  admin: "/dashboard",
  doctor: "/doctor-dashboard",
  user: "/my-appointments",
};

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const toast = useToast();

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await api.post("/login", formData);
      const account = response.data.data;

      login(account, response.data.token);
      toast.success(`Welcome back, ${account.name?.split(" ")[0] ?? ""}!`);

      navigate(HOME_BY_ROLE[account.role] ?? "/");
    } catch (err) {
      if (err.response?.status === 422) {
        const firstError = Object.values(
          err.response.data.errors || {}
        )[0]?.[0];
        setError(firstError || "Invalid input.");
      } else if (err.response?.status === 401 || err.response?.status === 403) {
        setError(err.response.data.message || "Invalid email or password.");
      } else {
        setError("Server not responding. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-primary flex items-center justify-center px-4 relative overflow-hidden">
      <div className="pointer-events-none absolute -top-24 -left-24 w-96 h-96 rounded-full bg-white/5 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 -right-24 w-96 h-96 rounded-full bg-accent/20 blur-3xl float-slow" />

      <div className="card w-full max-w-md p-8 md:p-10 relative reveal-up">
        <div className="text-center mb-8">
          <span className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-light text-primary text-2xl mx-auto mb-4">
            <FaHeartPulse />
          </span>
          <h1 className="font-display text-3xl font-semibold text-ink">
            Welcome Back
          </h1>
          <p className="text-muted mt-2">
            Sign in as a patient, doctor, or admin
          </p>
        </div>

        {error && (
          <div className="bg-danger-light border border-danger/20 text-danger text-sm rounded-xl p-3.5 mb-5">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <FaEnvelope className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" />
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Email"
              className="input-field !pl-11"
              required
            />
          </div>

          <div className="relative">
            <FaLock className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" />
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Password"
              className="input-field !pl-11"
              required
            />
          </div>

          <div className="text-right -mt-1">
            <Link to="/forgot-password" className="text-sm text-primary font-semibold">
              Forgot Password?
            </Link>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full !py-4"
          >
            {loading ? "Signing in..." : "Login"}
          </button>
        </form>

        <p className="text-center text-muted mt-6 text-sm">
          Don't have an account?{" "}
          <Link to="/register" className="text-primary font-semibold">
            Register as a patient
          </Link>
        </p>

        <p className="text-center text-xs text-muted/70 mt-4">
          Demo admin: admin@example.com / password123
        </p>
      </div>
    </div>
  );
}
