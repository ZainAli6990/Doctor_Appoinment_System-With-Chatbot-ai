import { useEffect, useRef, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { FaArrowLeft, FaUserDoctor, FaCamera } from "react-icons/fa6";
import Sidebar from "../../components/dashboard/Sidebar";
import Topbar from "../../components/dashboard/Topbar";
import api from "../../services/api";
import { useToast } from "../../context/ToastContext";

export default function EditDoctor() {
  const { id } = useParams();
  const navigate = useNavigate();
  const toast = useToast();
  const fileInputRef = useRef(null);

  const [specializations, setSpecializations] = useState([]);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);

  const [doctor, setDoctor] = useState({
    name: "",
    email: "",
    phone: "",
    specialization_id: "",
    experience: "",
    consultation_fee: "",
    available_days: "",
    available_time: "",
    status: true,
  });

  const [hasLogin, setHasLogin] = useState(false);
  const [resetLogin, setResetLogin] = useState(false);
  const [loginPassword, setLoginPassword] = useState("");

  const loadSpecializations = async () => {
    try {
      const response = await api.get("/specializations");
      setSpecializations(response.data.data);
    } catch (error) {
      console.log(error);
    }
  };

  const loadDoctor = async () => {
    try {
      const response = await api.get(`/doctors/${id}`);
      const data = response.data.data;

      setDoctor({
        name: data.name ?? "",
        email: data.email ?? "",
        phone: data.phone ?? "",
        specialization_id: data.specialization_id ?? "",
        experience: data.experience ?? "",
        consultation_fee: data.consultation_fee ?? "",
        available_days: data.available_days ?? "",
        available_time: data.available_time ?? "",
        status: !!data.status,
      });

      if (data.photo_url) {
        setPhotoPreview(data.photo_url);
      }

      setHasLogin(!!data.user_id);
    } catch (error) {
      console.log(error);
      toast.error("Unable to load doctor.");
    } finally {
      setFetching(false);
    }
  };

  useEffect(() => {
    loadSpecializations();
    loadDoctor();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setDoctor({
      ...doctor,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setPhotoFile(file);
    setPhotoPreview(URL.createObjectURL(file));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append("_method", "PUT");
      Object.entries(doctor).forEach(([key, value]) => {
        formData.append(key, key === "status" ? (value ? 1 : 0) : value);
      });
      if (photoFile) {
        formData.append("photo", photoFile);
      }
      if (resetLogin && loginPassword) {
        formData.append("login_password", loginPassword);
      }

      await api.post(`/doctors/${id}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      toast.success("Doctor updated successfully.");
      navigate("/dashboard/doctors");
    } catch (error) {
      if (error.response?.status === 422) {
        setErrors(error.response.data.errors || {});
      } else {
        toast.error(error.response?.data?.message || "Unable to update doctor.");
      }
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  const fieldError = (field) => errors[field]?.[0];

  return (
    <div className="flex bg-paper-dim min-h-screen">
      <Sidebar />

      <div className="flex-1 ml-72">
        <Topbar title="Edit Doctor" subtitle="Update this doctor's profile" />

        <div className="p-8">
          <div className="flex items-center gap-4 mb-8">
            <Link
              to="/dashboard/doctors"
              className="card flex h-11 w-11 items-center justify-center text-ink hover:text-primary transition-colors"
            >
              <FaArrowLeft />
            </Link>
            <h1 className="font-display text-3xl font-semibold text-ink">Edit Doctor</h1>
          </div>

          {fetching ? (
            <p className="text-muted">Loading doctor details...</p>
          ) : (
            <form onSubmit={handleSubmit} className="card p-8 max-w-3xl space-y-5">
              <div className="flex items-center gap-5 pb-2">
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
                <p className="text-muted text-sm">
                  Update the profile photo (optional) and professional details below.
                </p>
              </div>

              <div>
                <input
                  type="text"
                  name="name"
                  value={doctor.name}
                  onChange={handleChange}
                  placeholder="Doctor Name"
                  className="input-field"
                />
                {fieldError("name") && <p className="field-error">{fieldError("name")}</p>}
              </div>

              <div>
                <input
                  type="email"
                  name="email"
                  value={doctor.email}
                  onChange={handleChange}
                  placeholder="Email"
                  className="input-field"
                />
                {fieldError("email") && <p className="field-error">{fieldError("email")}</p>}
              </div>

              <div>
                <input
                  type="text"
                  name="phone"
                  value={doctor.phone}
                  onChange={handleChange}
                  placeholder="Phone"
                  className="input-field"
                />
                {fieldError("phone") && <p className="field-error">{fieldError("phone")}</p>}
              </div>

              <div>
                <select
                  name="specialization_id"
                  value={doctor.specialization_id}
                  onChange={handleChange}
                  className="select-field"
                >
                  <option value="">Select Specialization</option>
                  {specializations.map((spec) => (
                    <option key={spec.id} value={spec.id}>
                      {spec.name}
                    </option>
                  ))}
                </select>
                {fieldError("specialization_id") && (
                  <p className="field-error">{fieldError("specialization_id")}</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-5">
                <div>
                  <input
                    type="number"
                    name="experience"
                    value={doctor.experience}
                    onChange={handleChange}
                    placeholder="Experience (Years)"
                    className="input-field"
                  />
                  {fieldError("experience") && (
                    <p className="field-error">{fieldError("experience")}</p>
                  )}
                </div>

                <div>
                  <input
                    type="number"
                    step="0.01"
                    name="consultation_fee"
                    value={doctor.consultation_fee}
                    onChange={handleChange}
                    placeholder="Consultation Fee (Rs.)"
                    className="input-field"
                  />
                  {fieldError("consultation_fee") && (
                    <p className="field-error">{fieldError("consultation_fee")}</p>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-5">
                <div>
                  <input
                    type="text"
                    name="available_days"
                    value={doctor.available_days}
                    onChange={handleChange}
                    placeholder="Available Days (e.g. Mon-Sat)"
                    className="input-field"
                  />
                  {fieldError("available_days") && (
                    <p className="field-error">{fieldError("available_days")}</p>
                  )}
                </div>

                <div>
                  <input
                    type="text"
                    name="available_time"
                    value={doctor.available_time}
                    onChange={handleChange}
                    placeholder="Available Time (e.g. 10AM-6PM)"
                    className="input-field"
                  />
                  {fieldError("available_time") && (
                    <p className="field-error">{fieldError("available_time")}</p>
                  )}
                </div>
              </div>

              <label className="flex items-center gap-3 rounded-xl border border-line px-4 py-3.5 cursor-pointer hover:border-primary transition-colors">
                <input
                  type="checkbox"
                  name="status"
                  checked={doctor.status}
                  onChange={handleChange}
                  className="w-5 h-5 accent-primary"
                />
                <span className="text-ink text-sm font-medium">
                  Active (available for booking)
                </span>
              </label>

              <div className="rounded-xl border border-line p-4">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold text-ink">
                    Doctor Portal Access
                  </p>
                  <span className={`badge ${hasLogin ? "badge-confirmed" : "badge-pending"}`}>
                    {hasLogin ? "Login Active" : "No Login Yet"}
                  </span>
                </div>

                <label className="flex items-center gap-3 cursor-pointer mt-3">
                  <input
                    type="checkbox"
                    checked={resetLogin}
                    onChange={(e) => setResetLogin(e.target.checked)}
                    className="w-5 h-5 accent-primary"
                  />
                  <span className="text-ink text-sm font-medium">
                    {hasLogin ? "Reset this doctor's password" : "Create a Doctor Portal login for this doctor"}
                  </span>
                </label>

                {resetLogin && (
                  <div className="mt-3">
                    <input
                      type="password"
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      placeholder="New Password (min 6 characters)"
                      className="input-field"
                      required={resetLogin}
                    />
                    {fieldError("login_password") && (
                      <p className="field-error">{fieldError("login_password")}</p>
                    )}
                    <p className="text-xs text-muted mt-1.5">
                      The doctor will log in with the email above and this password.
                    </p>
                  </div>
                )}
              </div>

              <button type="submit" disabled={loading} className="btn-primary w-full !py-4">
                {loading ? "Updating..." : "Update Doctor"}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
