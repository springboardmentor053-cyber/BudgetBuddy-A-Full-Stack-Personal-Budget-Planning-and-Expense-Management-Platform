import { Navigate } from 'react-router-dom';

export default function ProtectedRoute({ children }) {
  const token = localStorage.getItem('access_token') || localStorage.getItem('budgetbuddy_token');

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  return children;
}
