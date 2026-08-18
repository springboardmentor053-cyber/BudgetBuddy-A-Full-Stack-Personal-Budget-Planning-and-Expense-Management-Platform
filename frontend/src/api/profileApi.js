import axios from "axios";

const API_BASE_URL =
  import.meta.env.VITE_API_URL ||
  "https://budgetbuddy-backend-h7j9.onrender.com/api/";

const getAuthHeader = () => {
  const token =
    localStorage.getItem("access") ||
    localStorage.getItem("access_token") ||
    localStorage.getItem("token");

  return token ? { Authorization: `Bearer ${token}` } : {};
};

export const getProfile = async () => {
  try {
    const response = await axios.get(`${API_BASE_URL}/users/profiles/`, {
      headers: getAuthHeader(),
    });

    const profiles = Array.isArray(response.data) ? response.data : [response.data];
    const currentProfile = profiles[0] || {};

    return {
  data: {
    id: currentProfile.id,
    name: currentProfile.username || "User",
    email: currentProfile.email || "",
    phone: currentProfile.phone || "",
    location: currentProfile.location || "",
    profession: currentProfile.profession || "",
    account_type: "BudgetBuddy User",

    total_transactions: Number(
      currentProfile.total_transactions || 0
    ),

    budgets_count: Number(
      currentProfile.budgets_count || 0
    ),

    savings_goals_count: Number(
      currentProfile.savings_goals_count || 0
    ),

    financials: {
      monthlyIncome: Number(
        currentProfile.monthly_income || 0
      ),
    },
  },
};
  } catch (error) {
    console.error("Failed to fetch profile from backend:", error.response?.data || error.message);
    throw error;
  }
};

export const updateProfile = async (profileData) => {
  try {
    const listRes = await axios.get(`${API_BASE_URL}/users/profiles/`, {
      headers: getAuthHeader(),
    });
    
    const profiles = Array.isArray(listRes.data) ? listRes.data : [listRes.data];
    const profileId = profiles[0]?.id;

    if (!profileId) {
      throw new Error("Profile ID not found for current user.");
    }

    // Map frontend camelCase/flat fields to backend snake_case expectations if needed
    const payload = {
      phone: profileData.phone,
      location: profileData.location,
      profession: profileData.profession,
      monthly_income: profileData.financials?.monthlyIncome ?? profileData.monthly_income,
      financial_goal: profileData.financial_goal,
    };

    const response = await axios.patch(`${API_BASE_URL}/users/profiles/${profileId}/`, payload, {
      headers: getAuthHeader(),
    });
    
    return response;
  } catch (error) {
    console.error("Failed to update profile on backend:", error.response?.data || error.message);
    throw error;
  }
};