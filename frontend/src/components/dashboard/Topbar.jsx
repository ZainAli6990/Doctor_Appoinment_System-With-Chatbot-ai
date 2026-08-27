import { useEffect, useRef, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import {
  FaBell,
  FaMagnifyingGlass,
  FaUserGear,
  FaUserDoctor,
  FaUser,
  FaCalendarCheck,
} from "react-icons/fa6";
import api from "../../services/api";
import { useAuth } from "../../context/AuthContext";

export default function Topbar({ title = "Admin Dashboard", subtitle = "Welcome back" }) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const isAdmin = user?.role === "admin";
  const isDoctor = user?.role === "doctor";

  const profilePath = isDoctor ? "/doctor/profile" : "/dashboard/settings";
  const appointmentsPath = isDoctor ? "/doctor/appointments" : "/dashboard/appointments";
  const roleLabel = isDoctor ? "Doctor" : "Administrator";

  // Notifications
  const [pending, setPending] = useState([]);
  const [notifOpen, setNotifOpen] = useState(false);
  const notifRef = useRef(null);

  // Global search (admin only — the endpoints it uses are admin-only)
  const [query, setQuery] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const [searching, setSearching] = useState(false);
  const [results, setResults] = useState({ doctors: [], patients: [], appointments: [] });
  const searchRef = useRef(null);

  useEffect(() => {
    if (isAdmin) {
      api
        .get("/appointments/recent")
        .then((response) => {
          const list = (response.data.data || []).filter((a) => a.status === "Pending");
          setPending(list);
        })
        .catch(() => {});
    } else if (isDoctor) {
      api
        .get("/doctor/appointments")
        .then((response) => {
          const list = (response.data.data || [])
            .filter((a) => a.status === "Pending")
            .slice(0, 5);
          setPending(list);
        })
        .catch(() => {});
    }
  }, [isAdmin, isDoctor]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) setNotifOpen(false);
      if (searchRef.current && !searchRef.current.contains(e.target)) setSearchOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (!isAdmin || query.trim().length < 2) {
      setResults({ doctors: [], patients: [], appointments: [] });
      return;
    }

    setSearching(true);

    const timer = setTimeout(async () => {
      const q = query.trim().toLowerCase();

      try {
        const [doctorsRes, patientsRes, appointmentsRes] = await Promise.allSettled([
          api.get(`/doctors?search=${encodeURIComponent(query)}`),
          api.get("/patients"),
          api.get("/appointments"),
        ]);

        const doctors =
          doctorsRes.status === "fulfilled" ? doctorsRes.value.data.data.slice(0, 5) : [];

        const patients =
          patientsRes.status === "fulfilled"
            ? patientsRes.value.data.data
                .filter(
                  (p) =>
                    p.name.toLowerCase().includes(q) ||
                    p.phone?.toLowerCase().includes(q) ||
                    p.email?.toLowerCase().includes(q)
                )
                .slice(0, 5)
            : [];

        const appointments =
          appointmentsRes.status === "fulfilled"
            ? appointmentsRes.value.data.data
                .filter(
                  (a) =>
                    a.patient?.name?.toLowerCase().includes(q) ||
                    a.user?.name?.toLowerCase().includes(q) ||
                    a.doctor?.name?.toLowerCase().includes(q)
                )
                .slice(0, 5)
            : [];

        setResults({ doctors, patients, appointments });
      } catch (error) {
        console.log(error);
      } finally {
        setSearching(false);
      }
    }, 350);

    return () => clearTimeout(timer);
  }, [query, isAdmin]);

  const hasResults =
    results.doctors.length + results.patients.length + results.appointments.length > 0;

  const goTo = (path) => {
    setSearchOpen(false);
    setQuery("");
    navigate(path);
  };

  return (
    <header className="bg-white/80 backdrop-blur-md border-b border-line sticky top-0 z-30 px-8 py-5 flex justify-between items-center">
      <div>
        <h2 className="font-display text-2xl font-semibold text-ink">{title}</h2>
        <p className="text-muted mt-0.5 text-sm">{subtitle} 👋</p>
      </div>

      <div className="flex items-center gap-4">
        {isAdmin && (
          <div className="relative hidden md:block" ref={searchRef}>
            <FaMagnifyingGlass className="absolute left-4 top-1/2 -translate-y-1/2 text-muted text-sm" />
            <input
              type="text"
              placeholder="Search doctors, patients, appointments..."
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setSearchOpen(true);
              }}
              onFocus={() => setSearchOpen(true)}
              className="pl-11 pr-4 py-2.5 border border-line rounded-xl w-72 text-sm focus:outline-none focus:ring-4 focus:ring-primary-light focus:border-primary transition-all"
            />

            {searchOpen && query.trim().length >= 2 && (
              <div className="absolute left-0 mt-2 w-96 card p-2 z-50 reveal-up max-h-[26rem] overflow-y-auto">
                {searching ? (
                  <p className="text-center text-muted text-sm py-6">Searching...</p>
                ) : !hasResults ? (
                  <p className="text-center text-muted text-sm py-6">No results for "{query}"</p>
                ) : (
                  <>
                    {results.doctors.length > 0 && (
                      <div className="mb-1">
                        <p className="px-3 pt-2 pb-1 text-xs font-bold uppercase tracking-wide text-muted">
                          Doctors
                        </p>
                        {results.doctors.map((d) => (
                          <button
                            key={`d-${d.id}`}
                            onClick={() => goTo(`/dashboard/edit-doctor/${d.id}`)}
                            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-primary-light/50 transition-colors text-left"
                          >
                            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-light text-primary text-xs">
                              <FaUserDoctor />
                            </span>
                            <div>
                              <p className="text-sm font-semibold text-ink">{d.name}</p>
                              <p className="text-xs text-muted">{d.specialization?.name}</p>
                            </div>
                          </button>
                        ))}
                      </div>
                    )}

                    {results.patients.length > 0 && (
                      <div className="mb-1">
                        <p className="px-3 pt-2 pb-1 text-xs font-bold uppercase tracking-wide text-muted">
                          Patients
                        </p>
                        {results.patients.map((p) => (
                          <button
                            key={`p-${p.id}`}
                            onClick={() => goTo("/dashboard/patients")}
                            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-primary-light/50 transition-colors text-left"
                          >
                            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent-light text-accent-dark text-xs">
                              <FaUser />
                            </span>
                            <div>
                              <p className="text-sm font-semibold text-ink">{p.name}</p>
                              <p className="text-xs text-muted">{p.phone}</p>
                            </div>
                          </button>
                        ))}
                      </div>
                    )}

                    {results.appointments.length > 0 && (
                      <div>
                        <p className="px-3 pt-2 pb-1 text-xs font-bold uppercase tracking-wide text-muted">
                          Appointments
                        </p>
                        {results.appointments.map((a) => (
                          <button
                            key={`a-${a.id}`}
                            onClick={() => goTo("/dashboard/appointments")}
                            className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-primary-light/50 transition-colors text-left"
                          >
                            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-success-light text-success text-xs">
                              <FaCalendarCheck />
                            </span>
                            <div>
                              <p className="text-sm font-semibold text-ink">
                                {(a.user?.name ?? a.patient?.name)} → {a.doctor?.name}
                              </p>
                              <p className="text-xs text-muted">
                                {a.appointment_date} · {a.status}
                              </p>
                            </div>
                          </button>
                        ))}
                      </div>
                    )}
                  </>
                )}
              </div>
            )}
          </div>
        )}

        <div className="relative" ref={notifRef}>
          <button
            onClick={() => setNotifOpen(!notifOpen)}
            className="relative bg-primary-light hover:bg-primary-light/70 p-3 rounded-xl transition-colors"
          >
            <FaBell className="text-lg text-primary" />
            {pending.length > 0 && (
              <span className="absolute -top-1 -right-1 bg-accent text-white text-[10px] rounded-full w-5 h-5 flex items-center justify-center">
                {pending.length}
              </span>
            )}
          </button>

          {notifOpen && (
            <div className="absolute right-0 mt-3 w-80 card p-2 z-50 reveal-up">
              <div className="px-3 py-2 border-b border-line/70">
                <h4 className="font-semibold text-sm text-ink">Pending Appointments</h4>
              </div>

              <div className="max-h-72 overflow-y-auto">
                {pending.length === 0 ? (
                  <p className="text-center text-muted text-sm py-6">
                    No pending appointments
                  </p>
                ) : (
                  pending.map((a) => (
                    <div
                      key={a.id}
                      className="px-3 py-2.5 rounded-lg hover:bg-primary-light/50 transition-colors"
                    >
                      <p className="text-sm font-semibold text-ink">
                        {a.user?.name ?? a.patient?.name ?? "Patient"}
                      </p>
                      <p className="text-xs text-muted">
                        {isDoctor
                          ? `${a.appointment_date} · ${a.appointment_time}`
                          : `with Dr. ${a.doctor?.name ?? "—"} · ${a.appointment_date}`}
                      </p>
                    </div>
                  ))
                )}
              </div>

              <Link
                to={appointmentsPath}
                onClick={() => setNotifOpen(false)}
                className="block text-center text-sm font-semibold text-primary py-2.5 mt-1 border-t border-line/70 hover:bg-primary-light/50 rounded-lg transition-colors"
              >
                View All Appointments
              </Link>
            </div>
          )}
        </div>

        <Link to={profilePath} className="flex items-center gap-3 pl-4 border-l border-line">
          <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-white">
            <FaUserGear />
          </span>
          <div className="hidden sm:block">
            <h3 className="font-semibold text-sm text-ink">{user?.name ?? "Admin"}</h3>
            <p className="text-xs text-muted">{roleLabel}</p>
          </div>
        </Link>
      </div>
    </header>
  );
}
