import { useState } from "react";
import api from "../../services/api";

interface Props {
  onClose: () => void;
}

function ChangePasswordModal({ onClose }: Props) {
  const [form, setForm] = useState({
    old_password: "",
    new_password: "",
  });

  async function handleSave() {
    try {
      await api.put("/change-password/", form);

      alert("Password changed successfully!");

      onClose();
    } catch (err: any) {
      alert(
        err.response?.data?.error ||
        "Unable to change password."
      );
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50">

      <div className="bg-white dark:bg-gray-900 text-gray-800 dark:text-white rounded-2xl p-8 w-[400px]">

        <h2 className="text-2xl font-bold mb-6">
          Change Password
        </h2>

        <div className="space-y-4">

          <input
            type="password"
            placeholder="Old Password"
            className="w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-800 dark:text-white rounded-xl p-3"
            value={form.old_password}
            onChange={(e) =>
              setForm({
                ...form,
                old_password: e.target.value,
              })
            }
          />

          <input
            type="password"
            placeholder="New Password"
            className="w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-800 dark:text-white rounded-xl p-3"
            value={form.new_password}
            onChange={(e) =>
              setForm({
                ...form,
                new_password: e.target.value,
              })
            }
          />

        </div>

        <div className="flex justify-end gap-3 mt-8">

          <button
            onClick={onClose}
            className="border px-5 py-2 rounded-xl"
          >
            Cancel
          </button>

          <button
            onClick={handleSave}
            className="bg-indigo-600 text-white px-5 py-2 rounded-xl"
          >
            Save
          </button>

        </div>

      </div>

    </div>
  );
}

export default ChangePasswordModal;