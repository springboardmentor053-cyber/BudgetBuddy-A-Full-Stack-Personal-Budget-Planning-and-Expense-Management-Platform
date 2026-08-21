import { useEffect, useState } from "react";
import api from "../api";

function Profile() {
  const [profile, setProfile] = useState({
    username: "",
    email: "",
    first_name: "",
    last_name: "",
    phone: "",
    address: "",
  });

  const [password, setPassword] = useState({
    current_password: "",
    new_password: "",
    confirm_password: "",
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);

  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  

  // -----------------------------
  // Fetch Profile
  // -----------------------------

  const fetchProfile = async () => {
    try {
      const response = await api.get("profile/");
      setProfile(response.data);
      setError("");
    } catch (error) {
      console.error("Profile Error:", error);

      if (error.response?.status === 401) {
      setError("Session expired. Please login again.");

  localStorage.removeItem("access");
  localStorage.removeItem("refresh");

  setTimeout(() => {
    window.location.href = "/login";
  }, 2000);
}else {
        setError("Unable to load profile details.");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  // -----------------------------
  // Profile Input
  // -----------------------------

  const handleProfileChange = (event) => {
    const { name, value } = event.target;

    setProfile((previousProfile) => ({
      ...previousProfile,
      [name]: value,
    }));
  };

  // -----------------------------
  // Save Profile
  // -----------------------------

  const handleProfileSubmit = async (event) => {
    event.preventDefault();

    setSaving(true);
    setMessage("");
    setError("");

    try {
      const response = await api.put(
  "profile/",
  profile
);

      setProfile(response.data);

      setMessage("Profile updated successfully.");
    } catch (error) {
      console.error("Update Profile Error:", error);

      setError(
        error.response?.data
          ? "Unable to update profile. Please check your details."
          : "Unable to update profile."
      );
    } finally {
      setSaving(false);
    }
  };

  // -----------------------------
  // Password Input
  // -----------------------------

  const handlePasswordChange = (event) => {
    const { name, value } = event.target;

    setPassword((previousPassword) => ({
      ...previousPassword,
      [name]: value,
    }));
  };

  // -----------------------------
  // Change Password
  // -----------------------------

  const handlePasswordSubmit = async (event) => {
    event.preventDefault();

    setChangingPassword(true);
    setMessage("");
    setError("");

    if (password.new_password.length < 8) {
      setError("New password must contain at least 8 characters.");
      setChangingPassword(false);
      return;
    }

    if (
      password.new_password !==
      password.confirm_password
    ) {
      setError("New passwords do not match.");
      setChangingPassword(false);
      return;
    }

    try {
      const response = await api.post(
  "profile/change-password/",
  password
);

      setMessage(response.data.message);

      setPassword({
        current_password: "",
        new_password: "",
        confirm_password: "",
      });
    } catch (error) {
      console.error("Change Password Error:", error);

      setError(
        error.response?.data?.error ||
        "Unable to change password."
      );
    } finally {
      setChangingPassword(false);
    }
  };

  if (loading) {
    return (
      <div className="container mt-5 text-center">
        <h4>Loading profile...</h4>
      </div>
    );
  }

  return (
    <div className="container mt-5 mb-5">

      {/* Header */}

      <div className="card shadow-lg border-0 bg-primary text-white mb-4">

        <div className="card-body">

          <h2>👤 My Profile</h2>

          <p className="mb-0">
            Manage your BudgetBuddy account and personal information.
          </p>

        </div>

      </div>

      {/* Messages */}

      {message && (
        <div className="alert alert-success">
          ✅ {message}
        </div>
      )}

      {error && (
        <div className="alert alert-danger">
          ❌ {error}
        </div>
      )}

      {/* Profile Information */}

      <div className="card shadow border-0 mb-4">

        <div className="card-header bg-dark text-white">

          <h4 className="mb-0">
            👤 Personal Information
          </h4>

        </div>

        <div className="card-body">

          <form onSubmit={handleProfileSubmit}>

            <div className="row">

              {/* Username */}

              <div className="col-md-6 mb-3">

                <label className="form-label fw-bold">
                  Username
                </label>

                <input
                  type="text"
                  name="username"
                  className="form-control"
                  value={profile.username}
                  onChange={handleProfileChange}
                  required
                />

              </div>

              {/* Email */}

              <div className="col-md-6 mb-3">

                <label className="form-label fw-bold">
                  Email Address
                </label>

                <input
                  type="email"
                  name="email"
                  className="form-control"
                  value={profile.email}
                  onChange={handleProfileChange}
                  required
                />

              </div>

              {/* First Name */}

              <div className="col-md-6 mb-3">

                <label className="form-label fw-bold">
                  First Name
                </label>

                <input
                  type="text"
                  name="first_name"
                  className="form-control"
                  value={profile.first_name}
                  onChange={handleProfileChange}
                />

              </div>

              {/* Last Name */}

              <div className="col-md-6 mb-3">

                <label className="form-label fw-bold">
                  Last Name
                </label>

                <input
                  type="text"
                  name="last_name"
                  className="form-control"
                  value={profile.last_name}
                  onChange={handleProfileChange}
                />

              </div>

              {/* Phone */}

              <div className="col-md-6 mb-3">

                <label className="form-label fw-bold">
                  Phone Number
                </label>

                <input
                  type="text"
                  name="phone"
                  className="form-control"
                  value={profile.phone}
                  onChange={handleProfileChange}
                  placeholder="Enter phone number"
                />

              </div>

              {/* Address */}

              <div className="col-md-6 mb-3">

                <label className="form-label fw-bold">
                  Address
                </label>

                <textarea
                  name="address"
                  className="form-control"
                  rows="3"
                  value={profile.address}
                  onChange={handleProfileChange}
                  placeholder="Enter your address"
                />

              </div>

            </div>

            <div className="text-end">

              <button
                type="submit"
                className="btn btn-primary px-4"
                disabled={saving}
              >
                {saving
                  ? "Saving..."
                  : "💾 Save Changes"}
              </button>

            </div>

          </form>

        </div>

      </div>

      {/* Change Password */}

      <div className="card shadow border-0">

        <div className="card-header bg-dark text-white">

          <h4 className="mb-0">
            🔐 Change Password
          </h4>

        </div>

        <div className="card-body">

          <form onSubmit={handlePasswordSubmit}>

            {/* Current Password */}

            <div className="mb-3">

              <label className="form-label fw-bold">
                Current Password
              </label>

              <input
                type="password"
                name="current_password"
                className="form-control"
                value={password.current_password}
                onChange={handlePasswordChange}
                required
              />

            </div>

            {/* New Password */}

            <div className="mb-3">

              <label className="form-label fw-bold">
                New Password
              </label>

              <input
                type="password"
                name="new_password"
                className="form-control"
                value={password.new_password}
                onChange={handlePasswordChange}
                minLength="8"
                required
              />

              <small className="text-muted">
                Password must contain at least 8 characters.
              </small>

            </div>

            {/* Confirm Password */}

            <div className="mb-3">

              <label className="form-label fw-bold">
                Confirm New Password
              </label>

              <input
                type="password"
                name="confirm_password"
                className="form-control"
                value={password.confirm_password}
                onChange={handlePasswordChange}
                minLength="8"
                required
              />

            </div>

            <div className="text-end">

              <button
                type="submit"
                className="btn btn-warning px-4"
                disabled={changingPassword}
              >
                {changingPassword
                  ? "Changing..."
                  : "🔑 Change Password"}
              </button>

            </div>

          </form>

        </div>

      </div>

    </div>
  );
}

export default Profile;