import { FaUserCircle, FaEnvelope, FaPhone, FaCalendarAlt } from "react-icons/fa";

function ProfileCard() {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">

      <div className="flex flex-col items-center">

        <FaUserCircle
          size={120}
          className="text-indigo-500"
        />

        <h2 className="text-3xl font-bold mt-4">
          Kanna
        </h2>

        <p className="text-gray-500">
          Personal Finance User
        </p>

      </div>

      <div className="mt-10 space-y-6">

        <div className="flex items-center gap-4">

          <FaEnvelope className="text-indigo-500"/>

          <span>
            kanna@gmail.com
          </span>

        </div>

        <div className="flex items-center gap-4">

          <FaPhone className="text-indigo-500"/>

          <span>
            +91 9876543210
          </span>

        </div>

        <div className="flex items-center gap-4">

          <FaCalendarAlt className="text-indigo-500"/>

          <span>
            Member Since July 2026
          </span>

        </div>

      </div>

      <button
        className="w-full mt-10 bg-indigo-600 hover:bg-indigo-700 text-white py-3 rounded-xl transition"
      >
        Edit Profile
      </button>

    </div>
  );
}

export default ProfileCard;