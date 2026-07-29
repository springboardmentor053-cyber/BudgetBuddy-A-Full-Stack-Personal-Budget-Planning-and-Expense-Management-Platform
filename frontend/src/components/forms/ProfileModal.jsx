import { useState, useEffect } from "react";
import { FaTimes, FaSave } from "react-icons/fa";

export default function ProfileModal({ isOpen, onClose, onSave, profile }) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    location: "",
    profession: "",
  });

  useEffect(() => {
    if (profile) {
      setFormData({
        name: profile.name || "",
        email: profile.email || "",
        phone: profile.phone || "",
        location: profile.location || "",
        profession: profile.profession || "",
      });
    }
  }, [profile]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 w-full max-w-lg rounded-3xl p-6 shadow-xl space-y-6">
        
        {/* Modal Header */}
        <div className="flex justify-between items-center border-b border-slate-200 dark:border-slate-700 pb-4">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">Edit Profile</h2>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 dark:hover:text-white transition"
          >
            <FaTimes />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Full Name
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              className="w-full bg-slate-100 dark:bg-slate-700/50 text-slate-900 dark:text-white rounded-2xl px-4 py-2.5 border border-slate-200 dark:border-slate-600 outline-none focus:ring-2 focus:ring-cyan-500 transition"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Email Address
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              className="w-full bg-slate-100 dark:bg-slate-700/50 text-slate-900 dark:text-white rounded-2xl px-4 py-2.5 border border-slate-200 dark:border-slate-600 outline-none focus:ring-2 focus:ring-cyan-500 transition"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Phone Number
            </label>
            <input
              type="text"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              className="w-full bg-slate-100 dark:bg-slate-700/50 text-slate-900 dark:text-white rounded-2xl px-4 py-2.5 border border-slate-200 dark:border-slate-600 outline-none focus:ring-2 focus:ring-cyan-500 transition"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Location
            </label>
            <input
              type="text"
              name="location"
              value={formData.location}
              onChange={handleChange}
              className="w-full bg-slate-100 dark:bg-slate-700/50 text-slate-900 dark:text-white rounded-2xl px-4 py-2.5 border border-slate-200 dark:border-slate-600 outline-none focus:ring-2 focus:ring-cyan-500 transition"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Profession
            </label>
            <input
              type="text"
              name="profession"
              value={formData.profession}
              onChange={handleChange}
              className="w-full bg-slate-100 dark:bg-slate-700/50 text-slate-900 dark:text-white rounded-2xl px-4 py-2.5 border border-slate-200 dark:border-slate-600 outline-none focus:ring-2 focus:ring-cyan-500 transition"
            />
          </div>

          {/* Buttons */}
          <div className="flex justify-end gap-3 pt-4 border-t border-slate-200 dark:border-slate-700">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex items-center gap-2 bg-cyan-500 hover:bg-cyan-400 text-slate-950 px-6 py-2.5 rounded-xl font-semibold transition shadow-md"
            >
              <FaSave />
              <span>Save Changes</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}