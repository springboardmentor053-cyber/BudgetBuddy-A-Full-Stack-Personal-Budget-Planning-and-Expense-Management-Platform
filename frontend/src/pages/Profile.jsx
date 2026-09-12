import { useEffect, useState } from "react";
import axios from "axios";
import "../styles/profile.css";

function Profile() {
  const [profile, setProfile] = useState({
    username: "",
    email: "",
    first_name: "",
    last_name: "",
    phone: "",
    address: "",
    profile_picture: "",
  });

  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState("");

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

  const token = localStorage.getItem("access");

  const config = {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };

  const API_BASE = "http://127.0.0.1:8000";

  // =====================================================
  // PROFILE PICTURE URL
  // =====================================================

  const getProfilePictureUrl = (picture) => {
    if (!picture) {
      return "";
    }

    if (picture.startsWith("http")) {
      return picture;
    }

    return `${API_BASE}${picture}`;
  };

  // =====================================================
  // FETCH PROFILE
  // =====================================================

  const fetchProfile = async () => {
    try {
      const response = await axios.get(
        `${API_BASE}/api/profile/`,
        config
      );

      setProfile(response.data);

      if (response.data.profile_picture) {
        setImagePreview(
          getProfilePictureUrl(
            response.data.profile_picture
          )
        );
      }

      setError("");

    } catch (error) {
      console.error("Profile Error:", error);

      if (error.response?.status === 401) {
        setError(
          "Session expired. Please login again."
        );

        localStorage.removeItem("access");
        localStorage.removeItem("refresh");

        setTimeout(() => {
          window.location.href = "/login";
        }, 2000);

      } else {
        setError(
          "Unable to load profile details."
        );
      }

    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  // =====================================================
  // PROFILE INPUT
  // =====================================================

  const handleProfileChange = (event) => {
    const { name, value } = event.target;

    setProfile((previousProfile) => ({
      ...previousProfile,
      [name]: value,
    }));
  };

  // =====================================================
  // PROFILE IMAGE
  // =====================================================

  const handleImageChange = (event) => {
    const file = event.target.files?.[0];

    if (!file) {
      return;
    }

    // Check file type
    const allowedTypes = [
      "image/jpeg",
      "image/jpg",
      "image/png",
      "image/webp",
    ];

    if (!allowedTypes.includes(file.type)) {
      setError(
        "Please select a JPG, PNG, or WebP image."
      );

      event.target.value = "";
      return;
    }

    // Check file size - 5 MB
    if (file.size > 5 * 1024 * 1024) {
      setError(
        "Profile picture must be smaller than 5 MB."
      );

      event.target.value = "";
      return;
    }

    setError("");
    setSelectedImage(file);

    const previewUrl =
      URL.createObjectURL(file);

    setImagePreview(previewUrl);
  };

  // =====================================================
  // REMOVE SELECTED IMAGE
  // =====================================================

  const handleRemoveSelectedImage = () => {
    setSelectedImage(null);

    if (profile.profile_picture) {
      setImagePreview(
        getProfilePictureUrl(
          profile.profile_picture
        )
      );
    } else {
      setImagePreview("");
    }
  };

  // =====================================================
  // SAVE PROFILE
  // =====================================================

  const handleProfileSubmit = async (event) => {
    event.preventDefault();

    setSaving(true);
    setMessage("");
    setError("");

    try {
      const formData = new FormData();

      formData.append(
        "username",
        profile.username || ""
      );

      formData.append(
        "email",
        profile.email || ""
      );

      formData.append(
        "first_name",
        profile.first_name || ""
      );

      formData.append(
        "last_name",
        profile.last_name || ""
      );

      formData.append(
        "phone",
        profile.phone || ""
      );

      formData.append(
        "address",
        profile.address || ""
      );

      if (selectedImage) {
        formData.append(
          "profile_picture",
          selectedImage
        );
      }

      const response = await axios.put(
        `${API_BASE}/api/profile/`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      setProfile(response.data);

      setSelectedImage(null);

      if (response.data.profile_picture) {
        setImagePreview(
          getProfilePictureUrl(
            response.data.profile_picture
          )
        );
      }

      setMessage(
        "Profile updated successfully."
      );

    } catch (error) {
      console.error(
        "Update Profile Error:",
        error
      );

      setError(
        error.response?.data
          ? "Unable to update profile. Please check your details."
          : "Unable to update profile."
      );

    } finally {
      setSaving(false);
    }
  };

  // =====================================================
  // PASSWORD INPUT
  // =====================================================

  const handlePasswordChange = (event) => {
    const { name, value } = event.target;

    setPassword((previousPassword) => ({
      ...previousPassword,
      [name]: value,
    }));
  };

  // =====================================================
  // CHANGE PASSWORD
  // =====================================================

  const handlePasswordSubmit = async (event) => {
    event.preventDefault();

    setChangingPassword(true);
    setMessage("");
    setError("");

    if (password.new_password.length < 8) {
      setError(
        "New password must contain at least 8 characters."
      );

      setChangingPassword(false);
      return;
    }

    if (
      password.new_password !==
      password.confirm_password
    ) {
      setError(
        "New passwords do not match."
      );

      setChangingPassword(false);
      return;
    }

    try {
      const response = await axios.post(
        `${API_BASE}/api/profile/change-password/`,
        password,
        config
      );

      setMessage(response.data.message);

      setPassword({
        current_password: "",
        new_password: "",
        confirm_password: "",
      });

    } catch (error) {
      console.error(
        "Change Password Error:",
        error
      );

      setError(
        error.response?.data?.error ||
        "Unable to change password."
      );

    } finally {
      setChangingPassword(false);
    }
  };

  // =====================================================
  // LOADING
  // =====================================================

  if (loading) {
    return (
      <div className="profile-loading">

        <div className="profile-loading-spinner">
          <i className="bi bi-arrow-repeat"></i>
        </div>

        <p>
          Loading profile...
        </p>

      </div>
    );
  }

  // =====================================================
  // UI
  // =====================================================

  return (
    <div className="profile-page">

      {/* =================================================
          HEADER
      ================================================= */}

      <div className="profile-header">

        <div>

          <div className="profile-eyebrow">
            ACCOUNT
          </div>

          <h1>
            My Profile
          </h1>

          <p>
            Manage your personal information and account security.
          </p>

        </div>

        <div className="profile-header-icon">
          <i className="bi bi-person-circle"></i>
        </div>

      </div>


      {/* =================================================
          MESSAGES
      ================================================= */}

      {message && (

        <div className="profile-alert success">

          <i className="bi bi-check-circle-fill"></i>

          <span>
            {message}
          </span>

          <button
            type="button"
            onClick={() => setMessage("")}
          >
            <i className="bi bi-x-lg"></i>
          </button>

        </div>

      )}


      {error && (

        <div className="profile-alert error">

          <i className="bi bi-exclamation-circle-fill"></i>

          <span>
            {error}
          </span>

          <button
            type="button"
            onClick={() => setError("")}
          >
            <i className="bi bi-x-lg"></i>
          </button>

        </div>

      )}


      {/* =================================================
          PERSONAL INFORMATION
      ================================================= */}

      <section className="profile-card">

        <div className="profile-card-header">

          <div className="profile-card-title">

            <div className="profile-card-icon">
              <i className="bi bi-person"></i>
            </div>

            <div>

              <h2>
                Personal Information
              </h2>

              <p>
                Update your personal details and profile picture.
              </p>

            </div>

          </div>

        </div>


        <div className="profile-card-body">

          <form onSubmit={handleProfileSubmit}>

            {/* =================================================
                PROFILE PICTURE
            ================================================= */}

            <div className="profile-picture-section">

              <div className="profile-picture-wrapper">

                {imagePreview ? (

                  <img
                    src={imagePreview}
                    alt="Profile"
                    className="profile-picture"
                  />

                ) : (

                  <div className="profile-picture-placeholder">

                    <span>
                      {profile.username
                        ? profile.username
                            .charAt(0)
                            .toUpperCase()
                        : "U"}
                    </span>

                  </div>

                )}

                <label
                  htmlFor="profile-picture-input"
                  className="profile-picture-camera"
                  title="Change profile picture"
                >

                  <i className="bi bi-camera-fill"></i>

                </label>

              </div>


              <div className="profile-picture-info">

                <h3>
                  Profile Picture
                </h3>

                <p>
                  Add a photo so your account feels more personal.
                </p>

                <div className="profile-picture-actions">

                  <label
                    htmlFor="profile-picture-input"
                    className="profile-upload-btn"
                  >

                    <i className="bi bi-upload"></i>

                    Choose Photo

                  </label>

                  {selectedImage && (

                    <button
                      type="button"
                      className="profile-remove-image-btn"
                      onClick={
                        handleRemoveSelectedImage
                      }
                    >

                      Remove

                    </button>

                  )}

                </div>

                <small>
                  JPG, PNG or WebP · Maximum 5 MB
                </small>

                <input
                  id="profile-picture-input"
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  onChange={handleImageChange}
                  hidden
                />

              </div>

            </div>


            {/* =================================================
                FIELDS
            ================================================= */}

            <div className="profile-form-grid">

              <div className="profile-field">

                <label>
                  Username
                </label>

                <div className="profile-input-wrapper">

                  <i className="bi bi-at"></i>

                  <input
                    type="text"
                    name="username"
                    value={profile.username}
                    onChange={handleProfileChange}
                    required
                  />

                </div>

              </div>


              <div className="profile-field">

                <label>
                  Email Address
                </label>

                <div className="profile-input-wrapper">

                  <i className="bi bi-envelope"></i>

                  <input
                    type="email"
                    name="email"
                    value={profile.email}
                    onChange={handleProfileChange}
                    required
                  />

                </div>

              </div>


              <div className="profile-field">

                <label>
                  First Name
                </label>

                <div className="profile-input-wrapper">

                  <i className="bi bi-person"></i>

                  <input
                    type="text"
                    name="first_name"
                    value={profile.first_name}
                    onChange={handleProfileChange}
                  />

                </div>

              </div>


              <div className="profile-field">

                <label>
                  Last Name
                </label>

                <div className="profile-input-wrapper">

                  <i className="bi bi-person"></i>

                  <input
                    type="text"
                    name="last_name"
                    value={profile.last_name}
                    onChange={handleProfileChange}
                  />

                </div>

              </div>


              <div className="profile-field">

                <label>
                  Phone Number
                </label>

                <div className="profile-input-wrapper">

                  <i className="bi bi-telephone"></i>

                  <input
                    type="text"
                    name="phone"
                    value={profile.phone}
                    onChange={handleProfileChange}
                    placeholder="Enter phone number"
                  />

                </div>

              </div>


              <div className="profile-field profile-field-full">

                <label>
                  Address
                </label>

                <div className="profile-input-wrapper textarea-wrapper">

                  <i className="bi bi-geo-alt"></i>

                  <textarea
                    name="address"
                    rows="3"
                    value={profile.address}
                    onChange={handleProfileChange}
                    placeholder="Enter your address"
                  />

                </div>

              </div>

            </div>


            <div className="profile-form-footer">

              <button
                type="submit"
                className="profile-save-btn"
                disabled={saving}
              >

                <i
                  className={
                    saving
                      ? "bi bi-arrow-repeat"
                      : "bi bi-check2"
                  }
                ></i>

                {saving
                  ? "Saving..."
                  : "Save Changes"}

              </button>

            </div>

          </form>

        </div>

      </section>


      {/* =================================================
          CHANGE PASSWORD
      ================================================= */}

      <section className="profile-card">

        <div className="profile-card-header">

          <div className="profile-card-title">

            <div
              className="profile-card-icon"
              style={{
                background: "#fff7ed",
                color: "#ea580c",
              }}
            >
              <i className="bi bi-shield-lock"></i>
            </div>

            <div>

              <h2>
                Account Security
              </h2>

              <p>
                Change your password to keep your account secure.
              </p>

            </div>

          </div>

        </div>


        <div className="profile-card-body">

          <form onSubmit={handlePasswordSubmit}>

            <div className="password-form-grid">

              <div className="profile-field password-field-full">

                <label>
                  Current Password
                </label>

                <div className="profile-input-wrapper">

                  <i className="bi bi-lock"></i>

                  <input
                    type="password"
                    name="current_password"
                    value={
                      password.current_password
                    }
                    onChange={
                      handlePasswordChange
                    }
                    required
                  />

                </div>

              </div>


              <div className="profile-field">

                <label>
                  New Password
                </label>

                <div className="profile-input-wrapper">

                  <i className="bi bi-key"></i>

                  <input
                    type="password"
                    name="new_password"
                    value={
                      password.new_password
                    }
                    onChange={
                      handlePasswordChange
                    }
                    minLength="8"
                    required
                  />

                </div>

                <small>
                  Minimum 8 characters
                </small>

              </div>


              <div className="profile-field">

                <label>
                  Confirm New Password
                </label>

                <div className="profile-input-wrapper">

                  <i className="bi bi-key-fill"></i>

                  <input
                    type="password"
                    name="confirm_password"
                    value={
                      password.confirm_password
                    }
                    onChange={
                      handlePasswordChange
                    }
                    minLength="8"
                    required
                  />

                </div>

              </div>

            </div>


            <div className="profile-form-footer">

              <button
                type="submit"
                className="profile-password-btn"
                disabled={changingPassword}
              >

                <i className="bi bi-shield-check"></i>

                {changingPassword
                  ? "Changing..."
                  : "Change Password"}

              </button>

            </div>

          </form>

        </div>

      </section>

    </div>
  );
}

export default Profile;