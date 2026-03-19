import type { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";

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

function formatDate(value: string) {
    if (!value) return "-";

    return new Date(value).toLocaleString("pt-BR");
}

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
            accessorKey: "state",
            header: "Estado",
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
            accessorKey: "active",
            header: "Status",
            cell: ({ row }) => (row.original.active ? "Ativa" : "Inativa"),
        },
        {
            accessorKey: "updatedAt",
            header: "Atualizado em",
            cell: ({ row }) => formatDate(row.original.updatedAt),
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