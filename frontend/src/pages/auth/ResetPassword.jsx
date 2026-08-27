import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { FaLock, FaHeartPulse } from "react-icons/fa6";
import api from "../../services/api";
import { useToast } from "../../context/ToastContext";

export default function ResetPassword() {
  const navigate = useNavigate();
  const location = useLocation();
  const toast = useToast();

  // email + token were handed off from the Forgot Password step — this
  // page never shows them as fields, only the three requested inputs.
  const email = location.state?.email;
  const token = location.state?.token;

  const [form, setForm] = useState({
    password: "",
    password_confirmation: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Can't reset a password without knowing which account/token — send
    // the user back to start the flow properly.
    if (!email || !token) {
      navigate("/forgot-password", { replace: true });
    }
  }, [email, token, navigate]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await api.post("/reset-password", {
        email,
        token,
        password: form.password,
        password_confirmation: form.password_confirmation,
      });

      toast.success("Password reset successfully. Please log in.");
      navigate("/login");
    } catch (err) {
      if (err.response?.status === 422) {
        const firstError = Object.values(
          err.response.data.errors || {}
        )[0]?.[0];
        setError(firstError || err.response.data.message || "Invalid input.");
      } else if (err.response?.status === 403) {
        setError(err.response.data.message || "Unable to reset password.");
      } else {
        setError("Server not responding. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  if (!email || !token) return null;

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
            Reset Password
          </h1>
          <p className="text-muted mt-2">Choose a new password for your account</p>
        </div>

        {error && (
          <div className="bg-danger-light border border-danger/20 text-danger text-sm rounded-xl p-3.5 mb-5">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative">
            <FaLock className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" />
            <input
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              placeholder="New Password"
              className="input-field !pl-11"
              required
            />
          </div>

          <div className="relative">
            <FaLock className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" />
            <input
              type="password"
              name="password_confirmation"
              value={form.password_confirmation}
              onChange={handleChange}
              placeholder="Again New Password"
              className="input-field !pl-11"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full !py-4"
          >
            {loading ? "Updating..." : "Update Password"}
          </button>
        </form>

        <p className="text-center text-muted mt-6 text-sm">
          <Link to="/login" className="text-primary font-semibold">
            Back to Login
          </Link>
        </p>
      </div>
    </div>
  );
}
