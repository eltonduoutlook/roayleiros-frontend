import type { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import { Trash } from "lucide-react";

export type UnitLocationRow = {
    id: string;
    city: string;
    state: string;
};

type BuildUnitLocationsColumnsParams = {
    onRemove: (row: UnitLocationRow) => void;
    disabled?: boolean;
};

export function buildUnitLocationsColumns({
    onRemove,
    disabled = false,
}: BuildUnitLocationsColumnsParams): ColumnDef<UnitLocationRow>[] {
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
            accessorKey: "city",
            header: "Cidade",
        },
        {
            accessorKey: "state",
            header: "Estado",
        },
    ];
}