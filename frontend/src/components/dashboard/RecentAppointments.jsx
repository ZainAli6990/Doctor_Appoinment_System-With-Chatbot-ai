import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { FaTrash, FaArrowRight } from "react-icons/fa6";
import api from "../../services/api";
import { useToast } from "../../context/ToastContext";
import { statusBadgeClass } from "../../utils/status";

export default function RecentAppointments() {
  const toast = useToast();
  const [appointments, setAppointments] = useState([]);

  const loadAppointments = async () => {
    try {
      const response = await api.get("/appointments/recent");
      setAppointments(response.data.data);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    loadAppointments();
  }, []);

  const deleteAppointment = async (id) => {
    if (!window.confirm("Delete this appointment?")) return;

    try {
      await api.delete(`/appointments/${id}`);
      toast.success("Appointment deleted successfully.");
      loadAppointments();
    } catch (error) {
      console.log(error);
      toast.error(error.response?.data?.message || "Unable to delete appointment.");
    }
  };

  return (
    <div className="card p-6 mt-10">
      <div className="flex justify-between items-center mb-6">
        <h2 className="font-display text-2xl font-semibold text-ink">
          Recent Appointments
        </h2>

        <Link
          to="/dashboard/appointments"
          className="flex items-center gap-1.5 text-primary font-semibold text-sm hover:underline"
        >
          View All <FaArrowRight className="text-xs" />
        </Link>
      </div>

      {appointments.length === 0 ? (
        <div className="text-center py-10 text-muted">
          No recent appointments found.
        </div>
      ) : (
        <div className="table-shell !shadow-none !border-line/50 overflow-x-auto">
          <table>
            <thead>
              <tr>
                <th>Patient</th>
                <th>Doctor</th>
                <th>Date</th>
                <th>Time</th>
                <th>Status</th>
                <th className="text-center">Action</th>
              </tr>
            </thead>

            <tbody>
              {appointments.map((appointment) => (
                <tr key={appointment.id}>
                  <td className="font-medium">{appointment.user?.name ?? appointment.patient?.name}</td>
                  <td>{appointment.doctor?.name}</td>
                  <td>{appointment.appointment_date}</td>
                  <td>{appointment.appointment_time}</td>
                  <td>
                    <span className={`badge ${statusBadgeClass(appointment.status)}`}>
                      {appointment.status}
                    </span>
                  </td>
                  <td>
                    <div className="flex justify-center gap-2">
                      <button
                        onClick={() => deleteAppointment(appointment.id)}
                        className="icon-action bg-danger-light text-danger"
                      >
                        <FaTrash />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
