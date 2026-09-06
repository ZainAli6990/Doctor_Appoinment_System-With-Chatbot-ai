import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  FaUser,
  FaEnvelope,
  FaLock,
  FaPhone,
  FaHeartPulse,
} from "react-icons/fa6";
import api from "../../services/api";
import { useToast } from "../../context/ToastContext";

export default function Register() {
  const navigate = useNavigate();
  const toast = useToast();

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    password_confirmation: "",
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
      const response = await api.post("/register", formData);

      toast.success("OTP sent to your email!");

      navigate("/verify-otp", {
        state: {
          email: formData.email,
        },
      });
    } catch (err) {
      if (err.response?.status === 422) {
        const firstError = Object.values(
          err.response.data.errors || {}
        )[0]?.[0];

        setError(
          firstError ||
            err.response.data.message ||
            "Invalid input."
        );
      } else if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else {
        setError("Server not responding. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-primary flex items-center justify-center px-4 py-10 relative overflow-hidden">
      <div className="pointer-events-none absolute -top-24 -left-24 w-96 h-96 rounded-full bg-white/5 blur-3xl" />

      <div className="pointer-events-none absolute -bottom-24 -right-24 w-96 h-96 rounded-full bg-accent/20 blur-3xl float-slow" />

      <div className="card w-full max-w-md p-8 md:p-10 relative reveal-up">
        <div className="text-center mb-8">
          <span className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-light text-primary text-2xl mx-auto mb-4">
            <FaHeartPulse />
          </span>

          <h1 className="font-display text-3xl font-semibold text-ink">
            Create Your Account
          </h1>

          <p className="text-muted mt-2">
            Register as a patient to book appointments
          </p>
        </div>

        {error && (
          <div className="bg-danger-light border border-danger/20 text-danger text-sm rounded-xl p-3.5 mb-5">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Name */}
          <div className="relative">
            <FaUser className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" />

            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Full Name"
              className="input-field !pl-11"
              required
            />
          </div>

          {/* Email */}
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

          {/* Phone */}
          <div className="relative">
            <FaPhone className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" />

            <input
              type="text"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="Phone (optional)"
              className="input-field !pl-11"
            />
          </div>

          {/* Password */}
          <div className="relative">
            <FaLock className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" />

            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Password (min 6 characters)"
              className="input-field !pl-11"
              required
            />
          </div>

          {/* Confirm Password */}
          <div className="relative">
            <FaLock className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" />

            <input
              type="password"
              name="password_confirmation"
              value={formData.password_confirmation}
              onChange={handleChange}
              placeholder="Confirm Password"
              className="input-field !pl-11"
              required
            />
          </div>

          {/* Register Button */}
          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full !py-4"
          >
            {loading ? "Sending OTP..." : "Register"}
          </button>
        </form>

        <p className="text-center text-muted mt-6 text-sm">
          Already have an account?{" "}
          <Link to="/login" className="text-primary font-semibold">
            Login
          </Link>
        </p>
      </div>
    </div>
  );
}