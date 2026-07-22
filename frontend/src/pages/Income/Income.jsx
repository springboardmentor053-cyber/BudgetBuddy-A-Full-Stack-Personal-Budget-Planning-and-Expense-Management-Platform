import { useEffect, useMemo, useState } from "react";
import {
  FaPlus,
  FaSearch,
  FaEdit,
  FaTrash,
} from "react-icons/fa";

import IncomeModal from "../../components/forms/IncomeModal";

import {
  getIncome,
  addIncome,
  deleteIncome,
  updateIncome,
} from "../../api/incomeApi";

export default function Income() {
  const [income, setIncome] = useState([]);
  const [loading, setLoading] = useState(true);

  const [openModal, setOpenModal] = useState(false);

  const [search, setSearch] = useState("");
const [source, setSource] = useState("All Sources");
const [editingIncome, setEditingIncome] = useState(null);
  useEffect(() => {
   loadIncome();
 }, []);
 

 const loadIncome = async () => {
  console.log("Loading income...");

  try {
    const response = await getIncome();
    console.log("Response:", response);
    console.log("Data:", response.data);

    setIncome(response.data);
  } catch (error) {
    console.error("Error:", error);
  } finally {
    setLoading(false);
  }
};

 const handleAddIncome = async (incomeData) => {
  try {
    if (editingIncome) {
      await updateIncome(editingIncome.id, incomeData);
      setEditingIncome(null);
    } else {
      await addIncome(incomeData);
    }

    setOpenModal(false);
    loadIncome();
  } catch (error) {
    console.error(error);
  }
};

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this income?")) return;

    try {
      await deleteIncome(id);
      loadIncome();
    } catch (error) {
      console.error(error);
    }
  };

  const handleEdit = (income) => {
    setEditingIncome(income);
    setOpenModal(true);
  };

  const filteredIncome = useMemo(() => {
    return income.filter((item) => {
      const titleMatch =
  item.title?.toLowerCase()
    .includes(search.toLowerCase());

      const sourceMatch =
        source === "All Sources" ||
        item.source === source;

      return titleMatch && sourceMatch;
    });
  }, [income, search, source]);

  const totalIncome = filteredIncome.reduce(
    (sum, item) => sum + Number(item.amount),
    0
  );

  const sourceTotals = {};

  filteredIncome.forEach((item) => {
    sourceTotals[item.source] =
      (sourceTotals[item.source] || 0) +
      Number(item.amount);
  });

  const highestSource =
    Object.keys(sourceTotals).length > 0
      ? Object.keys(sourceTotals).reduce((a, b) =>
          sourceTotals[a] > sourceTotals[b] ? a : b
        )
      : "N/A";

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex justify-center items-center text-white">
        <h1 className="text-2xl font-bold">
          Loading Income...
        </h1>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-black text-white p-8">

      <div className="flex flex-col md:flex-row justify-between items-center mb-8">

        <div>

          <h1 className="text-4xl font-bold">
            Income
          </h1>

          <p className="text-gray-400 mt-2">
            Manage and track all your income.
          </p>

        </div>

        <button
          onClick={() => {
  setEditingIncome(null);
  setOpenModal(true);
}}
          className="mt-4 md:mt-0 bg-green-500 hover:bg-green-400 text-slate-900 px-6 py-3 rounded-xl font-semibold flex items-center gap-2"
        >

          <FaPlus />

          Add Income

        </button>

      </div>

      <div className="grid md:grid-cols-2 gap-6 mb-8">

        <div className="relative">

          <FaSearch className="absolute left-4 top-4 text-gray-400" />

          <input
            type="text"
            placeholder="Search income..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-12 p-3 rounded-xl bg-slate-800 border border-slate-600"
          />

        </div>

        <select
          value={source}
          onChange={(e) => setSource(e.target.value)}
          className="bg-slate-800 border border-slate-600 rounded-xl p-3"
        >
          <option value="All Sources">All Sources</option>

  <option value="SALARY">
    Salary
  </option>

  <option value="POCKET_MONEY">
    Pocket Money
  </option>

  <option value="FREELANCING">
    Freelancing
  </option>

  <option value="SCHOLARSHIP">
    Scholarship
  </option>

  <option value="BUSINESS">
    Business
  </option>

  <option value="OTHER">
    Other
  </option>

        </select>

      </div>

      <div className="overflow-x-auto bg-slate-800 rounded-2xl shadow-lg">

        <table className="w-full">

          <thead className="bg-slate-700">

            <tr>

              <th className="p-4 text-left">Title</th>
              <th className="p-4 text-left">Source</th>
              <th className="p-4 text-left">Amount</th>
              <th className="p-4 text-left">Date</th>
              <th className="p-4 text-center">Actions</th>

            </tr>

          </thead>

          <tbody>
                        {filteredIncome.length === 0 ? (
              <tr>
                <td
                  colSpan="5"
                  className="text-center py-10 text-gray-400"
                >
                  No income records found.
                </td>
              </tr>
            ) : (
              filteredIncome.map((item) => (
                <tr
                  key={item.id}
                  className="border-b border-slate-700 hover:bg-slate-700 transition"
                >
                  <td className="p-4">
                    {item.title}
                  </td>

                  <td className="p-4">
                    <span className="bg-green-500/20 text-green-300 px-3 py-1 rounded-full text-sm">
                      {item.source}
                    </span>
                  </td>

                  <td className="p-4 text-green-400 font-semibold">
                    ₹ {Number(item.amount).toLocaleString()}
                  </td>

                  <td className="p-4">
                    {item.income_date}
                  </td>

                  <td className="p-4">
                    <div className="flex justify-center gap-4">

                      <button
                        onClick={() => handleEdit(item)}
                        className="text-cyan-400 hover:text-cyan-300"
                      >
                        <FaEdit />
                      </button>

                      <button
                        onClick={() => handleDelete(item.id)}
                        className="text-red-400 hover:text-red-300"
                      >
                        <FaTrash />
                      </button>

                    </div>
                  </td>

                </tr>
              ))
            )}

          </tbody>

        </table>

      </div>

      {/* Summary Cards */}

      <div className="grid md:grid-cols-3 gap-6 mt-10">

        <div className="bg-slate-800 rounded-2xl p-6 shadow-lg">

          <h3 className="text-gray-400">
            Total Income
          </h3>

          <h2 className="text-3xl font-bold text-green-400 mt-2">
            ₹ {totalIncome.toLocaleString()}
          </h2>

        </div>

        <div className="bg-slate-800 rounded-2xl p-6 shadow-lg">

          <h3 className="text-gray-400">
            Highest Source
          </h3>

          <h2 className="text-3xl font-bold mt-2">
            {highestSource}
          </h2>

        </div>

        <div className="bg-slate-800 rounded-2xl p-6 shadow-lg">

          <h3 className="text-gray-400">
            Transactions
          </h3>

          <h2 className="text-3xl font-bold mt-2">
            {filteredIncome.length}
          </h2>

        </div>

      </div>

      {/* Income Modal */}

     <IncomeModal
  isOpen={openModal}
  onClose={() => {
    setOpenModal(false);
    setEditingIncome(null);
  }}
  onSave={handleAddIncome}
  income={editingIncome}
/>

    </div>
  );
}