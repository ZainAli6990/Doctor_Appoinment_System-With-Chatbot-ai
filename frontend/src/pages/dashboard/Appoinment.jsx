import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { FaPlus, FaTrash, FaXmark, FaCalendarCheck } from "react-icons/fa6";

import Sidebar from "../../components/dashboard/Sidebar";
import Topbar from "../../components/dashboard/Topbar";
import Pagination from "../../components/ui/Pagination";
import api from "../../services/api";
import { useToast } from "../../context/ToastContext";
import { statusBadgeClass } from "../../utils/status";

const emptyForm = {
  doctor_id: "",
  patient_source: "user", // 'user' (registered) or 'walkin' (legacy patient record)
  patient_id: "",
  user_id: "",
  appointment_date: "",
  appointment_time: "",
  status: "Pending",
  notes: "",
};

const PER_PAGE = 8;

export default function Appoinment() {
  const toast = useToast();
  const [page, setPage] = useState(1);
  const [appointments, setAppointments] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [patients, setPatients] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState(false);

  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState(emptyForm);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  const loadAppointments = async () => {
    setLoading(true);
    setAuthError(false);

    try {
      const response = await api.get("/appointments");
      setAppointments(response.data.data);
    } catch (error) {
      console.log(error);
      if (error.response?.status === 401) {
        setAuthError(true);
      }
    } finally {
      setLoading(false);
    }
  };

  const loadDoctors = async () => {
    try {
      const response = await api.get("/doctors");
      setDoctors(response.data.data);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    loadAppointments();
    loadDoctors();
  }, []);

  const loadPatientSources = async () => {
    try {
      const [patientsRes, usersRes] = await Promise.all([
        api.get("/patients"),
        api.get("/users"),
      ]);
      setPatients(patientsRes.data.data);
      setUsers(usersRes.data.data);
    } catch (error) {
      console.log(error);
    }
  };

  const openAddModal = () => {
    setFormData(emptyForm);
    setErrors({});
    setShowModal(true);
    loadPatientSources();
  };

  const closeModal = () => setShowModal(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    setSaving(true);

    try {
      const payload = {
        doctor_id: formData.doctor_id,
        appointment_date: formData.appointment_date,
        appointment_time: formData.appointment_time,
        status: formData.status,
        notes: formData.notes,
        patient_id: formData.patient_source === "walkin" ? formData.patient_id : null,
        user_id: formData.patient_source === "user" ? formData.user_id : null,
      };

      await api.post("/appointments", payload);
      toast.success("Appointment created successfully.");
      setShowModal(false);
      loadAppointments();
    } catch (error) {
      if (error.response?.status === 422) {
        setErrors(error.response.data.errors || {});
      } else {
        toast.error(error.response?.data?.message || "Unable to create appointment.");
      }
      console.log(error);
    } finally {
      setSaving(false);
    }
  };

  const updateStatus = async (appointment, status) => {
    try {
      await api.put(`/appointments/${appointment.id}`, { status });
      toast.success(`Marked as ${status}.`);
      loadAppointments();
    } catch (error) {
      console.log(error);
      toast.error(error.response?.data?.message || "Unable to update status.");
    }
  };

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

  const fieldError = (field) => errors[field]?.[0];

  const totalPages = Math.max(1, Math.ceil(appointments.length / PER_PAGE));
  const pagedAppointments = appointments.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  return (
    <div className="flex bg-paper-dim min-h-screen">
      <Sidebar />

      <div className="flex-1 ml-72">
        <Topbar title="Appointments" subtitle="Track and manage bookings" />

        <div className="p-8">
          <div className="flex flex-wrap justify-between items-center gap-4 mb-8">
            <div>
              <h1 className="font-display text-3xl font-semibold text-ink">Appointments</h1>
              <p className="text-muted text-sm mt-1">{appointments.length} total appointments</p>
            </div>

            <button onClick={openAddModal} className="btn-primary !px-5 !py-3">
              <FaPlus />
              Book Appointment
            </button>
          </div>

          {authError ? (
            <div className="bg-warning-light border border-warning/20 text-warning rounded-xl p-6 text-center">
              You need to be logged in as an admin to view appointments.{" "}
              <Link to="/login" className="text-primary font-semibold underline">
                Login here
              </Link>
              .
            </div>
          ) : (
            <div className="table-shell overflow-x-auto">
              <table>
                <thead>
                  <tr>
                    <th>Doctor</th>
                    <th>Patient</th>
                    <th>Date</th>
                    <th>Time</th>
                    <th>Status</th>
                    <th className="text-center">Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan="6" className="text-center py-10 text-muted">
                        Loading...
                      </td>
                    </tr>
                  ) : appointments.length > 0 ? (
                    pagedAppointments.map((appointment) => (
                      <tr key={appointment.id}>
                        <td className="font-semibold">
                          <div className="flex items-center gap-3">
                            <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary-light text-primary">
                              <FaCalendarCheck className="text-sm" />
                            </span>
                            {appointment.doctor?.name ?? "—"}
                          </div>
                        </td>
                        <td>{appointment.user?.name ?? appointment.patient?.name ?? "—"}</td>
                        <td>{appointment.appointment_date}</td>
                        <td>{appointment.appointment_time}</td>
                        <td>
                          <select
                            value={appointment.status}
                            onChange={(e) => updateStatus(appointment, e.target.value)}
                            className={`badge cursor-pointer border-0 ${statusBadgeClass(appointment.status)}`}
                          >
                            <option value="Pending">Pending</option>
                            <option value="Confirmed">Confirmed</option>
                            <option value="Completed">Completed</option>
                            <option value="Cancelled">Cancelled</option>
                          </select>
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
                    ))
                  ) : (
                    <tr>
                      <td colSpan="6" className="text-center py-10 text-muted">
                        No Appointments Found
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>

              <Pagination page={page} totalPages={totalPages} onChange={setPage} />
            </div>
          )}
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-ink/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-8 relative reveal-up max-h-[90vh] overflow-y-auto">
            <button
              onClick={closeModal}
              className="absolute top-5 right-5 text-muted hover:text-ink transition-colors"
            >
              <FaXmark size={20} />
            </button>

            <h2 className="font-display text-2xl font-semibold text-ink mb-6">
              Book Appointment
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <select
                  name="doctor_id"
                  value={formData.doctor_id}
                  onChange={handleChange}
                  className="select-field"
                >
                  <option value="">Select Doctor</option>
                  {doctors.map((doctor) => (
                    <option key={doctor.id} value={doctor.id}>
                      {doctor.name}{" "}
                      {doctor.specialization?.name
                        ? `(${doctor.specialization.name})`
                        : ""}
                    </option>
                  ))}
                </select>
                {fieldError("doctor_id") && (
                  <p className="field-error">{fieldError("doctor_id")}</p>
                )}
              </div>

              <div className="flex rounded-xl border border-line p-1 bg-paper-dim/60">
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, patient_source: "user" })}
                  className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-colors ${
                    formData.patient_source === "user" ? "bg-white shadow text-primary" : "text-muted"
                  }`}
                >
                  Registered User
                </button>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, patient_source: "walkin" })}
                  className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-colors ${
                    formData.patient_source === "walkin" ? "bg-white shadow text-primary" : "text-muted"
                  }`}
                >
                  Walk-in Patient
                </button>
              </div>

              {formData.patient_source === "user" ? (
                <div>
                  <select
                    name="user_id"
                    value={formData.user_id}
                    onChange={handleChange}
                    className="select-field"
                  >
                    <option value="">Select Registered User</option>
                    {users.map((u) => (
                      <option key={u.id} value={u.id}>
                        {u.name} ({u.email})
                      </option>
                    ))}
                  </select>
                  {fieldError("user_id") && <p className="field-error">{fieldError("user_id")}</p>}
                </div>
              ) : (
                <div>
                  <select
                    name="patient_id"
                    value={formData.patient_id}
                    onChange={handleChange}
                    className="select-field"
                  >
                    <option value="">Select Walk-in Patient</option>
                    {patients.map((patient) => (
                      <option key={patient.id} value={patient.id}>
                        {patient.name} ({patient.phone})
                      </option>
                    ))}
                  </select>
                  {fieldError("patient_id") && (
                    <p className="field-error">{fieldError("patient_id")}</p>
                  )}
                  <p className="text-xs text-muted mt-1.5">
                    Not listed? Add them first from the Patients page.
                  </p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <input
                    type="date"
                    name="appointment_date"
                    value={formData.appointment_date}
                    onChange={handleChange}
                    className="input-field"
                  />
                  {fieldError("appointment_date") && (
                    <p className="field-error">{fieldError("appointment_date")}</p>
                  )}
                </div>

                <div>
                  <input
                    type="time"
                    name="appointment_time"
                    value={formData.appointment_time}
                    onChange={handleChange}
                    className="input-field"
                  />
                  {fieldError("appointment_time") && (
                    <p className="field-error">{fieldError("appointment_time")}</p>
                  )}
                </div>
              </div>

              <div>
                <select
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="select-field"
                >
                  <option value="Pending">Pending</option>
                  <option value="Confirmed">Confirmed</option>
                  <option value="Completed">Completed</option>
                  <option value="Cancelled">Cancelled</option>
                </select>
              </div>

              <div>
                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleChange}
                  placeholder="Notes (optional)"
                  rows="3"
                  className="input-field resize-none"
                />
              </div>

              <button type="submit" disabled={saving} className="btn-primary w-full !py-4">
                {saving ? "Saving..." : "Book Appointment"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
