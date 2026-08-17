import axios from "axios";

const api = axios.create({
  baseURL: "http://127.0.0.1:8000/api/",
});


// =========================================================
// REQUEST INTERCEPTOR
// Automatically attach access token
// =========================================================

api.interceptors.request.use(
  (config) => {

    const token = localStorage.getItem("access");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },

  (error) => {
    return Promise.reject(error);
  }
);


// =========================================================
// RESPONSE INTERCEPTOR
// GLOBAL API ERROR HANDLING
// =========================================================

api.interceptors.response.use(

  (response) => {
    return response;
  },

  (error) => {

    // =====================================================
    // SERVER UNAVAILABLE
    // =====================================================

    if (!error.response) {

      error.apiMessage =
        "Unable to connect to the server. Please check your connection and try again.";

    }


    // =====================================================
    // UNAUTHORIZED
    // =====================================================

    else if (error.response.status === 401) {

      error.apiMessage =
        "Your login session has expired. Please log in again.";

      // Remove invalid access token
      localStorage.removeItem("access");

    }


    // =====================================================
    // BACKEND DETAIL MESSAGE
    // =====================================================

    else if (error.response.data?.detail) {

      error.apiMessage =
        error.response.data.detail;

    }


    // =====================================================
    // BACKEND MESSAGE
    // =====================================================

    else if (error.response.data?.message) {

      error.apiMessage =
        error.response.data.message;

    }


    // =====================================================
    // BAD REQUEST
    // =====================================================

    else if (error.response.status === 400) {

      error.apiMessage =
        "The request could not be completed. Please check your information.";

    }


    // =====================================================
    // FORBIDDEN
    // =====================================================

    else if (error.response.status === 403) {

      error.apiMessage =
        "You do not have permission to perform this action.";

    }


    // =====================================================
    // NOT FOUND
    // =====================================================

    else if (error.response.status === 404) {

      error.apiMessage =
        "The requested information could not be found.";

    }


    // =====================================================
    // SERVER ERROR
    // =====================================================

    else if (error.response.status >= 500) {

      error.apiMessage =
        "The server is currently unavailable. Please try again later.";

    }


    // =====================================================
    // UNKNOWN ERROR
    // =====================================================

    else {

      error.apiMessage =
        "Something went wrong. Please try again.";

    }

    return Promise.reject(error);
  }
);


export default api;