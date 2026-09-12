// API base URL — set VITE_API_URL in Render environment variables
// for production. Falls back to local dev server.
const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://127.0.0.1:8000/api/";

export default API_BASE_URL;
