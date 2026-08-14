import { useState, useEffect } from "react";

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
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (goal) {
      setFormData({
        goal_name: goal.goal_name || "",
        goal_type: goal.goal_type || "",
        target_amount: goal.target_amount || "",
        saved_amount: goal.saved_amount || "",
        target_date: goal.target_date
          ? new Date(goal.target_date).toISOString().split("T")[0]
          : "",
        status: goal.status || "ACTIVE",
      });
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

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "target_amount" || name === "saved_amount") {
      setFormData({
        ...formData,
        [name]: value === "" ? "" : Math.max(0, Number(value)),
      });
    } else {
      setFormData({
        ...formData,
        [name]: value,
      });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return; // Prevent duplicate triggers if already submitting

    try {
      setIsSubmitting(true);
      await onSave(formData);

      setFormData({
        goal_name: "",
        goal_type: "",
        target_amount: "",
        saved_amount: "",
        target_date: "",
        status: "ACTIVE",
      });

      onClose();
    } catch (error) {
      console.error("Error saving savings goal:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 w-full max-w-md border border-slate-200 dark:border-slate-700 shadow-xl space-y-6 text-slate-900 dark:text-white">
        {/* Header */}
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
            {goal ? "Edit Savings Goal" : "Add Savings Goal"}
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            {goal
              ? "Update details and progress for this savings target."
              : "Define a target to track your savings progress."}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Goal Name Input */}
          <div>
            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">
              Goal Name
            </label>
            <input
              type="text"
              name="goal_name"
              placeholder="e.g. New Laptop or Japan Trip"
              value={formData.goal_name}
              onChange={handleChange}
              disabled={isSubmitting}
              className="w-full p-3 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm transition disabled:opacity-50"
              required
            />
          </div>

          {/* Goal Type Select */}
          <div>
            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">
              Goal Type
            </label>
            <select
              name="goal_type"
              value={formData.goal_type}
              onChange={handleChange}
              disabled={isSubmitting}
              className="w-full p-3 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm transition disabled:opacity-50"
              required
            >
              <option value="">Select Goal Type</option>
              <option value="EMERGENCY">Emergency Fund</option>
              <option value="EDUCATION">Education</option>
              <option value="TRAVEL">Travel</option>
              <option value="VEHICLE">Vehicle</option>
              <option value="HOME">Home</option>
              <option value="GADGETS">Gadgets</option>
              <option value="INVESTMENT">Investment</option>
              <option value="OTHER">Other</option>
            </select>
          </div>

          {/* Target & Saved Amounts Grid */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">
                Target Amount
              </label>
              <input
                type="number"
                name="target_amount"
                placeholder="e.g. 50000"
                value={formData.target_amount}
                onChange={handleChange}
                disabled={isSubmitting}
                className="w-full p-3 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm transition disabled:opacity-50"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">
                Saved So Far
              </label>
              <input
                type="number"
                name="saved_amount"
                placeholder="e.g. 10000"
                value={formData.saved_amount}
                onChange={handleChange}
                disabled={isSubmitting}
                className="w-full p-3 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm transition disabled:opacity-50"
              />
            </div>
          </div>

          {/* Target Date Input */}
          <div>
            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">
              Target Completion Date
            </label>
            <input
              type="date"
              name="target_date"
              value={formData.target_date}
              onChange={handleChange}
              disabled={isSubmitting}
              className="w-full p-3 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm transition disabled:opacity-50"
              required
            />
          </div>

          {/* Status Select */}
          <div>
            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">
              Status
            </label>
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              disabled={isSubmitting}
              className="w-full p-3 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm transition disabled:opacity-50"
            >
              <option value="ACTIVE">Active</option>
              <option value="COMPLETED">Completed</option>
            </select>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-5 py-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 font-semibold transition text-sm disabled:opacity-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2.5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-semibold transition text-sm shadow-md disabled:opacity-50"
            >
              {isSubmitting ? "Saving..." : goal ? "Update Goal" : "Save Goal"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}