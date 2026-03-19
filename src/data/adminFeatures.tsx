import type { LucideIcon } from "lucide-react";
import {
    BuildingIcon,
    CalendarDays,
    ClipboardCheck,
    FileText,
    LayoutGrid,
    MapPin,
    ShieldCheck,
    Users,
} from "lucide-react";
import type { UserLevel } from "@/lib/authStorage";

export type AdminFeatureCategory =
    | "Acesso"
    | "Eventos"
    | "Pessoas"
    | "Configurações";

export interface AdminFeature {
    key: string;
    title: string;
    description: string;
    route: string;
    icon?: LucideIcon;
    allowedLevels: UserLevel[];
    enabled: boolean;
    category: AdminFeatureCategory;
}

export const adminFeatures: AdminFeature[] = [
    {
        key: "admin-home",
        title: "Painel Admin",
        description: "Visão geral da administração",
        route: "/admin",
        icon: LayoutGrid,
        allowedLevels: ["ADMIN", "COORDINATOR"],
        enabled: true,
        category: "Configurações",
    },
    {
        key: "solicitacoes",
        title: "Solicitações",
        description: "Aprovar ou rejeitar solicitações de acesso",
        route: "/admin/solicitacoes",
        icon: FileText,
        allowedLevels: ["ADMIN"],
        enabled: true,
        category: "Acesso",
    },
    {
        key: "eventos",
        title: "Eventos",
        description: "Gerenciar eventos publicados e rascunhos",
        route: "/admin/eventos",
        icon: CalendarDays,
        allowedLevels: ["ADMIN", "COORDINATOR"],
        enabled: false,
        category: "Eventos",
    },
    {
        key: "participantes",
        title: "Participantes",
        description: "Visualizar inscrições e presença",
        route: "/admin/participantes",
        icon: Users,
        allowedLevels: ["ADMIN", "COORDINATOR"],
        enabled: false,
        category: "Pessoas",
    },
    {
        key: "permissoes",
        title: "Permissões",
        description: "Controle de níveis e acessos",
        route: "/admin/permissoes",
        icon: ShieldCheck,
        allowedLevels: ["ADMIN"],
        enabled: false,
        category: "Configurações",
    },
    {
        key: "unit-create",
        title: "Nova unidade",
        description: "Cadastrar uma nova unidade.",
        route: "/admin/units/nova",
        allowedLevels: ["ADMIN"],
        icon: BuildingIcon,
        enabled: true,
        category: "Configurações",
    },
    {
        key: "units-manage",
        title: "Unidades",
        description: "Gerenciar cadastro e manutenção das unidades.",
        route: "/admin/units",
        allowedLevels: ["ADMIN"],
        icon: ClipboardCheck,
        enabled: true,
        category: "Configurações",
    },
];