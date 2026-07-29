import { useEffect, useState } from "react";

export default function SavingsModal({
  isOpen,
  onClose,
  onSave,
  goal,
}) {
  const [formData, setFormData] = useState({
    goal_name: "",
    goal_type: "",
    target_amount: "",
    saved_amount: "",
    target_date: "",
    status: "ACTIVE",
  });

  useEffect(() => {
    if (goal) {
      setFormData(goal);
    } else {
      setFormData({
        goal_name: "",
        goal_type: "",
        target_amount: "",
        saved_amount: "",
        target_date: "",
        status: "ACTIVE",
      });
    }
  }, [goal]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    onSave(formData);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 flex justify-center items-center z-50">

      <div className="bg-slate-800 rounded-2xl p-8 w-full max-w-lg">

        <h2 className="text-2xl font-bold text-white mb-6">

          {goal ? "Edit Goal" : "Add Goal"}

        </h2>

        <form
          onSubmit={handleSubmit}
          className="space-y-4"
        >

          <input
            name="goal_name"
            placeholder="Goal Name"
            value={formData.goal_name}
            onChange={handleChange}
            className="w-full p-3 rounded bg-slate-700 text-white"
            required
          />

          <select
  name="goal_type"
  value={formData.goal_type}
  onChange={handleChange}
  className="w-full p-3 rounded bg-slate-700 text-white"
  required
>
  <option value="">Select Goal Type</option>

  <option value="EMERGENCY">
    Emergency Fund
  </option>

  <option value="EDUCATION">
    Education
  </option>

  <option value="TRAVEL">
    Travel
  </option>

  <option value="VEHICLE">
    Vehicle
  </option>

  <option value="HOME">
    Home
  </option>

  <option value="GADGETS">
    Gadgets
  </option>

  <option value="INVESTMENT">
    Investment
  </option>

  <option value="OTHER">
    Other
  </option>

</select>

          <input
            type="number"
            name="target_amount"
            placeholder="Target Amount"
            value={formData.target_amount}
            onChange={handleChange}
            className="w-full p-3 rounded bg-slate-700 text-white"
            required
          />

          <input
            type="number"
            name="saved_amount"
            placeholder="Saved Amount"
            value={formData.saved_amount}
            onChange={handleChange}
            className="w-full p-3 rounded bg-slate-700 text-white"
          />

          <input
            type="date"
            name="target_date"
            value={formData.target_date}
            onChange={handleChange}
            className="w-full p-3 rounded bg-slate-700 text-white"
            required
          />

          <select
            name="status"
            value={formData.status}
            onChange={handleChange}
            className="w-full p-3 rounded bg-slate-700 text-white"
          >
            <option value="ACTIVE">
              Active
            </option>

            <option value="COMPLETED">
              Completed
            </option>
          </select>

          <div className="flex justify-end gap-4 mt-6">

            <button
              type="button"
              onClick={onClose}
              className="bg-red-500 px-5 py-2 rounded-lg"
            >
              Cancel
            </button>

            <button
              type="submit"
              className="bg-cyan-500 px-5 py-2 rounded-lg"
            >
              {goal ? "Update" : "Save"}
            </button>

          </div>

        </form>

      </div>

    </div>
  );
}