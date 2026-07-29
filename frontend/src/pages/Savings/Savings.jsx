import { useEffect, useMemo, useState } from "react";
import {
  FaPlus,
  FaPiggyBank,
  FaEdit,
  FaTrash,
  FaSearch,
  FaBullseye,
  FaCheckCircle,
  FaClock,
} from "react-icons/fa";

import SavingsModal from "../../components/forms/SavingsModal";

import {
  getSavings,
  addSavings,
  updateSavings,
  deleteSavings,
} from "../../api/savingsApi";
import { useSettings } from "../../context/SettingsContext"; // Dynamic currency context

export default function Savings() {
  // Extract dynamic money formatting function
  const { formatMoney } = useSettings();

  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openModal, setOpenModal] = useState(false);
  const [editingGoal, setEditingGoal] = useState(null);
  const [search, setSearch] = useState("");

  useEffect(() => {
    loadGoals();
  }, []);

  const loadGoals = async () => {
    try {
      const response = await getSavings();
      setGoals(response.data || []);
    } catch (error) {
      console.error("Error loading savings goals:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveGoal = async (goalData) => {
    try {
      if (editingGoal) {
        await updateSavings(editingGoal.id, goalData);
        setEditingGoal(null);
      } else {
        await addSavings(goalData);
      }
      setOpenModal(false);
      loadGoals();
    } catch (error) {
      console.error("Error saving goal:", error);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this goal?")) return;

    try {
      await deleteSavings(id);
      loadGoals();
    } catch (error) {
      console.error("Error deleting goal:", error);
    }
  };

  const handleEdit = (goal) => {
    setEditingGoal(goal);
    setOpenModal(true);
  };

  const filteredGoals = useMemo(() => {
    return goals.filter((goal) =>
      goal.goal_name?.toLowerCase().includes(search.toLowerCase())
    );
  }, [goals, search]);

  const totalSaved = filteredGoals.reduce(
    (sum, goal) => sum + Number(goal.saved_amount || 0),
    0
  );

  const overallTarget = filteredGoals.reduce(
    (sum, goal) => sum + Number(goal.target_amount || 0),
    0
  );

  const activeGoals = filteredGoals.filter(
    (goal) => goal.status === "ACTIVE"
  ).length;

  if (loading) {
    return (
      <div className="space-y-8 animate-pulse">
        <div className="h-10 bg-slate-200 dark:bg-slate-700 rounded-xl w-1/4"></div>
        <div className="grid md:grid-cols-3 gap-6">
          <div className="h-32 bg-slate-200 dark:bg-slate-700 rounded-3xl"></div>
          <div className="h-32 bg-slate-200 dark:bg-slate-700 rounded-3xl"></div>
          <div className="h-32 bg-slate-200 dark:bg-slate-700 rounded-3xl"></div>
        </div>
        <div className="grid lg:grid-cols-2 gap-6">
          <div className="h-64 bg-slate-200 dark:bg-slate-700 rounded-3xl"></div>
          <div className="h-64 bg-slate-200 dark:bg-slate-700 rounded-3xl"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 text-slate-900 dark:text-white">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
        <div>
           <h1 className="text-4xl font-bold text-white">
            Savings Goals
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-2">
            Keep track of your targets and reach your financial milestones.
          </p>
        </div>

        <button
          onClick={() => {
            setEditingGoal(null);
            setOpenModal(true);
          }}
          className="flex items-center gap-2 rounded-2xl bg-blue-600 hover:bg-blue-700 px-6 py-3 text-white font-semibold shadow-md transition self-start lg:self-auto"
        >
          <FaPlus />
          Add Goal
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
              Total Saved
            </p>
            <h2 className="text-3xl font-bold text-green-600 dark:text-green-400 mt-2">
              {formatMoney(totalSaved)}
            </h2>
          </div>
          <div className="p-4 rounded-2xl bg-green-50 dark:bg-green-950/40 text-green-500">
            <FaPiggyBank className="text-2xl" />
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
              Active Goals
            </p>
            <h2 className="text-3xl font-bold text-slate-900 dark:text-white mt-2">
              {activeGoals}
            </h2>
          </div>
          <div className="p-4 rounded-2xl bg-blue-50 dark:bg-blue-950/40 text-blue-500">
            <FaBullseye className="text-2xl" />
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-slate-500 dark:text-slate-400">
              Overall Target
            </p>
            <h2 className="text-3xl font-bold text-slate-900 dark:text-white mt-2">
              {formatMoney(overallTarget)}
            </h2>
          </div>
          <div className="p-4 rounded-2xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-500">
            <FaBullseye className="text-2xl" />
          </div>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
        <input
          type="text"
          placeholder="Search savings goals..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-11 pr-4 py-3 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 transition shadow-sm"
        />
      </div>

      {/* Goal Cards Grid */}
      <div className="grid lg:grid-cols-2 gap-6">
        {filteredGoals.length === 0 ? (
          <div className="col-span-2 bg-white dark:bg-slate-800 rounded-3xl p-12 border border-slate-200 dark:border-slate-700 text-center text-slate-500 dark:text-slate-400 flex flex-col items-center justify-center gap-3">
            <FaPiggyBank className="text-5xl text-slate-300 dark:text-slate-600" />
            <p className="text-lg font-semibold">No Savings Goals Found</p>
            <p className="text-xs">
              {search
                ? "Try adjusting your search criteria."
                : "Create your first goal to start tracking progress!"}
            </p>
          </div>
        ) : (
          filteredGoals.map((goal) => {
            const saved = Number(goal.saved_amount || 0);
            const target = Number(goal.target_amount || 0);
            const progress = target > 0 ? (saved / target) * 100 : 0;
            const remaining = Math.max(0, target - saved);

            // Days left calculation
            const targetDate = new Date(goal.target_date);
            const today = new Date();
            const diffTime = targetDate - today;
            const daysLeft = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

            return (
              <div
                key={goal.id}
                className="bg-white dark:bg-slate-800 rounded-3xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm space-y-5 flex flex-col justify-between"
              >
                {/* Card Top Header */}
                <div className="space-y-3">
                  <div className="flex justify-between items-start gap-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                          {goal.goal_name}
                        </h2>
                        {progress >= 100 && (
                          <span className="flex items-center gap-1 text-xs font-semibold bg-green-100 dark:bg-green-950/50 text-green-600 dark:text-green-400 px-2.5 py-0.5 rounded-full">
                            <FaCheckCircle className="text-xs" /> Completed
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-2 mt-1">
                        <span
                          className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                            goal.status === "ACTIVE"
                              ? "bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400"
                              : "bg-slate-100 dark:bg-slate-700 text-slate-500 dark:text-slate-400"
                          }`}
                        >
                          {goal.status}
                        </span>

                        {goal.target_date && (
                          <span className="flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400">
                            <FaClock className="text-xs" />
                            {daysLeft > 0
                              ? `${daysLeft} days left`
                              : daysLeft === 0
                              ? "Due today"
                              : "Passed deadline"}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => handleEdit(goal)}
                        className="p-2 text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition"
                        title="Edit Goal"
                      >
                        <FaEdit size={16} />
                      </button>

                      <button
                        onClick={() => handleDelete(goal.id)}
                        className="p-2 text-slate-400 hover:text-red-600 dark:hover:text-red-400 transition"
                        title="Delete Goal"
                      >
                        <FaTrash size={16} />
                      </button>
                    </div>
                  </div>

                  {/* Progress Bar Area */}
                  <div className="space-y-1.5 pt-2">
                    <div className="flex justify-between items-baseline text-xs font-semibold">
                      <span className="text-slate-500 dark:text-slate-400">
                        Progress
                      </span>
                      <span className="text-blue-600 dark:text-blue-400">
                        {progress.toFixed(1)}%
                      </span>
                    </div>

                    <div className="w-full bg-slate-100 dark:bg-slate-700 rounded-full h-3 overflow-hidden">
                      <div
                        className={`h-3 rounded-full transition-all duration-500 ${
                          progress >= 100
                            ? "bg-green-500"
                            : progress >= 50
                            ? "bg-gradient-to-r from-blue-500 to-cyan-400"
                            : "bg-gradient-to-r from-amber-500 to-yellow-400"
                        }`}
                        style={{
                          width: `${Math.min(progress, 100)}%`,
                        }}
                      />
                    </div>
                  </div>
                </div>

                {/* Card Details Grid */}
                <div className="grid grid-cols-3 gap-2 p-3.5 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-slate-100 dark:border-slate-700/50 text-center text-xs">
                  <div>
                    <p className="text-slate-400 font-medium mb-0.5">Saved</p>
                    <p className="font-bold text-green-600 dark:text-green-400">
                      {formatMoney(saved)}
                    </p>
                  </div>

                  <div>
                    <p className="text-slate-400 font-medium mb-0.5">Target</p>
                    <p className="font-bold text-slate-900 dark:text-white">
                      {formatMoney(target)}
                    </p>
                  </div>

                  <div>
                    <p className="text-slate-400 font-medium mb-0.5">Remaining</p>
                    <p className="font-bold text-amber-600 dark:text-amber-400">
                      {formatMoney(remaining)}
                    </p>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Savings Modal */}
      <SavingsModal
        isOpen={openModal}
        onClose={() => {
          setOpenModal(false);
          setEditingGoal(null);
        }}
        onSave={handleSaveGoal}
        goal={editingGoal}
      />
    </div>
  );
}