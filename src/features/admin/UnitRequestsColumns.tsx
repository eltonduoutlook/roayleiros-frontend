import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { Unit } from "@/types/unit";

export type UnitRow = Unit;

type BuildUnitsColumnsParams = {
    onView: (row: UnitRow) => void;
};

function getStatusLabel(active: boolean) {
    return active ? "Ativa" : "Inativa";
}

function getStatusVariant(active: boolean) {
    return active ? "default" : "secondary";
}

export function buildUnitsColumns({
    onView,
}: BuildUnitsColumnsParams) {
    return [
        {
            accessorKey: "name",
            header: "Unidade",
            cell: ({ row }: any) => row.original.name,
        },
        {
            accessorKey: "city",
            header: "Cidade/UF",
            cell: ({ row }: any) => {
                const city = row.original.city ?? "-";
                const state = row.original.state ?? "-";
                return `${city} - ${state}`;
            },
        },
        {
            accessorKey: "active",
            header: "Status",
            cell: ({ row }: any) => (
                <Badge variant={getStatusVariant(row.original.active)}>
                    {getStatusLabel(row.original.active)}
                </Badge>
            ),
        },
        {
            accessorKey: "createdAt",
            header: "Criada em",
            cell: ({ row }: any) =>
                new Date(row.original.createdAt).toLocaleDateString("pt-BR"),
        },
        {
            id: "actions",
            header: "Ações",
            cell: ({ row }: any) => (
                <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => onView(row.original)}
                >
                    Ver detalhes
                </Button>
            ),
        },
    ];
}