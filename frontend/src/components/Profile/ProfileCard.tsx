import { useEffect, useState, useRef } from "react";
import {
  FaUserCircle,
  FaEnvelope,
  FaPhone,
  FaWallet,
  FaRupeeSign,
} from "react-icons/fa";
import ChangePasswordModal from "./ChangePasswordModal";
import api from "../../services/api";
import EditProfileModal from "./EditProfileModal";

function ProfileCard() {
  const [profile, setProfile] = useState<any>(null);
  const [editOpen, setEditOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [passwordOpen, setPasswordOpen] = useState(false);
  const accentColors: any = {
  indigo: "bg-indigo-600 hover:bg-indigo-700",
  blue: "bg-blue-600 hover:bg-blue-700",
  green: "bg-green-600 hover:bg-green-700",
  purple: "bg-purple-600 hover:bg-purple-700",
  red: "bg-red-600 hover:bg-red-700",
  orange: "bg-orange-600 hover:bg-orange-700",
};
  useEffect(() => {
    loadProfile();
  }, []);

  async function loadProfile() {
    try {
      const response = await api.get("/profile/");
      setProfile(response.data);
    } catch (err) {
      console.log(err);
    }
  }

  if (!profile) {
    return (
      <div className="text-center text-xl mt-20">
        Loading...
      </div>
    );
  }
  async function uploadPicture(
  e: React.ChangeEvent<HTMLInputElement>
) {
  if (!e.target.files?.length) return;

  const formData = new FormData();

  formData.append(
    "profile_picture",
    e.target.files[0]
  );

  try {
    await api.put("/profile/", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });

    loadProfile();

  } catch (err) {
    console.log(err);
  }
}
<input
  type="file"
  accept="image/*"
  hidden
  ref={fileInputRef}
  onChange={uploadPicture}
/>   
  return (
    <>
    <input
      type="file"
      accept="image/*"
      hidden
      ref={fileInputRef}
      onChange={uploadPicture}
      />
      <div className="w-full bg-white dark:bg-gray-900 rounded-3xl shadow-xl overflow-hidden">

        {/* Cover */}
        <div className="h-52 bg-gradient-to-r from-indigo-600 via-purple-500 to-pink-500"></div>

        {/* Profile Image */}
        <div className="flex justify-center -mt-16">

          {profile.profile_picture ? (

            <img
              src={`https://budgetbuddy-a-full-stack-personal-budget-1hdo.onrender.com${profile.profile_picture}`}
              alt="Profile"
              className="w-32 h-32 rounded-full border-4 border-white shadow-lg object-cover"
            />

          ) : (

            <FaUserCircle
              size={130}
              className="text-white bg-indigo-500 rounded-full border-4 border-white"
            />

          )}

        </div>

        {/* Name */}

        <div className="text-center mt-5">
<h1 className="text-3xl font-bold text-gray-800 dark:text-white">
          
            {profile.first_name} {profile.last_name}
          </h1>

          <p className="text-gray-500 dark:text-gray-400 mt-1">
            @{profile.username}
          </p>

          <p className="text-sm text-gray-400  dark:text-gray-400 mt-2">
            Member Since{" "}
            {new Date(profile.created_at).toLocaleDateString("en-US", {
              month: "long",
              year: "numeric",
            })}
          </p>

        </div>

        {/* Cards */}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-10">

          <div className="bg-gray-50 dark:bg-gray-800 rounded-2xl p-5 shadow">

            <div className="flex items-center gap-4">

              <FaEnvelope className="text-indigo-600 text-xl" />

              <div>

                <p className="text-gray-500 dark:text-gray-400 text-sm">
                  Email
                </p>

                <h3 className="font-semibold text-gray-800 dark:text-white">
                  {profile.email}
                </h3>

              </div>

            </div>

          </div>

          <div className="bg-gray-50 dark:bg-gray-800 rounded-2xl p-5 shadow">

            <div className="flex items-center gap-4">

              <FaPhone className="text-green-600 text-xl" />

              <div>

                <p className="text-gray-500 dark:text-gray-400 text-sm">
                  Phone
                </p>

                <h3 className="font-semibold text-gray-800 dark:text-white">
                  {profile.phone_number || "Not Added"}
                </h3>

              </div>

            </div>

          </div>
          <div className="bg-gray-50 dark:bg-gray-800 rounded-2xl p-5 shadow">

  <div>

    <p className="text-gray-500 dark:text-gray-400 text-sm">
      Accent Color
    </p>

    <h3 className="font-semibold capitalize">
      {profile.accent_color}
    </h3>

  </div>

</div>

          <div className="bg-gray-50 dark:bg-gray-800 rounded-2xl p-5 shadow">

            <div className="flex items-center gap-4">

              <FaWallet className="text-purple-600 text-xl" />

              <div>

                <p className="text-gray-500 dark:text-gray-400 text-sm">
                  Currency
                </p>

                <h3 className="font-semibold text-gray-800 dark:text-white">
                  {profile.currency}
                </h3>

              </div>

            </div>

          </div>

          <div className="bg-gray-50 dark:bg-gray-800 rounded-2xl p-5 shadow">

            <div className="flex items-center gap-4">

              <FaRupeeSign className="text-yellow-600 text-xl" />

              <div>

                <p className="text-gray-500 dark:text-gray-400 text-sm">
                  Monthly Income
                </p>

                <h3 className="font-semibold text-gray-800 dark:text-white">
                  ₹{profile.monthly_income}
                </h3>

              </div>

            </div>

          </div>

        </div>

        {/* About */}

        <div className="px-10 pb-6">

          <div className="bg-indigo-50 dark:bg-gray-800 rounded-2xl p-6">

            <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-3">
              About
            </h2>

            <p className="text-gray-600 dark:text-gray-400">
              {profile.bio
        ? profile.bio
        : "Tell everyone something about yourself..."}
            </p>

          </div>

        </div>

        {/* Buttons */}

        <div className="flex justify-center gap-5 pb-10">

          <button
  onClick={() => setEditOpen(true)}
  className={`${
    accentColors[profile.accent_color] || accentColors.indigo
  } text-white px-8 py-3 rounded-xl`}
>
  Edit Profile
</button>

          <button
            onClick={() => fileInputRef.current?.click()}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl transition"
          >
            Change Picture
          </button>
          <button
  onClick={() => setPasswordOpen(true)}
  className={`${
    accentColors[profile.accent_color] || accentColors.indigo
  } text-white px-8 py-3 rounded-xl`}
>
  Change Password
</button>

        </div>

      </div>

      {editOpen && (
        <EditProfileModal
          profile={profile}
          onClose={() => setEditOpen(false)}
          onUpdate={loadProfile}
        />
      )}
      {passwordOpen && (
      <ChangePasswordModal
        onClose={() => setPasswordOpen(false)}
      />
    )}
    </>
  );
}
export default ProfileCard;