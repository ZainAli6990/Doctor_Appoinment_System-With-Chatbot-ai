import { useEffect, useState } from "react";
import {
  FaCalendarDays,
  FaClock,
  FaCheck,
  FaXmark,
  FaCircleCheck,
} from "react-icons/fa6";

import Sidebar from "../../components/dashboard/Sidebar";
import Topbar from "../../components/dashboard/Topbar";
import api from "../../services/api";
import { useToast } from "../../context/ToastContext";
import { statusBadgeClass } from "../../utils/status";

export default function DoctorAppointments() {
  const toast = useToast();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState(null);

  const load = async () => {
    setLoading(true);
    try {
      const response = await api.get("/doctor/appointments");
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

  const changeStatus = async (appointment, status) => {
    setBusyId(appointment.id);
    try {
      await api.patch(`/doctor/appointments/${appointment.id}/status`, { status });
      toast.success(`Marked as ${status}.`);
      load();
    } catch (error) {
      toast.error(error.response?.data?.message || "Unable to update status.");
    } finally {
      setBusyId(null);
    }
  };

  const patientName = (appt) => appt.user?.name ?? appt.patient?.name ?? "Patient";
  const patientContact = (appt) => appt.user?.phone ?? appt.patient?.phone ?? appt.user?.email ?? appt.patient?.email ?? "—";

  return (
    <div className="flex bg-paper-dim min-h-screen">
      <Sidebar />

      <div className="flex-1 ml-72">
        <Topbar title="My Appointments" subtitle="Only appointments booked with you" />

        <div className="p-8">
          {loading ? (
            <p className="text-muted">Loading...</p>
          ) : appointments.length === 0 ? (
            <div className="card p-12 text-center text-muted">No appointments yet.</div>
          ) : (
            <div className="space-y-4">
              {appointments.map((appt) => (
                <div key={appt.id} className="card p-6 flex flex-col md:flex-row md:items-center gap-5">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 flex-wrap">
                      <h3 className="font-display text-lg font-semibold text-ink">
                        {patientName(appt)}
                      </h3>
                      <span className={`badge ${statusBadgeClass(appt.status)}`}>
                        {appt.status}
                      </span>
                    </div>
                    <p className="text-muted text-sm mt-1">{patientContact(appt)}</p>

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

                  <div className="flex gap-2 flex-wrap">
                    {appt.status === "Pending" && (
                      <>
                        <button
                          onClick={() => changeStatus(appt, "Confirmed")}
                          disabled={busyId === appt.id}
                          className="flex items-center gap-2 rounded-xl bg-success-light text-success px-4 py-2.5 text-sm font-semibold hover:bg-success hover:text-white transition-colors disabled:opacity-60"
                        >
                          <FaCheck /> Confirm
                        </button>
                        <button
                          onClick={() => changeStatus(appt, "Cancelled")}
                          disabled={busyId === appt.id}
                          className="flex items-center gap-2 rounded-xl bg-danger-light text-danger px-4 py-2.5 text-sm font-semibold hover:bg-danger hover:text-white transition-colors disabled:opacity-60"
                        >
                          <FaXmark /> Reject
                        </button>
                      </>
                    )}

                    {appt.status === "Confirmed" && (
                      <>
                        <button
                          onClick={() => changeStatus(appt, "Completed")}
                          disabled={busyId === appt.id}
                          className="flex items-center gap-2 rounded-xl bg-primary-light text-primary px-4 py-2.5 text-sm font-semibold hover:bg-primary hover:text-white transition-colors disabled:opacity-60"
                        >
                          <FaCircleCheck /> Complete
                        </button>
                        <button
                          onClick={() => changeStatus(appt, "Cancelled")}
                          disabled={busyId === appt.id}
                          className="flex items-center gap-2 rounded-xl bg-danger-light text-danger px-4 py-2.5 text-sm font-semibold hover:bg-danger hover:text-white transition-colors disabled:opacity-60"
                        >
                          <FaXmark /> Cancel
                        </button>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
