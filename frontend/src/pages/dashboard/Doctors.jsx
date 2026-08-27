import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { FaPen, FaTrash, FaPlus, FaMagnifyingGlass } from "react-icons/fa6";

import Sidebar from "../../components/dashboard/Sidebar";
import Topbar from "../../components/dashboard/Topbar";
import DoctorAvatar from "../../components/common/DoctorAvatar";
import Pagination from "../../components/ui/Pagination";
import api from "../../services/api";
import { useToast } from "../../context/ToastContext";

const PER_PAGE = 8;

export default function Doctors() {
  const toast = useToast();
  const [doctors, setDoctors] = useState([]);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const loadDoctors = async () => {
    try {
      const response = await api.get("/doctors");
      setDoctors(response.data.data);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    loadDoctors();
  }, []);

  const deleteDoctor = async (id) => {
    if (!window.confirm("Delete this doctor?")) return;

    try {
      await api.delete(`/doctors/${id}`);
      toast.success("Doctor deleted successfully.");
      loadDoctors();
    } catch (error) {
      console.log(error);
      toast.error(error.response?.data?.message || "Unable to delete doctor.");
    }
  };

  const filteredDoctors = useMemo(
    () => doctors.filter((doctor) => doctor.name.toLowerCase().includes(search.toLowerCase())),
    [doctors, search]
  );

  const totalPages = Math.max(1, Math.ceil(filteredDoctors.length / PER_PAGE));
  const pagedDoctors = filteredDoctors.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  useEffect(() => {
    setPage(1);
  }, [search]);

  return (
    <div className="flex bg-paper-dim min-h-screen">
      <Sidebar />

      <div className="flex-1 ml-72">
        <Topbar title="Doctors" subtitle="Manage all registered doctors" />

        <div className="p-8">
          <div className="flex flex-wrap justify-between items-center gap-4 mb-8">
            <div>
              <h1 className="font-display text-3xl font-semibold text-ink">Doctors</h1>
              <p className="text-muted text-sm mt-1">{doctors.length} total doctors</p>
            </div>

            <Link to="/dashboard/add-doctor" className="btn-primary !px-5 !py-3">
              <FaPlus />
              Add Doctor
            </Link>
          </div>

          <div className="relative mb-6 max-w-md">
            <FaMagnifyingGlass className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" />
            <input
              type="text"
              placeholder="Search doctor..."
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
                  <th>Specialization</th>
                  <th>Experience</th>
                  <th>Fee</th>
                  <th>Phone</th>
                  <th>Status</th>
                  <th className="text-center">Actions</th>
                </tr>
              </thead>

              <tbody>
                {pagedDoctors.length > 0 ? (
                  pagedDoctors.map((doctor) => (
                    <tr key={doctor.id}>
                      <td className="font-semibold">
                        <div className="flex items-center gap-3">
                          <DoctorAvatar doctor={doctor} size="sm" />
                          {doctor.name}
                        </div>
                      </td>
                      <td>{doctor.specialization?.name}</td>
                      <td>{doctor.experience} Years</td>
                      <td>Rs. {doctor.consultation_fee}</td>
                      <td>{doctor.phone}</td>
                      <td>
                        <span className={`badge ${doctor.status ? "badge-approved" : "badge-cancelled"}`}>
                          {doctor.status ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td>
                        <div className="flex justify-center gap-2">
                          <Link
                            to={`/dashboard/edit-doctor/${doctor.id}`}
                            className="icon-action bg-success-light text-success"
                          >
                            <FaPen />
                          </Link>

                          <button
                            onClick={() => deleteDoctor(doctor.id)}
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
                    <td colSpan="7" className="text-center py-10 text-muted">
                      No Doctors Found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          <Pagination page={page} totalPages={totalPages} onChange={setPage} />
        </div>
      </div>
    </div>
  );
}
