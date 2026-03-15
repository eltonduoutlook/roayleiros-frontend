import type { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { authStorage } from "@/lib/authStorage";

type ProtectedRouteProps = {
  children: ReactNode;
};

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const location = useLocation();

  if (!authStorage.isAuthenticated()) {
    authStorage.clear();
    return <Navigate to="/acesso" replace state={{ from: location }} />;
  }

  return <>{children}</>;
}