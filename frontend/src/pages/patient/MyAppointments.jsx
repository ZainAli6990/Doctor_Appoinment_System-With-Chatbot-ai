import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  FaCalendarDays,
  FaClock,
  FaXmark,
  FaUserDoctor,
  FaCalendarPlus,
} from "react-icons/fa6";

import Navbar from "../../components/layout/Navbar";
import Footer from "../../components/layout/Footer";
import DoctorAvatar from "../../components/common/DoctorAvatar";
import api from "../../services/api";
import { useToast } from "../../context/ToastContext";
import { statusBadgeClass } from "../../utils/status";

export default function MyAppointments() {
  const toast = useToast();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cancellingId, setCancellingId] = useState(null);

  const load = async () => {
    setLoading(true);
    try {
      const response = await api.get("/my-appointments");
      setAppointments(response.data.data);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const cancelAppointment = async (id) => {
    if (!window.confirm("Cancel this appointment?")) return;

    setCancellingId(id);
    try {
      await api.patch(`/my-appointments/${id}/cancel`);
      toast.success("Appointment cancelled.");
      load();
    } catch (error) {
      toast.error(error.response?.data?.message || "Unable to cancel appointment.");
    } finally {
      setCancellingId(null);
    }
  };

  return (
    <>
      <Navbar />

      <section className="bg-primary pt-32 pb-16">
        <div className="max-w-5xl mx-auto px-6 text-center reveal-up">
          <span className="eyebrow !text-accent">Patient Portal</span>
          <h1 className="font-display text-4xl md:text-5xl font-semibold text-white mt-3">
            My Appointments
          </h1>
          <p className="text-white/70 mt-4">
            Track, review, and manage your upcoming visits.
          </p>

          <Link to="/doctors" className="btn-accent inline-flex mt-7">
            <FaCalendarPlus />
            Book New Appointment
          </Link>
        </div>
      </section>

      <section className="py-16 -mt-6">
        <div className="max-w-5xl mx-auto px-6">
          {loading ? (
            <p className="text-center text-muted py-10">Loading your appointments...</p>
          ) : appointments.length === 0 ? (
            <div className="card p-12 text-center">
              <FaCalendarDays className="text-4xl text-primary mx-auto mb-4" />
              <h3 className="font-display text-xl font-semibold text-ink">
                No appointments yet
              </h3>
              <p className="text-muted mt-2">
                Browse our doctors and book your first appointment.
              </p>
              <Link to="/doctors" className="btn-primary inline-flex mt-6">
                Find a Doctor
              </Link>
            </div>
          ) : (
            <div className="space-y-5">
              {appointments.map((appt) => (
                <div key={appt.id} className="card p-6 flex flex-col md:flex-row md:items-center gap-5">
                  <DoctorAvatar doctor={appt.doctor} size="sm" />

                  <div className="flex-1">
                    <div className="flex items-center gap-3 flex-wrap">
                      <h3 className="font-display text-lg font-semibold text-ink">
                        {appt.doctor?.name ?? "Doctor"}
                      </h3>
                      <span className={`badge ${statusBadgeClass(appt.status)}`}>
                        {appt.status}
                      </span>
                    </div>
                    <p className="text-accent-dark text-xs font-semibold uppercase tracking-wide mt-1">
                      {appt.doctor?.specialization?.name}
                    </p>

                    <div className="flex flex-wrap gap-5 mt-3 text-sm text-ink/70">
                      <span className="flex items-center gap-2">
                        <FaCalendarDays className="text-primary" /> {appt.appointment_date}
                      </span>
                      <span className="flex items-center gap-2">
                        <FaClock className="text-primary" /> {appt.appointment_time}
                      </span>
                    </div>

                    {appt.notes && (
                      <p className="text-sm text-muted mt-2 italic">"{appt.notes}"</p>
                    )}
                  </div>

                  {(appt.status === "Pending" || appt.status === "Confirmed") && (
                    <button
                      onClick={() => cancelAppointment(appt.id)}
                      disabled={cancellingId === appt.id}
                      className="flex items-center justify-center gap-2 rounded-xl bg-danger-light text-danger px-4 py-2.5 text-sm font-semibold hover:bg-danger hover:text-white transition-colors duration-300 disabled:opacity-60"
                    >
                      <FaXmark />
                      {cancellingId === appt.id ? "Cancelling..." : "Cancel"}
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      <Footer />
    </>
  );
}
