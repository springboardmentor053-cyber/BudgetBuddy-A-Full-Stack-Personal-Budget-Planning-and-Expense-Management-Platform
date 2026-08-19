import api from '../api/axios';

function getErrorMessage(error, fallback) {
  const data = error.response?.data;
  if (typeof data?.detail === 'string') return data.detail;
  if (typeof data?.old_password?.[0] === 'string') return data.old_password[0];
  if (typeof data?.confirm_new_password?.[0] === 'string') return data.confirm_new_password[0];
  if (typeof data?.non_field_errors?.[0] === 'string') return data.non_field_errors[0];
  return fallback;
}

export async function getUserProfile() {
  try {
    const response = await api.get('/api/auth/profile/');
    return response.data;
  } catch (error) {
    throw new Error(getErrorMessage(error, 'Failed to load profile data.'));
  }
}

export async function updateUserProfile(profileData) {
  try {
    const response = await api.patch('/api/auth/profile/', profileData);
    return response.data;
  } catch (error) {
    throw new Error(getErrorMessage(error, 'Unable to update profile details.'));
  }
}

export async function changePassword(passwordData) {
  try {
    const response = await api.put('/api/auth/change-password/', passwordData);
    return response.data;
  } catch (error) {
    throw new Error(getErrorMessage(error, 'Password change failed.'));
  }
}
export async function loginUser(credentials) {
  try {
    const response = await api.post('/api/auth/login/', credentials);
    if (response.data.access) {
      localStorage.setItem('access_token', response.data.access);
      localStorage.setItem('budgetbuddy_token', response.data.access);
    }
    if (response.data.refresh) {
      localStorage.setItem('refresh_token', response.data.refresh);
    }
    return response.data;
  } catch (error) {
    throw new Error(getErrorMessage(error, 'Invalid username or password.'));
  }
}

export async function registerUser(userData) {
  try {
    const response = await api.post('/api/auth/register/', userData);
    return response.data;
  } catch (error) {
    throw new Error(getErrorMessage(error, 'Registration failed. Please check your details.'));
  }
}