import { Navigate } from "react-router";
import { getToken } from "@/lib/api";

export function RequireAuth({ children }) {
  if (!getToken()) {
    return <Navigate to="/login" replace />;
  }
  return children;
}

export default RequireAuth;
