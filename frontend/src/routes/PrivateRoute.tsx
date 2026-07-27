import { Navigate } from "react-router-dom";
import type { JSX } from "react/jsx-runtime";

interface Props {
  children: JSX.Element;
}

function PrivateRoute({ children }: Props) {
  const token = localStorage.getItem("access");

  if (!token) {
    return <Navigate to="/" replace />;
    // If your login page is "/login", use:
    // return <Navigate to="/login" replace />;
  }

  return children;
}

export default PrivateRoute;