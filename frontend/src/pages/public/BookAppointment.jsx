import { useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { FaArrowLeft, FaBriefcase, FaMoneyBillWave, FaLock } from "react-icons/fa6";
import api from "../../services/api";
import { useToast } from "../../context/ToastContext";
import { useAuth } from "../../context/AuthContext";
import DoctorAvatar from "../../components/common/DoctorAvatar";

export default function BookAppointment() {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const { user, isAuthenticated } = useAuth();

  const [doctor, setDoctor] = useState(null);
  const [loadingDoctor, setLoadingDoctor] = useState(true);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    appointment_date: "",
    appointment_time: "",
    notes: "",
  });

  useEffect(() => {
    api
      .get(`/doctors/${id}`)
      .then((response) => setDoctor(response.data.data))
      .catch((error) => console.log(error))
      .finally(() => setLoadingDoctor(false));
  }, [id]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setLoading(true);

    try {
      await api.post("/appointments", {
        doctor_id: id,
        appointment_date: formData.appointment_date,
        appointment_time: formData.appointment_time,
        notes: formData.notes,
      });

      toast.success("Appointment booked successfully!");

      navigate("/my-appointments");
    } catch (error) {
      console.error(error);

      if (error.response?.status === 422) {
        const firstError =
          error.response.data.message ||
          Object.values(error.response.data.errors || {})[0]?.[0];
        toast.error(firstError || "Please check the appointment details.");
      } else if (error.response) {
        toast.error(
          error.response.data.message ||
            "Something went wrong while booking."
        );
      } else {
        toast.error("Server not responding.");
      }
    } finally {
      setLoading(false);
    }
  };

  // Booking requires a patient account — send guests to login first,
  // then bounce them straight back here once they're signed in.
  if (!isAuthenticated || user?.role !== "user") {
    return (
      <div className="min-h-screen bg-primary flex items-center justify-center px-4 relative overflow-hidden">
        <div className="pointer-events-none absolute -top-24 -left-24 w-96 h-96 rounded-full bg-white/5 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 -right-24 w-96 h-96 rounded-full bg-accent/20 blur-3xl float-slow" />

        <div className="card w-full max-w-md p-10 text-center relative reveal-up">
          <span className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-primary-light text-primary text-2xl mx-auto mb-5">
            <FaLock />
          </span>
          <h1 className="font-display text-2xl font-semibold text-ink">
            Please Log In to Book
          </h1>
          <p className="text-muted mt-3">
            {user?.role
              ? "This account can't book appointments. Please log in with a patient account."
              : "You need a patient account to book an appointment. It only takes a minute."}
          </p>

          <div className="flex flex-col gap-3 mt-7">
            <Link to="/login" className="btn-primary">
              Login
            </Link>
            {!user?.role && (
              <Link to="/register" className="btn-ghost">
                Create a Patient Account
              </Link>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-primary flex items-center justify-center py-14 px-4 relative overflow-hidden">
      <div className="pointer-events-none absolute -top-24 -left-24 w-96 h-96 rounded-full bg-white/5 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 -right-24 w-96 h-96 rounded-full bg-accent/20 blur-3xl float-slow" />

      <div className="card w-full max-w-xl p-8 md:p-10 relative reveal-up">
        <Link
          to="/doctors"
          className="inline-flex items-center gap-2 text-sm font-medium text-muted hover:text-primary transition-colors mb-6"
        >
          <FaArrowLeft /> Back to Doctors
        </Link>

        <div className="text-center mb-8">
          <h1 className="font-display text-3xl font-semibold text-ink mb-2">
            Book Appointment
          </h1>
          <p className="text-muted text-sm mb-6">
            Booking as <span className="font-semibold text-ink">{user.name}</span>
          </p>

          {loadingDoctor ? (
            <p className="text-muted text-sm">Loading doctor details...</p>
          ) : doctor ? (
            <div className="flex items-center gap-4 bg-primary-light/50 rounded-2xl p-4 text-left">
              <DoctorAvatar doctor={doctor} size="sm" />
              <div className="flex-1">
                <h2 className="font-display text-lg font-semibold text-ink">
                  {doctor.name}
                </h2>
                <p className="text-accent-dark text-xs font-semibold uppercase tracking-wide">
                  {doctor.specialization?.name}
                </p>
              </div>
              <div className="text-right text-sm text-ink/70 space-y-1">
                <div className="flex items-center gap-1.5 justify-end">
                  <FaBriefcase className="text-primary text-xs" />
                  {doctor.experience} yrs
                </div>
                <div className="flex items-center gap-1.5 justify-end">
                  <FaMoneyBillWave className="text-primary text-xs" />
                  Rs. {doctor.consultation_fee}
                </div>
              </div>
            </div>
          ) : (
            <p className="text-danger text-sm">Doctor not found.</p>
          )}
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <input
              type="date"
              name="appointment_date"
              value={formData.appointment_date}
              onChange={handleChange}
              min={new Date().toISOString().split("T")[0]}
              className="input-field"
              required
            />

            <input
              type="time"
              name="appointment_time"
              value={formData.appointment_time}
              onChange={handleChange}
              className="input-field"
              required
            />
          </div>

          <textarea
            name="notes"
            value={formData.notes}
            onChange={handleChange}
            rows="4"
            placeholder="Reason for Appointment (optional)"
            className="input-field resize-none"
          />

          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full !py-4"
          >
            {loading ? "Booking..." : "Confirm Appointment"}
          </button>
        </form>
      </div>
    </div>
  );
}
