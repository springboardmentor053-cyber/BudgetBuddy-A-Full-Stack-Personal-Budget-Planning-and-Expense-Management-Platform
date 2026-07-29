import { useEffect, useMemo, useState } from "react";
import {
  FaPlus,
  FaSearch,
  FaEdit,
  FaTrash,
  FaWallet,
  FaChartLine,
  FaExchangeAlt,
} from "react-icons/fa";
import IncomeModal from "../../components/forms/IncomeModal";
import {
  getIncome,
  addIncome,
  deleteIncome,
  updateIncome,
} from "../../api/incomeApi";
import { useSettings } from "../../context/SettingsContext"; // Dynamic currency context

export default function Income() {
  // Extract global formatMoney helper
  const { formatMoney } = useSettings();

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
    try {
      const response = await getIncome();
      setIncome(response.data || []);
    } catch (error) {
      console.error("Error loading income:", error);
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
      console.error("Error saving income:", error);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this income record?")) return;
    try {
      await deleteIncome(id);
      loadIncome();
    } catch (error) {
      console.error("Error deleting income:", error);
    }
  };

  const handleEdit = (item) => {
    setEditingIncome(item);
    setOpenModal(true);
  };

  const filteredIncome = useMemo(() => {
    return income.filter((item) => {
      const titleMatch = item.title?.toLowerCase().includes(search.toLowerCase());
      const sourceMatch = source === "All Sources" || item.source === source;
      return titleMatch && sourceMatch;
    });
  }, [income, search, source]);

  const totalIncome = filteredIncome.reduce(
    (sum, item) => sum + Number(item.amount || 0),
    0
  );

  const sourceTotals = {};
  filteredIncome.forEach((item) => {
    sourceTotals[item.source] = (sourceTotals[item.source] || 0) + Number(item.amount || 0);
  });

  const totalSources = new Set(filteredIncome.map((item) => item.source)).size;

  if (loading) {
    return (
      <div className="min-h-screen flex justify-center items-center bg-slate-900 text-white">
        <h1 className="text-2xl font-bold animate-pulse">Loading Income...</h1>
      </div>
    );
  }

  return (
    <div className="space-y-8 text-slate-900 dark:text-white">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
        <div>
           <h1 className="text-4xl font-bold text-white">
            Income Management
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-2">
            Manage and monitor all your income sources.
          </p>
        </div>
        <button
          onClick={() => {
            setEditingIncome(null);
            setOpenModal(true);
          }}
          className="flex items-center gap-2 rounded-2xl bg-blue-600 hover:bg-blue-700 px-6 py-3 text-white font-semibold shadow-md transition self-start lg:self-auto"
        >
          <FaPlus />
          Add Income
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid xl:grid-cols-3 md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Total Income</p>
            {/* Dynamic Total Income Display */}
            <h2 className="text-3xl font-bold text-green-600 dark:text-green-400 mt-2">
              {formatMoney(totalIncome)}
            </h2>
          </div>
          <div className="p-4 rounded-2xl bg-green-50 dark:bg-green-950/40 text-green-500">
            <FaWallet className="text-2xl" />
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Income Sources</p>
            <h2 className="text-3xl font-bold text-slate-900 dark:text-white mt-2">
              {totalSources}
            </h2>
          </div>
          <div className="p-4 rounded-2xl bg-cyan-50 dark:bg-cyan-950/40 text-cyan-500">
            <FaChartLine className="text-2xl" />
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Transactions</p>
            <h2 className="text-3xl font-bold text-slate-900 dark:text-white mt-2">
              {filteredIncome.length}
            </h2>
          </div>
          <div className="p-4 rounded-2xl bg-yellow-50 dark:bg-yellow-950/40 text-yellow-500">
            <FaExchangeAlt className="text-2xl" />
          </div>
        </div>
      </div>

      {/* Search & Filters */}
      <div className="grid md:grid-cols-2 gap-6 bg-white dark:bg-slate-800 p-5 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm">
        <div className="relative">
          <FaSearch className="absolute left-4 top-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search income..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-12 p-3 rounded-2xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <select
          value={source}
          onChange={(e) => setSource(e.target.value)}
          className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-2xl p-3 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="All Sources">All Sources</option>
          <option value="SALARY">Salary</option>
          <option value="POCKET_MONEY">Pocket Money</option>
          <option value="FREELANCING">Freelancing</option>
          <option value="SCHOLARSHIP">Scholarship</option>
          <option value="BUSINESS">Business</option>
          <option value="OTHER">Other</option>
        </select>
      </div>

      {/* Income Table */}
      <div className="bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-50 dark:bg-slate-900/50 uppercase text-xs font-semibold text-slate-500 dark:text-slate-400 border-b border-slate-200 dark:border-slate-700">
              <tr>
                <th className="p-4 pl-6">Title</th>
                <th className="p-4">Source</th>
                <th className="p-4">Amount</th>
                <th className="p-4">Date</th>
                <th className="p-4 pr-6 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700/50 text-slate-800 dark:text-slate-200 text-sm">
              {filteredIncome.length === 0 ? (
                <tr>
                  <td colSpan="5" className="py-12 text-center text-slate-500 dark:text-slate-400">
                    <p className="text-base font-semibold">No Income Found</p>
                    <p className="text-xs mt-1">Start adding your income sources.</p>
                  </td>
                </tr>
              ) : (
                filteredIncome.map((item) => (
                  <tr
                    key={item.id}
                    className="hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors"
                  >
                    <td className="p-4 pl-6 font-medium text-slate-900 dark:text-white">
                      {item.title}
                    </td>
                    <td className="p-4">
                      <span className="bg-green-100 dark:bg-green-950/60 text-green-700 dark:text-green-300 px-3 py-1 rounded-full text-xs font-semibold">
                        {item.source}
                      </span>
                    </td>

                    {/* Dynamic Row Item Currency Formatting */}
                    <td className="p-4 font-bold text-green-600 dark:text-green-400">
                      {formatMoney(item.amount)}
                    </td>

                    <td className="p-4 text-slate-500 dark:text-slate-400">
                      {item.income_date}
                    </td>
                    <td className="p-4 pr-6">
                      <div className="flex justify-center gap-3">
                        <button
                          onClick={() => handleEdit(item)}
                          className="p-2 text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition"
                          title="Edit"
                        >
                          <FaEdit />
                        </button>
                        <button
                          onClick={() => handleDelete(item.id)}
                          className="p-2 text-slate-400 hover:text-red-600 dark:hover:text-red-400 transition"
                          title="Delete"
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