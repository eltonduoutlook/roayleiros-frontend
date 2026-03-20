import type { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { formatDateBR } from "@/lib/date";
import { StatusBadge } from "@/components/common/status/StatusBadge";
import { StatusBooleanBadge } from "@/components/common/status/BooleanStatusBadge";


export type AdminUnitRow = {
    id: string;
    name: string;
    active: boolean;
    state: string;
    city: string;
    locationsCount: number;
    coordinatorsCount: number;
    updatedAt: string;
};

type BuildAdminUnitsColumnsParams = {
    onEdit: (unitId: string) => void;
};

export function buildAdminUnitsColumns({
    onEdit,
}: BuildAdminUnitsColumnsParams): ColumnDef<AdminUnitRow>[] {
    return [
        {
            accessorKey: "name",
            header: "Nome",
            cell: ({ row }) => (
                <div className="font-medium text-slate-900">{row.original.name}</div>
            ),
        },
        {
            accessorKey: "city",
            header: "Cidade Base",
            cell: ({ row }) => (
                <div className="font-medium text-slate-900">
                    {row.original.city ? `${row.original.city} - ${row.original.state}` : "—"}
                </div>
            ),
        },
        {
            accessorKey: "locationsCount",
            header: "Locais",
        },
        {
            accessorKey: "coordinatorsCount",
            header: "Coordenadores",
        },
        {
            accessorKey: "updatedAt",
            header: "Atualizado em",
            cell: ({ row }) => formatDateBR(row.original.updatedAt),
        },
        {
            accessorKey: "status",
            header: "Status",
            cell: ({ row }) => (
                <StatusBooleanBadge value={row.original.active} />
            ),
        },
        {
            id: "actions",
            header: "Ações",
            cell: ({ row }) => (
                <Button
                    type="button"
                    variant="outline"
                    onClick={() => onEdit(row.original.id)}
                >
                    Editar
                </Button>
            ),
        },
    ];
}