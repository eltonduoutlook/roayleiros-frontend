import { CheckCircle2, Clock3, XCircle } from "lucide-react";

import type { StatusConfig } from "./StatusBadge";
import { RegisterRequestStatus } from "@/types/admin";

// 🔹 Register Request Status
export const registerRequestStatusConfig: Record<
    RegisterRequestStatus,
    StatusConfig
> = {
    PENDING: {
        label: "Pendente",
        icon: Clock3,
        variant: "outline",
        className: "border-yellow-200 bg-yellow-50 text-yellow-700 w-full",
    },
    APPROVED: {
        label: "Aprovada",
        icon: CheckCircle2,
        className: "bg-green-600 text-white hover:bg-green-600 w-full",
    },
    REJECTED: {
        label: "Rejeitada",
        icon: XCircle,
        className: "bg-red-600 text-white hover:bg-red-600 w-full",
    },
};

// 🔹 Boolean Status
export const statusBooleanConfig: Record<
    "ACTIVE" | "INACTIVE",
    StatusConfig
> = {
    ACTIVE: {
        label: "Ativo",
        icon: CheckCircle2,
        className: "bg-green-600 text-white w-full",
    },
    INACTIVE: {
        label: "Inativo",
        icon: XCircle,
        className: "bg-gray-200 text-gray-700 w-full",
        variant: "secondary",
    },
};