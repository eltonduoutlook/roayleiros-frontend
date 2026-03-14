import type { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";

type ProtectedRouteProps = {
  children: ReactNode;
};

export default function ProtectedRoute({
  children,
}: ProtectedRouteProps) {
  const location = useLocation();
  const isAuthenticated = localStorage.getItem("mock:isAuthenticated") === "true";

  if (!isAuthenticated) {
    return <Navigate to="/acesso" replace state={{ from: location }} />;
  }

  return <>{children}</>;
}