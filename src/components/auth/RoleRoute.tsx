import type { ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { authStorage, type UserLevel } from "@/lib/authStorage";

interface RoleRouteProps {
    children: ReactNode;
    allowedLevels: UserLevel[];
}

export default function RoleRoute({
    children,
    allowedLevels,
}: RoleRouteProps) {
    const location = useLocation();

    const user = authStorage.getUser();
    const sessionValid = authStorage.isSessionValid();

    if (!user || !sessionValid) {
        authStorage.clear();

        return (
            <Navigate
                to="/acesso"
                replace
                state={{ from: location.pathname }}
            />
        );
    }

    if (!allowedLevels.includes(user.level)) {
        return <Navigate to="/404" replace />;
    }

    return <>{children}</>;
}