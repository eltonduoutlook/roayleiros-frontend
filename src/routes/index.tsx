import { Navigate, createBrowserRouter } from "react-router-dom";
import { AppLayout } from "@/components/layout/AppLayout";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import RoleRoute from "@/components/auth/RoleRoute";
import AccessPage from "@/pages/AccessPage";
import HomePage from "@/pages/HomePage";
import MonthDaysPage from "@/pages/MonthDaysPage";
import EventListPage from "@/pages/EventListPage";
import EventDetailPage from "@/pages/EventDetailPage";
import NotFoundPage from "@/pages/NotFoundPage";
import RequestRegistrationPage from "@/pages/RequestRegistrationPage";
import AdminRegisterRequestsPage from "@/pages/AdminRegisterRequestsPage";
import AdminHome from "@/pages/AdminHome";
import AdminUnitCreatePage from "@/pages/AdminUnitCreatePage";
import AdminUnitsPage from "@/pages/AdminUnitsPage";

const currentYear = new Date().getFullYear();

export const router = createBrowserRouter([
  {
    path: "/acesso",
    element: <AccessPage />,
  },
  {
    path: "/solicitar-cadastro",
    element: <RequestRegistrationPage />,
  },
  {
    path: "/",
    element: (
      <ProtectedRoute>
        <AppLayout />
      </ProtectedRoute>
    ),
    children: [
      { index: true, element: <Navigate to={`/ano/${currentYear}`} replace /> },
      { path: "ano/:year", element: <HomePage /> },
      { path: "ano/:year/mes/:month", element: <MonthDaysPage /> },
      { path: "eventos/:date", element: <EventListPage /> },
      { path: "evento/:id", element: <EventDetailPage /> },

      {
        path: "admin",
        element: (
          <RoleRoute allowedLevels={["ADMIN", "COORDINATOR"]}>
            <AdminHome />
          </RoleRoute>
        ),
      },
      {
        path: "admin/solicitacoes",
        element: (
          <RoleRoute allowedLevels={["ADMIN"]}>
            <AdminRegisterRequestsPage />
          </RoleRoute>
        ),
      },
      {
        path: "admin/unidades/nova",
        element: (
          <RoleRoute allowedLevels={["ADMIN", "COORDINATOR"]}>
            <AdminUnitCreatePage />
          </RoleRoute>
        ),
      },
      {
        path: "admin/unidades",
        element: (
          <RoleRoute allowedLevels={["ADMIN", "COORDINATOR"]}>
            <AdminUnitsPage />
          </RoleRoute>
        ),
      },

      { path: "404", element: <NotFoundPage /> },
      { path: "*", element: <NotFoundPage /> },
    ],
  },
]);