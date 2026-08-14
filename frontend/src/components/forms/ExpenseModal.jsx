import { useState, useEffect } from "react";

export default function ExpenseModal({
  isOpen,
  onClose,
  onSave,
  expense,
}) {
  const [formData, setFormData] = useState({
    title: "",
    amount: "",
    category: "Food",
    payment_method: "Cash",
    description: "",
    expense_date: new Date().toISOString().split("T")[0],
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (expense) {
      setFormData({
        title: expense.title || "",
        amount: expense.amount || "",
        category: expense.category || "Food",
        payment_method: expense.payment_method || "Cash",
        description: expense.description || "",
        expense_date: expense.expense_date
          ? new Date(expense.expense_date).toISOString().split("T")[0]
          : new Date().toISOString().split("T")[0],
      });
    } else {
      setFormData({
        title: "",
        amount: "",
        category: "Food",
        payment_method: "Cash",
        description: "",
        expense_date: new Date().toISOString().split("T")[0],
      });
    }
  }, [expense]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name === "amount") {
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
        title: "",
        amount: "",
        category: "Food",
        payment_method: "Cash",
        description: "",
        expense_date: new Date().toISOString().split("T")[0],
      });

      onClose();
    } catch (error) {
      console.error("Error saving expense:", error);
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
            {expense ? "Edit Expense" : "Add Expense"}
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            {expense
              ? "Update details for this transaction."
              : "Fill in the details to record a new expense."}
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
              placeholder="e.g. Dinner with friends"
              value={formData.title}
              onChange={handleChange}
              disabled={isSubmitting}
              className="w-full p-3 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm transition disabled:opacity-50"
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
              placeholder="e.g. 1200"
              value={formData.amount}
              onChange={handleChange}
              disabled={isSubmitting}
              className="w-full p-3 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm transition disabled:opacity-50"
              required
            />
          </div>

          {/* Category Select */}
          <div>
            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">
              Category
            </label>
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              disabled={isSubmitting}
              className="w-full p-3 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm transition disabled:opacity-50"
            >
              <option value="Food">Food</option>
              <option value="Travel">Travel</option>
              <option value="Shopping">Shopping</option>
              <option value="Entertainment">Entertainment</option>
              <option value="Education">Education</option>
              <option value="Healthcare">Healthcare</option>
              <option value="Bills">Bills</option>
              <option value="Miscellaneous">Miscellaneous</option>
            </select>
          </div>

          {/* Payment Method Select */}
          <div>
            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">
              Payment Method
            </label>
            <select
              name="payment_method"
              value={formData.payment_method}
              onChange={handleChange}
              disabled={isSubmitting}
              className="w-full p-3 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm transition disabled:opacity-50"
            >
              <option value="Cash">Cash</option>
              <option value="UPI">UPI</option>
              <option value="Card">Card</option>
              <option value="Net Banking">Net Banking</option>
              <option value="Wallet">Wallet</option>
            </select>
          </div>

          {/* Expense Date Input */}
          <div>
            <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">
              Date
            </label>
            <input
              type="date"
              name="expense_date"
              value={formData.expense_date}
              onChange={handleChange}
              disabled={isSubmitting}
              className="w-full p-3 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm transition disabled:opacity-50"
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
              placeholder="Add details about this expense..."
              value={formData.description}
              onChange={handleChange}
              disabled={isSubmitting}
              className="w-full p-3 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm transition disabled:opacity-50"
              rows="3"
            />
          </div>

          {/* Actions */}
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
              className="px-5 py-2.5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-semibold transition text-sm shadow-md disabled:opacity-50"
            >
              {isSubmitting ? "Saving..." : expense ? "Update" : "Save Expense"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}