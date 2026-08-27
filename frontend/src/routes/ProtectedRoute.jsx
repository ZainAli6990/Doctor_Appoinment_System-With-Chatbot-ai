import { Navigate } from "react-router-dom";

const HOME_BY_ROLE = {
  admin: "/dashboard",
  doctor: "/doctor-dashboard",
  user: "/my-appointments",
};

/**
 * Guards a route by login + role.
 *
 * allowedRoles: array of roles permitted here, e.g. ['admin'] or ['doctor'].
 * If omitted, any logged-in role may access (just needs to be authenticated).
 *
 * This is a UX convenience only — the real security boundary is the
 * Laravel backend (route middleware + ownership checks in controllers).
 * Even if this component were bypassed, every API call would still be
 * rejected server-side for the wrong role.
 */
export default function ProtectedRoute({ children, allowedRoles }) {
  const token = localStorage.getItem("token");

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  let role = null;
  try {
    role = JSON.parse(localStorage.getItem("user"))?.role ?? null;
  } catch {
    role = null;
  }

  if (!role) {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(role)) {
    // Logged in, but wrong portal — send them to their own home instead
    // of silently logging them out.
    return <Navigate to={HOME_BY_ROLE[role] ?? "/"} replace />;
  }

  return children;
}
