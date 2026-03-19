import type { ColumnDef } from "@tanstack/react-table";
import { Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import type { EligibleCoordinator } from "@/types/users";

export function buildUnitCoordinatorsColumns(
    onRemove: (id: string) => void,
): ColumnDef<EligibleCoordinator>[] {
    return [
        {
            accessorKey: "name",
            header: "Nome",
            cell: ({ row }) => row.original.name,
        },
        {
            accessorKey: "email",
            header: "E-mail",
            cell: ({ row }) => row.original.email,
        },
        {
            accessorKey: "phone",
            header: "Telefone",
            cell: ({ row }) => row.original.phone || "—",
        },
        {
            accessorKey: "city",
            header: "Cidade",
            cell: ({ row }) => (row.original.city + " - " + row.original.state) || "—",
        },
        {
            id: "actions",
            header: "Ações",
            cell: ({ row }) => (
                <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => onRemove(row.original.id)}
                    className="gap-2"
                >
                    <Trash2 className="h-4 w-4" />
                    Remover
                </Button>
            ),
        },
        
    ];
}