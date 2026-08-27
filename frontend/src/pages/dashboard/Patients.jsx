import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  FaPen,
  FaTrash,
  FaPlus,
  FaMagnifyingGlass,
  FaXmark,
  FaUser,
} from "react-icons/fa6";

import Sidebar from "../../components/dashboard/Sidebar";
import Topbar from "../../components/dashboard/Topbar";
import Pagination from "../../components/ui/Pagination";
import api from "../../services/api";
import { useToast } from "../../context/ToastContext";

const emptyForm = {
  name: "",
  email: "",
  phone: "",
  gender: "",
  age: "",
  address: "",
};

const PER_PAGE = 8;

export default function Patients() {
  const toast = useToast();
  const [patients, setPatients] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState(false);
  const [page, setPage] = useState(1);

  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState(emptyForm);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  const loadPatients = async () => {
    setLoading(true);
    setAuthError(false);

    try {
      const response = await api.get("/patients");
      setPatients(response.data.data);
    } catch (error) {
      console.log(error);
      if (error.response?.status === 401) {
        setAuthError(true);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPatients();
  }, []);

  const openAddModal = () => {
    setEditingId(null);
    setFormData(emptyForm);
    setErrors({});
    setShowModal(true);
  };

  const openEditModal = (patient) => {
    setEditingId(patient.id);
    setFormData({
      name: patient.name ?? "",
      email: patient.email ?? "",
      phone: patient.phone ?? "",
      gender: patient.gender ?? "",
      age: patient.age ?? "",
      address: patient.address ?? "",
    });
    setErrors({});
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
        await api.put(`/patients/${editingId}`, formData);
        toast.success("Patient updated successfully.");
      } else {
        await api.post("/patients", formData);
        toast.success("Patient added successfully.");
      }

      setShowModal(false);
      loadPatients();
    } catch (error) {
      if (error.response?.status === 422) {
        setErrors(error.response.data.errors || {});
      } else if (error.response?.status === 401) {
        toast.error("Please log in as admin first.");
      } else {
        toast.error(error.response?.data?.message || "Unable to save patient.");
      }
      console.log(error);
    } finally {
      setSaving(false);
    }
  };

  const deletePatient = async (id) => {
    if (!window.confirm("Delete this patient?")) return;

    try {
      await api.delete(`/patients/${id}`);
      toast.success("Patient deleted successfully.");
      loadPatients();
    } catch (error) {
      console.log(error);
      toast.error(error.response?.data?.message || "Unable to delete patient.");
    }
  };

  const fieldError = (field) => errors[field]?.[0];

  const filteredPatients = useMemo(
    () => patients.filter((patient) => patient.name.toLowerCase().includes(search.toLowerCase())),
    [patients, search]
  );

  const totalPages = Math.max(1, Math.ceil(filteredPatients.length / PER_PAGE));
  const pagedPatients = filteredPatients.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  useEffect(() => {
    setPage(1);
  }, [search]);

  return (
    <div className="flex bg-paper-dim min-h-screen">
      <Sidebar />

      <div className="flex-1 ml-72">
        <Topbar title="Patients" subtitle="Manage patient records" />

        <div className="p-8">
          <div className="flex flex-wrap justify-between items-center gap-4 mb-8">
            <div>
              <h1 className="font-display text-3xl font-semibold text-ink">Patients</h1>
              <p className="text-muted text-sm mt-1">{patients.length} total patients</p>
            </div>

            <button onClick={openAddModal} className="btn-primary !px-5 !py-3">
              <FaPlus />
              Add Patient
            </button>
          </div>

          {authError ? (
            <div className="bg-warning-light border border-warning/20 text-warning rounded-xl p-6 text-center">
              You need to be logged in as an admin to view patients.{" "}
              <Link to="/login" className="text-primary font-semibold underline">
                Login here
              </Link>
              .
            </div>
          ) : (
            <>
              <div className="relative mb-6 max-w-md">
                <FaMagnifyingGlass className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" />
                <input
                  type="text"
                  placeholder="Search patient..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="input-field !pl-11 !bg-white"
                />
              </div>

              <div className="table-shell overflow-x-auto">
                <table>
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Gender</th>
                      <th>Age</th>
                      <th>Phone</th>
                      <th>Email</th>
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
                    ) : pagedPatients.length > 0 ? (
                      pagedPatients.map((patient) => (
                        <tr key={patient.id}>
                          <td className="font-semibold">
                            <div className="flex items-center gap-3">
                              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary-light text-primary">
                                <FaUser className="text-sm" />
                              </span>
                              {patient.name}
                            </div>
                          </td>
                          <td>{patient.gender}</td>
                          <td>{patient.age}</td>
                          <td>{patient.phone}</td>
                          <td>{patient.email}</td>
                          <td>
                            <div className="flex justify-center gap-2">
                              <button
                                onClick={() => openEditModal(patient)}
                                className="icon-action bg-success-light text-success"
                              >
                                <FaPen />
                              </button>

                              <button
                                onClick={() => deletePatient(patient.id)}
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
                          No Patients Found
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

              <Pagination page={page} totalPages={totalPages} onChange={setPage} />
            </>
          )}
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
              {editingId ? "Edit Patient" : "Add Patient"}
            </h2>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Patient Name"
                  className="input-field"
                />
                {fieldError("name") && <p className="field-error">{fieldError("name")}</p>}
              </div>

              <div>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
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
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="Phone"
                  className="input-field"
                />
                {fieldError("phone") && <p className="field-error">{fieldError("phone")}</p>}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <select
                    name="gender"
                    value={formData.gender}
                    onChange={handleChange}
                    className="select-field"
                  >
                    <option value="">Select Gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                  {fieldError("gender") && <p className="field-error">{fieldError("gender")}</p>}
                </div>

                <div>
                  <input
                    type="number"
                    name="age"
                    value={formData.age}
                    onChange={handleChange}
                    placeholder="Age"
                    className="input-field"
                  />
                  {fieldError("age") && <p className="field-error">{fieldError("age")}</p>}
                </div>
              </div>

              <div>
                <textarea
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  placeholder="Address"
                  rows="3"
                  className="input-field resize-none"
                />
                {fieldError("address") && <p className="field-error">{fieldError("address")}</p>}
              </div>

              <button type="submit" disabled={saving} className="btn-primary w-full !py-4">
                {saving ? "Saving..." : editingId ? "Update Patient" : "Add Patient"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
