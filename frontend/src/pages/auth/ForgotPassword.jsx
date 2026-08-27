import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaEnvelope, FaHeartPulse, FaArrowLeft } from "react-icons/fa6";
import api from "../../services/api";

export default function ForgotPassword() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await api.post("/forgot-password", { email });

      // Carry the identified email + reset token to the Reset Password
      // step via router state (not shown as a field, not put in the URL).
      navigate("/reset-password", {
        state: {
          email: response.data.email,
          token: response.data.reset_token,
        },
      });
    } catch (err) {
      if (err.response?.status === 422) {
        const firstError = Object.values(
          err.response.data.errors || {}
        )[0]?.[0];
        setError(firstError || "Invalid input.");
      } else if (err.response?.status === 404 || err.response?.status === 403) {
        setError(err.response.data.message || "Unable to process this request.");
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
            Forgot Password
          </h1>
          <p className="text-muted mt-2">
            Enter your account email to reset your password
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
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email"
              className="input-field !pl-11"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full !py-4"
          >
            {loading ? "Please wait..." : "Continue"}
          </button>
        </form>

        <p className="text-center text-muted mt-6 text-sm">
          <Link to="/login" className="text-primary font-semibold inline-flex items-center gap-1.5">
            <FaArrowLeft className="text-xs" /> Back to Login
          </Link>
        </p>
      </div>
    </div>
  );
}
