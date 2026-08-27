import { useEffect, useState } from "react";
import { FaUser, FaLock, FaUserGear } from "react-icons/fa6";

import Sidebar from "../../components/dashboard/Sidebar";
import Topbar from "../../components/dashboard/Topbar";
import api from "../../services/api";
import { useToast } from "../../context/ToastContext";
import { useAuth } from "../../context/AuthContext";

export default function Settings() {
  const toast = useToast();
  const { updateUser } = useAuth();

  const [profile, setProfile] = useState({ name: "", email: "" });
  const [profileErrors, setProfileErrors] = useState({});
  const [savingProfile, setSavingProfile] = useState(false);

  const [passwordForm, setPasswordForm] = useState({
    current_password: "",
    password: "",
    password_confirmation: "",
  });
  const [passwordErrors, setPasswordErrors] = useState({});
  const [savingPassword, setSavingPassword] = useState(false);

  useEffect(() => {
    api
      .get("/me")
      .then((response) => {
        const data = response.data.data;
        setProfile({ name: data.name ?? "", email: data.email ?? "" });
      })
      .catch((error) => console.log(error));
  }, []);

  const handleProfileChange = (e) => {
    setProfile({ ...profile, [e.target.name]: e.target.value });
  };

  const handlePasswordChange = (e) => {
    setPasswordForm({ ...passwordForm, [e.target.name]: e.target.value });
  };

  const saveProfile = async (e) => {
    e.preventDefault();
    setProfileErrors({});
    setSavingProfile(true);

    try {
      const response = await api.put("/profile", profile);
      updateUser(response.data.data);
      toast.success("Profile updated successfully.");
    } catch (error) {
      if (error.response?.status === 422) {
        setProfileErrors(error.response.data.errors || {});
      } else {
        toast.error(error.response?.data?.message || "Unable to update profile.");
      }
    } finally {
      setSavingProfile(false);
    }
  };

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

  const profileError = (field) => profileErrors[field]?.[0];
  const passwordError = (field) => passwordErrors[field]?.[0];

  return (
    <div className="flex bg-paper-dim min-h-screen">
      <Sidebar />

      <div className="flex-1 ml-72">
        <Topbar title="Settings" subtitle="Manage your admin account" />

        <div className="p-8 grid gap-8 lg:grid-cols-2 max-w-5xl">
          {/* Profile */}
          <form onSubmit={saveProfile} className="card p-8">
            <div className="flex items-center gap-3 mb-6">
              <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary-light text-primary text-xl">
                <FaUserGear />
              </span>
              <div>
                <h2 className="font-display text-xl font-semibold text-ink">
                  Profile Details
                </h2>
                <p className="text-muted text-sm">Update your name and email</p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-ink mb-1.5">Name</label>
                <div className="relative">
                  <FaUser className="absolute left-4 top-1/2 -translate-y-1/2 text-muted" />
                  <input
                    type="text"
                    name="name"
                    value={profile.name}
                    onChange={handleProfileChange}
                    className="input-field !pl-11"
                  />
                </div>
                {profileError("name") && <p className="field-error">{profileError("name")}</p>}
              </div>

              <div>
                <label className="block text-sm font-semibold text-ink mb-1.5">Email</label>
                <input
                  type="email"
                  name="email"
                  value={profile.email}
                  onChange={handleProfileChange}
                  className="input-field"
                />
                {profileError("email") && <p className="field-error">{profileError("email")}</p>}
              </div>

              <button type="submit" disabled={savingProfile} className="btn-primary w-full !py-3.5">
                {savingProfile ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </form>

          {/* Password */}
          <form onSubmit={savePassword} className="card p-8">
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
                  placeholder="Confirm New Password"
                  className="input-field"
                />
              </div>

              <button type="submit" disabled={savingPassword} className="btn-accent w-full !py-3.5">
                {savingPassword ? "Updating..." : "Update Password"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
