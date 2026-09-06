import { useState } from "react";
import { useLocation, useNavigate, Link } from "react-router-dom";
import { FaEnvelope, FaHeartPulse, FaKey } from "react-icons/fa6";
import api from "../../services/api";
import { useAuth } from "../../context/AuthContext";
import { useToast } from "../../context/ToastContext";

export default function VerifyOtp() {
  const navigate = useNavigate();
  const location = useLocation();

  const { login } = useAuth();
  const toast = useToast();

  const email = location.state?.email || "";

  const [otp, setOtp] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleOtpChange = (e) => {
    const value = e.target.value.replace(/\D/g, "");

    if (value.length <= 6) {
      setOtp(value);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");

    if (!email) {
      setError("Registration email is missing. Please register again.");
      return;
    }

    if (otp.length !== 6) {
      setError("Please enter the 6-digit OTP.");
      return;
    }

    setLoading(true);

    try {
      const response = await api.post("/verify-otp", {
        email: email,
        otp: otp,
      });

      // Login user after successful OTP verification
      login(response.data.data, response.data.token);

      toast.success("Email verified! Account created successfully.");

      navigate("/my-appointments");
    } catch (err) {
      if (err.response?.status === 422) {
        const firstError = Object.values(
          err.response.data.errors || {}
        )[0]?.[0];

        setError(
          firstError ||
            err.response.data.message ||
            "Invalid OTP."
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

      {/* Background Effects */}
      <div className="pointer-events-none absolute -top-24 -left-24 w-96 h-96 rounded-full bg-white/5 blur-3xl" />

      <div className="pointer-events-none absolute -bottom-24 -right-24 w-96 h-96 rounded-full bg-accent/20 blur-3xl float-slow" />

      {/* Card */}
      <div className="card w-full max-w-md p-8 md:p-10 relative reveal-up">

        {/* Header */}
        <div className="text-center mb-8">

          <span className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-light text-primary text-2xl mx-auto mb-4">
            <FaHeartPulse />
          </span>

          <h1 className="font-display text-3xl font-semibold text-ink">
            Verify Your Email
          </h1>

          <p className="text-muted mt-2">
            Enter the 6-digit OTP sent to your email
          </p>

        </div>

        {/* Email */}
        <div className="flex items-center gap-3 bg-primary-light rounded-xl p-4 mb-5">

          <FaEnvelope className="text-primary" />

          <div className="min-w-0">
            <p className="text-xs text-muted">
              OTP sent to
            </p>

            <p className="text-sm font-semibold text-ink truncate">
              {email || "Email not available"}
            </p>
          </div>

        </div>

        {/* Error */}
        {error && (
          <div className="bg-danger-light border border-danger/20 text-danger text-sm rounded-xl p-3.5 mb-5">
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">

          <div className="relative">

            <FaKey className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" />

            <input
              type="text"
              inputMode="numeric"
              autoComplete="one-time-code"
              name="otp"
              value={otp}
              onChange={handleOtpChange}
              placeholder="Enter 6-digit OTP"
              maxLength={6}
              className="input-field !pl-11 text-center tracking-[0.5em] font-semibold text-lg"
              required
            />

          </div>

          <button
            type="submit"
            disabled={loading || otp.length !== 6}
            className="btn-primary w-full !py-4 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? "Verifying..." : "Verify OTP"}
          </button>

        </form>

        {/* Back to Register */}
        <p className="text-center text-muted mt-6 text-sm">
          Didn't receive an OTP?{" "}

          <Link
            to="/register"
            className="text-primary font-semibold"
          >
            Register Again
          </Link>
        </p>

      </div>
    </div>
  );
}