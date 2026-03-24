// ProtectedRoute.tsx.
import React from "react";
import { Route, Navigate } from "react-router-dom";
import { useAuth } from "./AuthContext";

interface ProtectedRouteProps {
  element: React.ReactNode;
  path: string;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  element,
  ...rest
}) => {
  const { isLoggedIn } = useAuth();

  return isLoggedIn ? (
    <Route {...rest} element={element} />
  ) : (
    <Navigate to="/login" replace />
  );
};
//gh
export default ProtectedRoute;
