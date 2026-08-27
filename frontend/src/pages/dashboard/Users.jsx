import { useEffect, useMemo, useState } from "react";
import { FaMagnifyingGlass, FaUser, FaToggleOn, FaToggleOff, FaTrash } from "react-icons/fa6";

import Sidebar from "../../components/dashboard/Sidebar";
import Topbar from "../../components/dashboard/Topbar";
import Pagination from "../../components/ui/Pagination";
import api from "../../services/api";
import { useToast } from "../../context/ToastContext";

const PER_PAGE = 8;

export default function Users() {
  const toast = useToast();
  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);

  const load = async () => {
    setLoading(true);
    try {
      const response = await api.get("/users");
      setUsers(response.data.data);
    } catch (error) {
      console.log(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const toggleStatus = async (user) => {
    try {
      await api.patch(`/users/${user.id}/toggle-status`);
      toast.success(user.is_active ? "Account deactivated." : "Account activated.");
      load();
    } catch (error) {
      toast.error(error.response?.data?.message || "Unable to update account.");
    }
  };

  const deleteUser = async (id) => {
    if (!window.confirm("Delete this user account? This cannot be undone.")) return;

    try {
      await api.delete(`/users/${id}`);
      toast.success("User deleted successfully.");
      load();
    } catch (error) {
      toast.error(error.response?.data?.message || "Unable to delete user.");
    }
  };

  const filtered = useMemo(
    () =>
      users.filter(
        (u) =>
          u.name.toLowerCase().includes(search.toLowerCase()) ||
          u.email.toLowerCase().includes(search.toLowerCase())
      ),
    [users, search]
  );

  const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
  const paged = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  useEffect(() => setPage(1), [search]);

  return (
    <div className="flex bg-paper-dim min-h-screen">
      <Sidebar />

      <div className="flex-1 ml-72">
        <Topbar title="Users" subtitle="Registered patient accounts" />

        <div className="p-8">
          <div className="flex flex-wrap justify-between items-center gap-4 mb-8">
            <div>
              <h1 className="font-display text-3xl font-semibold text-ink">Users</h1>
              <p className="text-muted text-sm mt-1">
                {users.length} registered patient {users.length === 1 ? "account" : "accounts"}
              </p>
            </div>
          </div>

          <div className="relative mb-6 max-w-md">
            <FaMagnifyingGlass className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" />
            <input
              type="text"
              placeholder="Search by name or email..."
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
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Status</th>
                  <th className="text-center">Actions</th>
                </tr>
              </thead>

              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan="5" className="text-center py-10 text-muted">Loading...</td>
                  </tr>
                ) : paged.length > 0 ? (
                  paged.map((u) => (
                    <tr key={u.id}>
                      <td className="font-semibold">
                        <div className="flex items-center gap-3">
                          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary-light text-primary">
                            <FaUser className="text-sm" />
                          </span>
                          {u.name}
                        </div>
                      </td>
                      <td>{u.email}</td>
                      <td>{u.phone ?? "—"}</td>
                      <td>
                        <span className={`badge ${u.is_active ? "badge-confirmed" : "badge-cancelled"}`}>
                          {u.is_active ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td>
                        <div className="flex justify-center gap-2">
                          <button
                            onClick={() => toggleStatus(u)}
                            className={`icon-action ${u.is_active ? "bg-warning-light text-warning" : "bg-success-light text-success"}`}
                            title={u.is_active ? "Deactivate" : "Activate"}
                          >
                            {u.is_active ? <FaToggleOff /> : <FaToggleOn />}
                          </button>
                          <button
                            onClick={() => deleteUser(u.id)}
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
                    <td colSpan="5" className="text-center py-10 text-muted">No users found</td>
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
