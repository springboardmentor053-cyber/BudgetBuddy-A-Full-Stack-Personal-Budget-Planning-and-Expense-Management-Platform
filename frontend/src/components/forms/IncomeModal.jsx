import { useState, useEffect } from "react";

export default function IncomeModal({
  isOpen,
  onClose,
  onSave,
  income
}) {
  const [formData, setFormData] = useState({
    title: "",
    amount: "",
    source: "SALARY",
    description: "",
    income_date: "",
  });

 useEffect(() => {
  if (income) {
    setFormData({
      title: income.title || "",
      amount: income.amount || "",
      source: income.source || "SALARY",
      description: income.description || "",
      income_date: income.income_date || "",
    });
  } else {
    setFormData({
      title: "",
      amount: "",
      source: "SALARY",
      description: "",
      income_date: "",
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
      income_date: "",
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex justify-center items-center z-50">

      <div className="bg-slate-800 rounded-2xl p-8 w-full max-w-lg">

        <h2 className="text-2xl font-bold mb-6">
         {income ? "Edit Income" : "Add Income"}
        </h2>

        <form onSubmit={handleSubmit}>

          <input
            type="text"
            name="title"
            placeholder="Income Title"
            value={formData.title}
            onChange={handleChange}
            className="w-full p-3 rounded-lg bg-slate-700 mb-4"
            required
          />

          <input
            type="number"
            name="amount"
            placeholder="Amount"
            value={formData.amount}
            onChange={handleChange}
            className="w-full p-3 rounded-lg bg-slate-700 mb-4"
            required
          />

          <select
  name="source"
  value={formData.source}
  onChange={handleChange}
  className="w-full p-3 rounded-lg bg-slate-700 mb-4"
>
  <option value="SALARY">Salary</option>
  <option value="POCKET_MONEY">Pocket Money</option>
  <option value="FREELANCING">Freelancing</option>
  <option value="SCHOLARSHIP">Scholarship</option>
  <option value="BUSINESS">Business</option>
  <option value="OTHER">Other</option>
</select>

          <textarea
            name="description"
            placeholder="Description"
            value={formData.description}
            onChange={handleChange}
            className="w-full p-3 rounded-lg bg-slate-700 mb-4"
          />

          <input
            type="date"
            name="income_date"
            value={formData.income_date}
            onChange={handleChange}
            className="w-full p-3 rounded-lg bg-slate-700 mb-6"
            required
          />

          <div className="flex justify-end gap-4">

            <button
              type="button"
              onClick={onClose}
              className="bg-gray-600 px-5 py-2 rounded-lg hover:bg-gray-500"
            >
              Cancel
            </button>

            <button
              type="submit"
              className="bg-green-500 hover:bg-green-400 text-slate-900 px-5 py-2 rounded-lg font-semibold"
            >
              {income ? "Update Income" : "Save Income"}
            </button>

          </div>

        </form>

      </div>

    </div>
  );
}