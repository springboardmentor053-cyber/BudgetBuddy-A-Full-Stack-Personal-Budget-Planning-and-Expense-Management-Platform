import { useEffect, useState } from "react";
import {
  FaUserCircle,
  FaEnvelope,
  FaPhone,
  FaMapMarkerAlt,
  FaBriefcase,
  FaWallet,
  FaEdit,
  FaPiggyBank,
  FaBullseye,
} from "react-icons/fa";

import ProfileModal from "../../components/forms/ProfileModal";
import { getProfile, updateProfile } from "../../api/profileApi";
import { getDashboard } from "../../api/dashboardApi";
import { getBudgets } from "../../api/budgetApi";
import { getSavings } from "../../api/savingsApi";
import { useSettings } from "../../context/SettingsContext";

export default function Profile() {
  const { formatMoney } = useSettings();

  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [profileData, setProfileData] = useState({
    name: "",
    email: "",
    phone: "",
    location: "",
    profession: "",
    accountType: "BudgetBuddy User",
    financials: {
      monthlyIncome: 0,
      monthlyExpenses: 0,
      totalSavings: 0,
      currentBalance: 0,
    },
    stats: {
      totalTransactions: 0,
      budgetsCreated: 0,
      savingsGoals: 0,
    },
  });

  useEffect(() => {
    loadProfileData();
  }, []);

  const loadProfileData = async () => {
    try {
      setLoading(true);

      // Fetch profile, dashboard, budgets and savings concurrently
      const [userRes, dashboardRes, budgetRes, savingsRes] =
        await Promise.all([
          getProfile().catch(() => ({ data: {} })),
          getDashboard().catch(() => ({ data: {} })),
          getBudgets().catch(() => ({ data: [] })),
          getSavings().catch(() => ({ data: [] })),
        ]);

      const userData = userRes.data || {};
      const dash = dashboardRes.data || dashboardRes || {};
      const summary = dash.financial_summary || {};

      // --------------------------------
      // Budget list
      // --------------------------------
      const budgetData = budgetRes.data || [];
      const budgetList = Array.isArray(budgetData)
        ? budgetData
        : budgetData.results || [];

      // --------------------------------
      // Savings list
      // --------------------------------
      const savingsData = savingsRes.data || [];
      const savingsList = Array.isArray(savingsData)
        ? savingsData
        : savingsData.results || [];

      // --------------------------------
      // Local storage fallback
      // --------------------------------
      const storedUser = JSON.parse(
        localStorage.getItem("user") || "{}"
      );

      // --------------------------------
      // Transactions
      // --------------------------------
      const incomeList =
        dash.recent_income ||
        dash.income ||
        [];

      const expenseList =
        dash.recent_expenses ||
        dash.expenses ||
        [];

      // --------------------------------
      // Financial metrics
      // --------------------------------
      const monthlyIncome = Number(
        summary.total_income ??
          dash.income ??
          0
      );

      const monthlyExpenses = Number(
        summary.total_expense ??
          dash.expenses ??
          0
      );

      const currentBalance = Number(
        summary.current_balance ??
          dash.balance ??
          (monthlyIncome - monthlyExpenses)
      );

      const totalSavings = Number(
        summary.total_savings ??
          dash.savings ??
          0
      );

      // --------------------------------
      // Transaction count
      // --------------------------------
      const totalTransactions = Number(
        dash.total_transactions ??
          dash.transactions_count ??
          (incomeList.length + expenseList.length)
      );

      // --------------------------------
      // ACTUAL budget & savings counts
      // --------------------------------
      const budgetsCreated = budgetList.length;
      const savingsGoals = savingsList.length;

      // --------------------------------
      // Set profile data
      // --------------------------------
      setProfileData({
        name:
          userData.name ||
          userData.username ||
          storedUser.name ||
          storedUser.username ||
          "User",

        email:
          userData.email ||
          storedUser.email ||
          "",

        phone:
          userData.phone ||
          storedUser.phone ||
          "",

        location:
          userData.location ||
          storedUser.location ||
          "",

        profession:
          userData.profession ||
          storedUser.profession ||
          "",

        accountType:
          userData.account_type ||
          "BudgetBuddy User",

        financials: {
          monthlyIncome,
          monthlyExpenses,
          totalSavings,
          currentBalance,
        },

        stats: {
          totalTransactions,
          budgetsCreated,
          savingsGoals,
        },
      });

    } catch (error) {
      console.error(
        "Failed to load profile data:",
        error
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProfile = async (formData) => {
    try {
      await updateProfile(formData);

      setProfileData((prev) => ({
        ...prev,
        ...formData,
        financials: {
          ...prev.financials,
          monthlyIncome:
            formData.financials?.monthlyIncome ??
            prev.financials.monthlyIncome,
        },
      }));

      // Keep localStorage in sync so sidebar updates dynamically
      const currentUser = JSON.parse(localStorage.getItem("user") || "{}");
      localStorage.setItem(
        "user",
        JSON.stringify({ ...currentUser, ...formData })
      );
      window.dispatchEvent(new Event("userUpdated"));

      setIsModalOpen(false);
    } catch (error) {
      console.error("Failed to update profile:", error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex justify-center items-center bg-slate-900 text-white">
        <h1 className="text-2xl font-bold animate-pulse">
          Loading Profile...
        </h1>
      </div>
    );
  }

  return (
    <div className="space-y-8 min-h-screen text-slate-900 dark:text-white">
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
        <div>
          <h1 className="text-4xl font-bold text-white">My Profile</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-2">
            Manage your personal details and view account summary.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center justify-center gap-2 rounded-2xl bg-blue-600 hover:bg-blue-700 px-6 py-3 text-white font-semibold shadow-md transition"
        >
          <FaEdit />
          <span>Edit Profile</span>
        </button>
      </div>

      {/* User Banner */}
      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-3xl p-8 shadow-sm">
        <div className="flex flex-col md:flex-row items-center gap-8">
          <div className="p-4 rounded-full bg-blue-500/10 text-blue-500 dark:text-blue-400">
            <FaUserCircle className="text-8xl" />
          </div>

          <div className="text-center md:text-left">
            <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white">
              {profileData.name}
            </h2>
            <p className="text-slate-500 dark:text-slate-400 mt-1 font-medium">
              {profileData.accountType}
            </p>
          </div>
        </div>
      </div>

      {/* Details Grid */}
      <div className="grid lg:grid-cols-2 gap-8">
        {/* Personal Details */}
        <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm">
          <h2 className="text-2xl font-bold mb-6 text-slate-900 dark:text-white">
            Personal Details
          </h2>

          <div className="space-y-5">
            <div className="flex items-center gap-4 text-slate-700 dark:text-slate-300">
              <div className="p-3 rounded-xl bg-blue-500/10 text-blue-500">
                <FaEnvelope />
              </div>
              <span className="font-medium">{profileData.email || "Not Provided"}</span>
            </div>

            <div className="flex items-center gap-4 text-slate-700 dark:text-slate-300">
              <div className="p-3 rounded-xl bg-blue-500/10 text-blue-500">
                <FaPhone />
              </div>
              <span className="font-medium">{profileData.phone || "Not Provided"}</span>
            </div>

            <div className="flex items-center gap-4 text-slate-700 dark:text-slate-300">
              <div className="p-3 rounded-xl bg-blue-500/10 text-blue-500">
                <FaMapMarkerAlt />
              </div>
              <span className="font-medium">{profileData.location || "Not Provided"}</span>
            </div>

            <div className="flex items-center gap-4 text-slate-700 dark:text-slate-300">
              <div className="p-3 rounded-xl bg-blue-500/10 text-blue-500">
                <FaBriefcase />
              </div>
              <span className="font-medium">{profileData.profession || "Not Provided"}</span>
            </div>
          </div>
        </div>

        {/* Financial Details */}
        <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 border border-slate-200 dark:border-slate-700 shadow-sm">
          <h2 className="text-2xl font-bold mb-6 text-slate-900 dark:text-white">
            Financial Details
          </h2>

          <div className="space-y-6">
            <div className="flex justify-between items-center text-sm font-medium">
              <span className="text-slate-500 dark:text-slate-400">
                Monthly Income
              </span>
              <span className="text-green-500 dark:text-green-400 font-extrabold text-lg">
                {formatMoney
                  ? formatMoney(profileData.financials.monthlyIncome)
                  : `₹${profileData.financials.monthlyIncome.toLocaleString(
                      "en-IN"
                    )}`}
              </span>
            </div>

            <div className="flex justify-between items-center text-sm font-medium">
              <span className="text-slate-500 dark:text-slate-400">
                Monthly Expenses
              </span>
              <span className="text-red-500 dark:text-red-400 font-extrabold text-lg">
                {formatMoney
                  ? formatMoney(profileData.financials.monthlyExpenses)
                  : `₹${profileData.financials.monthlyExpenses.toLocaleString(
                      "en-IN"
                    )}`}
              </span>
            </div>

            <div className="flex justify-between items-center text-sm font-medium">
              <span className="text-slate-500 dark:text-slate-400">
                Total Savings
              </span>
              <span className="text-amber-500 dark:text-amber-400 font-extrabold text-lg">
                {formatMoney
                  ? formatMoney(profileData.financials.totalSavings)
                  : `₹${profileData.financials.totalSavings.toLocaleString(
                      "en-IN"
                    )}`}
              </span>
            </div>

            <div className="flex justify-between items-center text-sm font-medium">
              <span className="text-slate-500 dark:text-slate-400">
                Current Balance
              </span>
              <span className="text-cyan-500 dark:text-cyan-400 font-extrabold text-lg">
                {formatMoney
                  ? formatMoney(profileData.financials.currentBalance)
                  : `₹${profileData.financials.currentBalance.toLocaleString(
                      "en-IN"
                    )}`}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Summary Stats Cards */}
      <div className="grid md:grid-cols-3 gap-6">
        <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 text-center border border-slate-200 dark:border-slate-700 shadow-sm">
          <div className="p-4 rounded-2xl bg-cyan-500/10 text-cyan-500 w-fit mx-auto mb-4">
            <FaWallet className="text-3xl" />
          </div>
          <h3 className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            Total Transactions
          </h3>
          <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white mt-2">
            {profileData.stats.totalTransactions}
          </h2>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 text-center border border-slate-200 dark:border-slate-700 shadow-sm">
          <div className="p-4 rounded-2xl bg-purple-500/10 text-purple-500 w-fit mx-auto mb-4">
            <FaPiggyBank className="text-3xl" />
          </div>
          <h3 className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            Budgets Created
          </h3>
          <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white mt-2">
            {profileData.stats.budgetsCreated}
          </h2>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 text-center border border-slate-200 dark:border-slate-700 shadow-sm">
          <div className="p-4 rounded-2xl bg-green-500/10 text-green-500 w-fit mx-auto mb-4">
            <FaBullseye className="text-3xl" />
          </div>
          <h3 className="text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            Savings Goals
          </h3>
          <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white mt-2">
            {profileData.stats.savingsGoals}
          </h2>
        </div>
      </div>

      {/* Profile Modal */}
      <ProfileModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSaveProfile}
        profile={profileData}
      />
    </div>
  );
}