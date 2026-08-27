import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { FaPen, FaTrash, FaPlus, FaXmark, FaStethoscope } from "react-icons/fa6";

import Sidebar from "../../components/dashboard/Sidebar";
import Topbar from "../../components/dashboard/Topbar";
import api from "../../services/api";
import { useToast } from "../../context/ToastContext";

const emptyForm = { name: "", description: "" };

export default function Specializations() {
  const toast = useToast();
  const [specializations, setSpecializations] = useState([]);
  const [loading, setLoading] = useState(true);

  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState(emptyForm);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [needsAuth, setNeedsAuth] = useState(false);

  const loadSpecializations = async () => {
    setLoading(true);

    try {
      const response = await api.get("/specializations");
      setSpecializations(response.data.data);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSpecializations();
  }, []);

  const openAddModal = () => {
    setEditingId(null);
    setFormData(emptyForm);
    setErrors({});
    setNeedsAuth(false);
    setShowModal(true);
  };

  const openEditModal = (spec) => {
    setEditingId(spec.id);
    setFormData({ name: spec.name ?? "", description: spec.description ?? "" });
    setErrors({});
    setNeedsAuth(false);
    setShowModal(true);
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
      if (editingId) {
        await api.put(`/specializations/${editingId}`, formData);
        toast.success("Specialization updated successfully.");
      } else {
        await api.post("/specializations", formData);
        toast.success("Specialization added successfully.");
      }

      setShowModal(false);
      loadSpecializations();
    } catch (error) {
      if (error.response?.status === 422) {
        setErrors(error.response.data.errors || {});
      } else if (error.response?.status === 401) {
        setNeedsAuth(true);
      } else {
        toast.error(error.response?.data?.message || "Unable to save specialization.");
      }
      console.log(error);
    } finally {
      setSaving(false);
    }
  };

  const deleteSpecialization = async (id) => {
    if (!window.confirm("Delete this specialization?")) return;

    try {
      await api.delete(`/specializations/${id}`);
      toast.success("Specialization deleted successfully.");
      loadSpecializations();
    } catch (error) {
      console.log(error);
      if (error.response?.status === 401) {
        toast.error("Please log in as admin first.");
      } else {
        toast.error(error.response?.data?.message || "Unable to delete specialization.");
      }
    }
  };

  const fieldError = (field) => errors[field]?.[0];

  const colors = ["primary", "accent", "success"];

  return (
    <div className="flex bg-paper-dim min-h-screen">
      <Sidebar />

      <div className="flex-1 ml-72">
        <Topbar title="Specializations" subtitle="Manage medical specialties" />

        <div className="p-8">
          <div className="flex flex-wrap justify-between items-center gap-4 mb-8">
            <div>
              <h1 className="font-display text-3xl font-semibold text-ink">Specializations</h1>
              <p className="text-muted text-sm mt-1">
                {specializations.length} specializations
              </p>
            </div>

            <button onClick={openAddModal} className="btn-primary !px-5 !py-3">
              <FaPlus />
              Add Specialization
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {loading ? (
              <p className="text-muted">Loading...</p>
            ) : specializations.length > 0 ? (
              specializations.map((spec, index) => {
                const tone = colors[index % colors.length];
                return (
                  <div
                    key={spec.id}
                    className="card p-6 flex flex-col justify-between hover:-translate-y-1.5 hover:shadow-xl transition-all duration-300 reveal-up"
                    style={{ animationDelay: `${index * 60}ms` }}
                  >
                    <div>
                      <span
                        className={`flex h-12 w-12 items-center justify-center rounded-xl text-xl mb-4 ${
                          tone === "primary"
                            ? "bg-primary-light text-primary"
                            : tone === "accent"
                            ? "bg-accent-light text-accent-dark"
                            : "bg-success-light text-success"
                        }`}
                      >
                        <FaStethoscope />
                      </span>
                      <h3 className="font-display text-xl font-semibold text-ink">
                        {spec.name}
                      </h3>
                      <p className="text-muted mt-2 text-sm leading-6">{spec.description}</p>
                    </div>

                    <div className="flex gap-3 mt-6">
                      <button
                        onClick={() => openEditModal(spec)}
                        className="btn-ghost flex-1 !py-2.5 text-sm"
                      >
                        <FaPen /> Edit
                      </button>

                      <button
                        onClick={() => deleteSpecialization(spec.id)}
                        className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-danger-light text-danger py-2.5 text-sm font-semibold hover:bg-danger hover:text-white transition-colors duration-300"
                      >
                        <FaTrash /> Delete
                      </button>
                    </div>
                  </div>
                );
              })
            ) : (
              <p className="text-muted">No Specializations Found</p>
            )}
          </div>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-ink/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-8 relative reveal-up">
            <button
              onClick={closeModal}
              className="absolute top-5 right-5 text-muted hover:text-ink transition-colors"
            >
              <FaXmark size={20} />
            </button>

            <h2 className="font-display text-2xl font-semibold text-ink mb-6">
              {editingId ? "Edit Specialization" : "Add Specialization"}
            </h2>

            {needsAuth && (
              <div className="bg-warning-light border border-warning/20 text-warning rounded-xl p-3.5 mb-4 text-sm">
                You need to be logged in as an admin to do this.{" "}
                <Link to="/login" className="underline font-semibold">
                  Login here
                </Link>
                .
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Specialization Name (e.g. Cardiologist)"
                  className="input-field"
                />
                {fieldError("name") && <p className="field-error">{fieldError("name")}</p>}
              </div>

              <div>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Description"
                  rows="3"
                  className="input-field resize-none"
                />
                {fieldError("description") && (
                  <p className="field-error">{fieldError("description")}</p>
                )}
              </div>

              <button type="submit" disabled={saving} className="btn-primary w-full !py-4">
                {saving ? "Saving..." : editingId ? "Update" : "Add"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
