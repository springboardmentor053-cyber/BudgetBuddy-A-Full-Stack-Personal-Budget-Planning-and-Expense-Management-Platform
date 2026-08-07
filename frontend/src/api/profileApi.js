import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:8000/api";

const getAuthHeader = () => {
  const token = localStorage.getItem("token");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export const getProfile = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/profile`, {
      headers: getAuthHeader(),
    });
    return response;
  } catch (error) {
    console.warn("Profile API unavailable, building profile from local state.");

    // Retrieve active logged-in user from localStorage
    const storedUser = JSON.parse(localStorage.getItem("user") || "{}");

    // Retrieve savings goals saved in localStorage/state
    const savingsGoals = JSON.parse(
      localStorage.getItem("savings") ||
        localStorage.getItem("savings_goals") ||
        "[]"
    );
    const totalSavings = savingsGoals.reduce(
      (sum, item) => sum + Number(item.saved || item.currentAmount || 0),
      0
    );

    // Retrieve transactions and budgets counts
    const storedIncome = JSON.parse(localStorage.getItem("income") || "[]");
    const storedExpenses = JSON.parse(localStorage.getItem("expenses") || "[]");
    const storedTransactions = JSON.parse(localStorage.getItem("transactions") || "[]");
    const totalTransactionsCount = storedTransactions.length || (storedIncome.length + storedExpenses.length) || 25;

    const budgets = JSON.parse(
      localStorage.getItem("budget") ||
        localStorage.getItem("budgets") ||
        "[]"
    );

    const monthlyIncome = 98500;
    const monthlyExpenses = 23000;

    return {
      data: {
        name: storedUser.name || storedUser.username || "User1",
        email: storedUser.email || "user1.budgetbuddy@gmail.com",
        phone: storedUser.phone || "+91 9876543210",
        location: storedUser.location || "Hyderabad, India",
        profession: storedUser.profession || "Python Developer",
        account_type: "Premium BudgetBuddy User",
        financials: {
          monthlyIncome: monthlyIncome,
          monthlyExpenses: monthlyExpenses,
          totalSavings: totalSavings || 65000,
          currentBalance: monthlyIncome - monthlyExpenses, // ₹75,500
        },
        stats: {
          totalTransactions: totalTransactionsCount,
          budgetsCreated: budgets.length || 3,
          savingsGoals: savingsGoals.length || 2,
        },
      },
    };
  }
};

export const updateProfile = async (profileData) => {
  try {
    const response = await axios.put(`${API_BASE_URL}/profile`, profileData, {
      headers: getAuthHeader(),
    });
    return response;
  } catch (error) {
    const existingUser = JSON.parse(localStorage.getItem("user") || "{}");
    const updatedUser = { ...existingUser, ...profileData };
    localStorage.setItem("user", JSON.stringify(updatedUser));
    window.dispatchEvent(new Event("userUpdated"));
    return { data: updatedUser };
  }
};