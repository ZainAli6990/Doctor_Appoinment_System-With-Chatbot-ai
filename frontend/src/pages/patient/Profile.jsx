import { useState } from "react";
import { FaUser, FaLock, FaUserGear } from "react-icons/fa6";

import Navbar from "../../components/layout/Navbar";
import Footer from "../../components/layout/Footer";
import api from "../../services/api";
import { useToast } from "../../context/ToastContext";
import { useAuth } from "../../context/AuthContext";

export default function Profile() {
  const toast = useToast();
  const { user, updateUser } = useAuth();

  const [profile, setProfile] = useState({
    name: user?.name ?? "",
    email: user?.email ?? "",
    phone: user?.phone ?? "",
    gender: user?.gender ?? "",
    age: user?.age ?? "",
    address: user?.address ?? "",
  });
  const [profileErrors, setProfileErrors] = useState({});
  const [savingProfile, setSavingProfile] = useState(false);

  const [passwordForm, setPasswordForm] = useState({
    current_password: "",
    password: "",
    password_confirmation: "",
  });
  const [passwordErrors, setPasswordErrors] = useState({});
  const [savingPassword, setSavingPassword] = useState(false);

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
    <>
      <Navbar />

      <section className="bg-primary pt-32 pb-16">
        <div className="max-w-5xl mx-auto px-6 text-center reveal-up">
          <span className="eyebrow !text-accent">Patient Portal</span>
          <h1 className="font-display text-4xl md:text-5xl font-semibold text-white mt-3">
            My Profile
          </h1>
        </div>
      </section>

      <section className="py-16 -mt-6">
        <div className="max-w-5xl mx-auto px-6 grid gap-8 lg:grid-cols-2">
          <form onSubmit={saveProfile} className="card p-8">
            <div className="flex items-center gap-3 mb-6">
              <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary-light text-primary text-xl">
                <FaUserGear />
              </span>
              <div>
                <h2 className="font-display text-xl font-semibold text-ink">
                  Personal Details
                </h2>
                <p className="text-muted text-sm">Keep your info up to date</p>
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

              <div>
                <label className="block text-sm font-semibold text-ink mb-1.5">Phone</label>
                <input
                  type="text"
                  name="phone"
                  value={profile.phone}
                  onChange={handleProfileChange}
                  className="input-field"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-ink mb-1.5">Gender</label>
                  <select
                    name="gender"
                    value={profile.gender}
                    onChange={handleProfileChange}
                    className="select-field"
                  >
                    <option value="">Select</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-ink mb-1.5">Age</label>
                  <input
                    type="number"
                    name="age"
                    value={profile.age}
                    onChange={handleProfileChange}
                    className="input-field"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-semibold text-ink mb-1.5">Address</label>
                <textarea
                  name="address"
                  value={profile.address}
                  onChange={handleProfileChange}
                  rows="3"
                  className="input-field resize-none"
                />
              </div>

              <button type="submit" disabled={savingProfile} className="btn-primary w-full !py-3.5">
                {savingProfile ? "Saving..." : "Save Changes"}
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
        </div>
      </section>

      <Footer />
    </>
  );
}
