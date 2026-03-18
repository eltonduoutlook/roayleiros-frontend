import type { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import type { EligibleCoordinator } from "@/types/users";
import { Trash } from "lucide-react";

export type SelectedCoordinatorRow = EligibleCoordinator;

type BuildSelectedUnitCoordinatorsColumnsParams = {
    onRemove: (row: SelectedCoordinatorRow) => void;
    disabled?: boolean;
};

function formatLocation(row: SelectedCoordinatorRow) {
    const city = row.city?.trim();
    const state = row.state?.trim();

    if (city && state) return `${city} - ${state}`;
    if (city) return city;
    if (state) return state;
    return "-";
}

export function buildSelectedUnitCoordinatorsColumns({
    onRemove,
    disabled = false,
}: BuildSelectedUnitCoordinatorsColumnsParams): ColumnDef<SelectedCoordinatorRow>[] {
    return [
        {
            id: "actions",
            header: "Ações",
            cell: ({ row }) => (
                <Button
                    type="button"
                    variant="ghost"
                    onClick={() => onRemove(row.original)}
                    disabled={disabled}
                    className="text-red-600 hover:text-red-700 hover:bg-red-50 gap-2"
                >
                    <Trash className="h-4 w-4" />
                    Remover
                </Button>
            ),
        },
        {
            accessorKey: "name",
            header: "Nome",
        },
        {
            accessorKey: "phone",
            header: "Telefone",
            cell: ({ row }) => row.original.phone || "-",
        },
        {
            id: "location",
            header: "Cidade",
            cell: ({ row }) => formatLocation(row.original),
        },
        {
            accessorKey: "level",
            header: "Member level",
        },
    ];
}