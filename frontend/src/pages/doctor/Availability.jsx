import { useEffect, useState } from "react";
import { FaClock } from "react-icons/fa6";

import Sidebar from "../../components/dashboard/Sidebar";
import Topbar from "../../components/dashboard/Topbar";
import api from "../../services/api";
import { useToast } from "../../context/ToastContext";

export default function DoctorAvailability() {
  const toast = useToast();
  const [form, setForm] = useState({ available_days: "", available_time: "" });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    api
      .get("/doctor/dashboard")
      .then((response) => {
        const doctor = response.data.data.doctor;
        setForm({
          available_days: doctor.available_days ?? "",
          available_time: doctor.available_time ?? "",
        });
      })
      .catch((error) => console.log(error))
      .finally(() => setLoading(false));
  }, []);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await api.put("/doctor/availability", form);
      toast.success("Availability updated successfully.");
    } catch (error) {
      toast.error(error.response?.data?.message || "Unable to update availability.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex bg-paper-dim min-h-screen">
      <Sidebar />

      <div className="flex-1 ml-72">
        <Topbar title="Availability" subtitle="Let patients know when you're free" />

        <div className="p-8">
          {loading ? (
            <p className="text-muted">Loading...</p>
          ) : (
            <form onSubmit={handleSubmit} className="card p-8 max-w-xl space-y-5">
              <div className="flex items-center gap-3 pb-2">
                <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary-light text-primary text-xl">
                  <FaClock />
                </span>
                <p className="text-muted text-sm">
                  This is shown to patients on your public profile and while booking.
                </p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-ink mb-1.5">
                  Available Days
                </label>
                <input
                  type="text"
                  name="available_days"
                  value={form.available_days}
                  onChange={handleChange}
                  placeholder="e.g. Mon - Sat"
                  className="input-field"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-ink mb-1.5">
                  Available Time
                </label>
                <input
                  type="text"
                  name="available_time"
                  value={form.available_time}
                  onChange={handleChange}
                  placeholder="e.g. 10:00 AM - 6:00 PM"
                  className="input-field"
                />
              </div>

              <button type="submit" disabled={saving} className="btn-primary w-full !py-4">
                {saving ? "Saving..." : "Save Availability"}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
