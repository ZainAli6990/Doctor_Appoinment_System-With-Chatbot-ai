import { Link } from "react-router-dom";
import { FaHouse, FaHeartPulse } from "react-icons/fa6";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-primary flex items-center justify-center px-4 relative overflow-hidden">
      <div className="pointer-events-none absolute -top-24 -left-24 w-96 h-96 rounded-full bg-white/5 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 -right-24 w-96 h-96 rounded-full bg-accent/20 blur-3xl float-slow" />

      <div className="card max-w-lg w-full p-10 text-center relative reveal-up">
        <span className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-light text-primary text-2xl mx-auto mb-6">
          <FaHeartPulse />
        </span>

        <h1 className="font-mono text-6xl font-semibold text-primary">404</h1>
        <h2 className="font-display text-2xl font-semibold text-ink mt-3">
          Page Not Found
        </h2>
        <p className="text-muted mt-3">
          The page you're looking for doesn't exist or has moved.
        </p>

        <Link to="/" className="btn-primary inline-flex mt-8">
          <FaHouse />
          Back to Home
        </Link>
      </div>
    </div>
  );
}
