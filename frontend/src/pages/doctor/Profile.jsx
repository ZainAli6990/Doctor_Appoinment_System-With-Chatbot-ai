import { useEffect, useRef, useState } from "react";
import { FaCamera, FaLock, FaUserDoctor } from "react-icons/fa6";

import Sidebar from "../../components/dashboard/Sidebar";
import Topbar from "../../components/dashboard/Topbar";
import api from "../../services/api";
import { useToast } from "../../context/ToastContext";
import { useAuth } from "../../context/AuthContext";

export default function DoctorProfile() {
  const toast = useToast();
  const { updateUser } = useAuth();
  const fileInputRef = useRef(null);

  const [doctor, setDoctor] = useState(null);
  const [form, setForm] = useState({ name: "", phone: "", experience: "", consultation_fee: "" });
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [passwordForm, setPasswordForm] = useState({
    current_password: "",
    password: "",
    password_confirmation: "",
  });
  const [passwordErrors, setPasswordErrors] = useState({});
  const [savingPassword, setSavingPassword] = useState(false);

  useEffect(() => {
    api
      .get("/doctor/dashboard")
      .then((response) => {
        const d = response.data.data.doctor;
        setDoctor(d);
        setForm({
          name: d.name ?? "",
          phone: d.phone ?? "",
          experience: d.experience ?? "",
          consultation_fee: d.consultation_fee ?? "",
        });
        if (d.photo_url) setPhotoPreview(d.photo_url);
      })
      .catch((error) => console.log(error))
      .finally(() => setLoading(false));
  }, []);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setPhotoFile(file);
    setPhotoPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      const formData = new FormData();
      formData.append("_method", "PUT");
      Object.entries(form).forEach(([key, value]) => formData.append(key, value));
      if (photoFile) formData.append("photo", photoFile);

      const response = await api.post("/doctor/profile", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      updateUser({ ...JSON.parse(localStorage.getItem("user")), name: form.name });
      setDoctor(response.data.data);
      toast.success("Profile updated successfully.");
    } catch (error) {
      toast.error(error.response?.data?.message || "Unable to update profile.");
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordChange = (e) => setPasswordForm({ ...passwordForm, [e.target.name]: e.target.value });

  const savePassword = async (e) => {
    e.preventDefault();
    setPasswordErrors({});
    setSavingPassword(true);

    try {
      await api.put("/change-password", passwordForm);
      toast.success("Password changed successfully.");
      setPasswordForm({ current_password: "", password: "", password_confirmation: "" });
    } catch (error) {
      if (error.response?.status === 422) {
        setPasswordErrors(error.response.data.errors || {});
      } else {
        toast.error(error.response?.data?.message || "Unable to change password.");
      }
    } finally {
      setSavingPassword(false);
    }
  };

  const passwordError = (field) => passwordErrors[field]?.[0];

  return (
    <div className="flex bg-paper-dim min-h-screen">
      <Sidebar />

      <div className="flex-1 ml-72">
        <Topbar title="My Profile" subtitle="Manage your doctor profile" />

        <div className="p-8 grid gap-8 lg:grid-cols-2 max-w-5xl">
          {loading ? (
            <p className="text-muted">Loading...</p>
          ) : (
            <>
              <form onSubmit={handleSubmit} className="card p-8">
                <div className="flex items-center gap-5 mb-6">
                  <div className="relative">
                    <div className="h-20 w-20 rounded-2xl bg-primary-light flex items-center justify-center text-primary text-3xl overflow-hidden border-2 border-line">
                      {photoPreview ? (
                        <img src={photoPreview} alt="Preview" className="h-full w-full object-cover" />
                      ) : (
                        <FaUserDoctor />
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="absolute -bottom-1.5 -right-1.5 flex h-7 w-7 items-center justify-center rounded-full bg-accent text-white text-xs shadow-md hover:bg-accent-dark transition-colors"
                    >
                      <FaCamera />
                    </button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handlePhotoChange}
                      className="hidden"
                    />
                  </div>
                  <div>
                    <h2 className="font-display text-xl font-semibold text-ink">
                      {doctor?.specialization?.name}
                    </h2>
                    <p className="text-muted text-sm">
                      Email & specialization are managed by the clinic admin.
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  <input
                    type="text"
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    placeholder="Full Name"
                    className="input-field"
                  />
                  <input
                    type="text"
                    name="phone"
                    value={form.phone}
                    onChange={handleChange}
                    placeholder="Phone"
                    className="input-field"
                  />
                  <div className="grid grid-cols-2 gap-4">
                    <input
                      type="number"
                      name="experience"
                      value={form.experience}
                      onChange={handleChange}
                      placeholder="Experience (Years)"
                      className="input-field"
                    />
                    <input
                      type="number"
                      step="0.01"
                      name="consultation_fee"
                      value={form.consultation_fee}
                      onChange={handleChange}
                      placeholder="Consultation Fee"
                      className="input-field"
                    />
                  </div>

                  <button type="submit" disabled={saving} className="btn-primary w-full !py-3.5">
                    {saving ? "Saving..." : "Save Changes"}
                  </button>
                </div>
              </form>

              <form onSubmit={savePassword} className="card p-8 h-fit">
                <div className="flex items-center gap-3 mb-6">
                  <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-accent-light text-accent-dark text-xl">
                    <FaLock />
                  </span>
                  <div>
                    <h2 className="font-display text-xl font-semibold text-ink">
                      Change Password
                    </h2>
                    <p className="text-muted text-sm">Keep your account secure</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <input
                      type="password"
                      name="current_password"
                      value={passwordForm.current_password}
                      onChange={handlePasswordChange}
                      placeholder="Current Password"
                      className="input-field"
                    />
                    {passwordError("current_password") && (
                      <p className="field-error">{passwordError("current_password")}</p>
                    )}
                  </div>

                  <div>
                    <input
                      type="password"
                      name="password"
                      value={passwordForm.password}
                      onChange={handlePasswordChange}
                      placeholder="New Password"
                      className="input-field"
                    />
                    {passwordError("password") && (
                      <p className="field-error">{passwordError("password")}</p>
                    )}
                  </div>

                  <div>
                    <input
                      type="password"
                      name="password_confirmation"
                      value={passwordForm.password_confirmation}
                      onChange={handlePasswordChange}
                      placeholder="Again New Password"
                      className="input-field"
                    />
                  </div>

                  <button type="submit" disabled={savingPassword} className="btn-accent w-full !py-3.5">
                    {savingPassword ? "Updating..." : "Update Password"}
                  </button>
                </div>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
