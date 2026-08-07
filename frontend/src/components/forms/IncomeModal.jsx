import { useState, useEffect } from "react";

export default function IncomeModal({
  isOpen,
  onClose,
  onSave,
  income,
}) {
  const [formData, setFormData] = useState({
    title: "",
    amount: "",
    source: "SALARY",
    description: "",
    income_date: new Date().toISOString().split("T")[0],
  });

  useEffect(() => {
    if (income) {
      setFormData({
        title: income.title || "",
        amount: income.amount || "",
        source: income.source || "SALARY",
        description: income.description || "",
        income_date: income.income_date
          ? new Date(income.income_date).toISOString().split("T")[0]
          : new Date().toISOString().split("T")[0],
      });
    } else {
      setFormData({
        title: "",
        amount: "",
        source: "SALARY",
        description: "",
        income_date: new Date().toISOString().split("T")[0],
      });
    }
  }, [income]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    await onSave(formData);

    setFormData({
      title: "",
      amount: "",
      source: "SALARY",
      description: "",
      income_date: new Date().toISOString().split("T")[0],
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 w-full max-w-md border border-slate-200 dark:border-slate-700 shadow-xl space-y-6 text-slate-900 dark:text-white">
        {/* Header */}
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
            {income ? "Edit Income" : "Add Income"}
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            {income
              ? "Update details for this income entry."
              : "Fill in details to log new earnings."}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Title Input */}
          <div>
            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">
              Title
            </label>
            <input
              type="text"
              name="title"
              placeholder="e.g. Monthly Salary"
              value={formData.title}
              onChange={handleChange}
              className="w-full p-3 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm transition"
              required
            />
          </div>

          {/* Amount Input */}
          <div>
            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">
              Amount
            </label>
            <input
              type="number"
              name="amount"
              placeholder="e.g. 50000"
              value={formData.amount}
              onChange={handleChange}
              className="w-full p-3 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm transition"
              required
            />
          </div>

          {/* Source Select */}
          <div>
            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">
              Income Source
            </label>
            <select
              name="source"
              value={formData.source}
              onChange={handleChange}
              className="w-full p-3 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm transition"
            >
              <option value="SALARY">Salary</option>
              <option value="POCKET_MONEY">Pocket Money</option>
              <option value="FREELANCING">Freelancing</option>
              <option value="SCHOLARSHIP">Scholarship</option>
              <option value="BUSINESS">Business</option>
              <option value="OTHER">Other</option>
            </select>
          </div>

          {/* Income Date Input */}
          <div>
            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">
              Date
            </label>
            <input
              type="date"
              name="income_date"
              value={formData.income_date}
              onChange={handleChange}
              className="w-full p-3 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm transition"
              required
            />
          </div>

          {/* Description Textarea */}
          <div>
            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">
              Description (Optional)
            </label>
            <textarea
              name="description"
              placeholder="Add details about this income..."
              value={formData.description}
              onChange={handleChange}
              className="w-full p-3 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm transition"
              rows="3"
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 rounded-2xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-700 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 font-semibold transition text-sm"
            >
              Cancel
            </button>

            <button
              type="submit"
              className="px-5 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-semibold transition text-sm shadow-md"
            >
              {income ? "Update Income" : "Save Income"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}