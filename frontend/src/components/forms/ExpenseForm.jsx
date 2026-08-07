import { useState } from "react";
import { FaPlus } from "react-icons/fa";

export default function ExpenseForm({ onSubmit }) {
  const [formData, setFormData] = useState({
    title: "",
    amount: "",
    category: "Food",
    payment_method: "Cash",
    description: "",
    expense_date: new Date().toISOString().split("T")[0],
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);

    setFormData({
      title: "",
      amount: "",
      category: "Food",
      payment_method: "Cash",
      description: "",
      expense_date: new Date().toISOString().split("T")[0],
    });
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white dark:bg-slate-800 rounded-3xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm space-y-6 mb-8 text-slate-900 dark:text-white"
    >
      <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-700 pb-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
            Add Expense
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Record a new transaction to track against your budget.
          </p>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        {/* Title Field */}
        <div>
          <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">
            Expense Title
          </label>
          <input
            type="text"
            name="title"
            placeholder="e.g. Grocery Shopping"
            value={formData.title}
            onChange={handleChange}
            className="w-full p-3 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm transition"
            required
          />
        </div>

        {/* Amount Field */}
        <div>
          <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">
            Amount
          </label>
          <input
            type="number"
            name="amount"
            placeholder="e.g. 1500"
            value={formData.amount}
            onChange={handleChange}
            className="w-full p-3 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm transition"
            required
          />
        </div>

        {/* Category Field */}
        <div>
          <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">
            Category
          </label>
          <select
            name="category"
            value={formData.category}
            onChange={handleChange}
            className="w-full p-3 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm transition"
          >
            <option value="Food">Food</option>
            <option value="Travel">Travel</option>
            <option value="Shopping">Shopping</option>
            <option value="Education">Education</option>
            <option value="Entertainment">Entertainment</option>
            <option value="Healthcare">Healthcare</option>
            <option value="Bills">Bills</option>
            <option value="Miscellaneous">Miscellaneous</option>
          </select>
        </div>

        {/* Payment Method Field */}
        <div>
          <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">
            Payment Method
          </label>
          <select
            name="payment_method"
            value={formData.payment_method}
            onChange={handleChange}
            className="w-full p-3 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm transition"
          >
            <option value="Cash">Cash</option>
            <option value="UPI">UPI</option>
            <option value="Card">Card</option>
            <option value="Net Banking">Net Banking</option>
            <option value="Wallet">Wallet</option>
          </select>
        </div>

        {/* Expense Date Field */}
        <div className="md:col-span-2">
          <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">
            Expense Date
          </label>
          <input
            type="date"
            name="expense_date"
            value={formData.expense_date}
            onChange={handleChange}
            className="w-full p-3 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm transition"
            required
          />
        </div>
      </div>

      {/* Description Field */}
      <div>
        <label className="block text-xs font-semibold text-slate-500 dark:text-slate-400 mb-1">
          Description (Optional)
        </label>
        <textarea
          name="description"
          placeholder="Add details about this expense..."
          value={formData.description}
          onChange={handleChange}
          className="w-full p-3 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm transition"
          rows="3"
        />
      </div>

      {/* Submit Button */}
      <div className="flex justify-end pt-2">
        <button
          type="submit"
          className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-semibold transition text-sm shadow-md"
        >
          <FaPlus />
          Add Expense
        </button>
      </div>
    </form>
  );
}