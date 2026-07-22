import { useState } from "react";

export default function ExpenseForm({ onSubmit }) {
  const [formData, setFormData] = useState({
    title: "",
    amount: "",
    category: "Food",
    description: "",
    expense_date: "",
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
      description: "",
      expense_date: "",
    });
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-slate-800 rounded-xl p-6 shadow-lg mb-8"
    >
      <h2 className="text-2xl font-bold mb-6">
        Add Expense
      </h2>

      <div className="grid md:grid-cols-2 gap-4">

        <input
          type="text"
          name="title"
          placeholder="Expense Title"
          value={formData.title}
          onChange={handleChange}
          className="bg-slate-700 p-3 rounded-lg"
          required
        />

        <input
          type="number"
          name="amount"
          placeholder="Amount"
          value={formData.amount}
          onChange={handleChange}
          className="bg-slate-700 p-3 rounded-lg"
          required
        />

        <select
          name="category"
          value={formData.category}
          onChange={handleChange}
          className="bg-slate-700 p-3 rounded-lg"
        >
          <option>Food</option>
          <option>Travel</option>
          <option>Shopping</option>
          <option>Education</option>
          <option>Entertainment</option>
          <option>Healthcare</option>
          <option>Bills</option>
          <option>Miscellaneous</option>
        </select>

        <input
          type="date"
          name="expense_date"
          value={formData.expense_date}
          onChange={handleChange}
          className="bg-slate-700 p-3 rounded-lg"
          required
        />

      </div>

      <textarea
        name="description"
        placeholder="Description"
        value={formData.description}
        onChange={handleChange}
        className="bg-slate-700 p-3 rounded-lg w-full mt-4"
        rows="3"
      />

      <button
        type="submit"
        className="mt-6 bg-cyan-500 hover:bg-cyan-400 text-slate-900 px-6 py-3 rounded-xl font-semibold"
      >
        Add Expense
      </button>
    </form>
  );
}