import { useState, useEffect } from "react";
import api from "../../services/api";

interface Props {
  profile: any;
  onClose: () => void;
  onUpdate: () => void;
}

function EditProfileModal({
  profile,
  onClose,
  onUpdate,
}: Props) {

  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    phone_number: "",
    currency: "",
    monthly_income: "",
    bio: "",
    accent_color: "indigo",
  });

  useEffect(() => {
    setForm({
      first_name: profile.first_name || "",
      last_name: profile.last_name || "",
      phone_number: profile.phone_number || "",
      currency: profile.currency || "INR",
      monthly_income: profile.monthly_income || "",
      bio: profile.bio || "",
      accent_color: profile.accent_color || "indigo",
    });
  }, [profile]);

 async function handleSave() {
  console.log("SAVE BUTTON CLICKED");
  console.log("FORM DATA:", form);

  try {
    const response = await api.put("/profile/", form);

    console.log("SAVE SUCCESS:", response.data);

    onUpdate();
    onClose();

  } catch (err) {
    console.error("SAVE ERROR:", err);
  }
}

  return (

    <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50">

      <div className="bg-white dark:bg-gray-900 text-gray-800 dark:text-white rounded-2xl w-[500px] p-8 shadow-2xl">

        <h2 className="text-2xl font-bold mb-6">
          Edit Profile
        </h2>

        <div className="space-y-4">

          <input
            className="w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-800 dark:text-white rounded-xl p-3"
            placeholder="First Name"
            value={form.first_name}
            onChange={(e)=>
              setForm({
                ...form,
                first_name:e.target.value
              })
            }
          />

          <input
            className="w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-800 dark:text-white rounded-xl p-3"
            placeholder="Last Name"
            value={form.last_name}
            onChange={(e)=>
              setForm({
                ...form,
                last_name:e.target.value
              })
            }
          />

          <input
            className="w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-800 dark:text-white rounded-xl p-3"
            placeholder="Phone Number"
            value={form.phone_number}
            onChange={(e)=>
              setForm({
                ...form,
                phone_number:e.target.value
              })
            }
          />

          <select
            className="w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-800 dark:text-white rounded-xl p-3"
            value={form.currency}
            onChange={(e)=>
              setForm({
                ...form,
                currency:e.target.value
              })
            }
          >
            <option value="INR">INR</option>
            <option value="USD">USD</option>
            <option value="EUR">EUR</option>
          </select>
          
             <div>
                 <label className="block text-gray-600 mb-3">
                  Accent Color
  </label>

  <div className="flex gap-4">

    {/* Indigo */}
    <button
      type="button"
      onClick={() =>
        setForm({
          ...form,
          accent_color: "indigo",
        })
      }
      className={`w-10 h-10 rounded-full bg-indigo-600 ${
        form.accent_color === "indigo"
          ? "ring-4 ring-indigo-200"
          : ""
      }`}
    />

    {/* Blue */}
    <button
      type="button"
      onClick={() =>
        setForm({
          ...form,
          accent_color: "blue",
        })
      }
      className={`w-10 h-10 rounded-full bg-blue-600 ${
        form.accent_color === "blue"
          ? "ring-4 ring-blue-200"
          : ""
      }`}
    />

    {/* Green */}
    <button
      type="button"
      onClick={() =>
        setForm({
          ...form,
          accent_color: "green",
        })
      }
      className={`w-10 h-10 rounded-full bg-green-600 ${
        form.accent_color === "green"
          ? "ring-4 ring-green-200"
          : ""
      }`}
    />

    {/* Purple */}
    <button
      type="button"
      onClick={() =>
        setForm({
          ...form,
          accent_color: "purple",
        })
      }
      className={`w-10 h-10 rounded-full bg-purple-600 ${
        form.accent_color === "purple"
          ? "ring-4 ring-purple-200"
          : ""
      }`}
    />

    {/* Pink */}
    <button
      type="button"
      onClick={() =>
        setForm({
          ...form,
          accent_color: "pink",
        })
      }
      className={`w-10 h-10 rounded-full bg-pink-500 ${
        form.accent_color === "pink"
          ? "ring-4 ring-pink-200"
          : ""
      }`}
    />

    {/* Orange */}
    <button
      type="button"
      onClick={() =>
        setForm({
          ...form,
          accent_color: "orange",
        })
      }
      className={`w-10 h-10 rounded-full bg-orange-500 ${
        form.accent_color === "orange"
          ? "ring-4 ring-orange-200"
          : ""
      }`}
    />

  </div>
</div>
        <select>
            <option value="indigo">Indigo</option>
            <option value="blue">Blue</option>
            <option value="green">Green</option>
            <option value="red">Red</option>
            <option value="orange">Orange</option>
            <option value="purple">Purple</option>
        </select>

          <input
            className="w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-800 dark:text-white rounded-xl p-3"
            type="number"
            placeholder="Monthly Income"
            value={form.monthly_income}
            onChange={(e)=>
              setForm({
                ...form,
                monthly_income:e.target.value
              })
            }
          />

          <textarea
            rows={4}
            className="w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-800 dark:text-white rounded-xl p-3"
            placeholder="Tell us something about yourself..."
            value={form.bio}
            onChange={(e)=>
              setForm({
                ...form,
                bio:e.target.value
              })
            }
          />

        </div>

        <div className="flex justify-end gap-4 mt-8">

          <button
            onClick={onClose}
            className="px-6 py-2 rounded-xl border"
          >
            Cancel
          </button>

          <button
            onClick={handleSave}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-xl"
          >
            Save Changes
          </button>

        </div>

      </div>

    </div>

  );

}

export default EditProfileModal;