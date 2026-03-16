import { ColumnDef } from "@tanstack/react-table";
import { CheckCircle2, Clock3, Pencil, XCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export type RegisterRequestRow = {
    id: string;
    name: string;
    city: string;
    email: string;
    phone: string;
    status: string;
    approvedLevel: string | null;
    rejectionReason: string | null;
    reviewedAt: string | null;
    reviewedByUserId: string | null;
    createdUserId: string | null;
    createdAt: string;
    updatedAt: string;
};

function formatDateTimeBR(value: string | null) {
    if (!value) return "—";

    return new Date(value).toLocaleString("pt-BR", {
        dateStyle: "short",
        timeStyle: "short",
    });
}

function getStatusBadge(status: string) {
    switch (status) {
        case "PENDING":
            return (
                <Badge variant="secondary" className="gap-1">
                    <Clock3 className="h-3.5 w-3.5" />
                    Pendente
                </Badge>
            );

        case "APPROVED":
            return (
                <Badge className="gap-1">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    Aprovado
                </Badge>
            );

        case "REJECTED":
            return (
                <Badge variant="destructive" className="gap-1">
                    <XCircle className="h-3.5 w-3.5" />
                    Rejeitado
                </Badge>
            );

        default:
            return <Badge variant="outline">{status}</Badge>;
    }
}

type BuildColumnsParams = {
    onEdit: (row: RegisterRequestRow) => void;
};

export function buildRegisterRequestsColumns({
    onEdit,
}: BuildColumnsParams): ColumnDef<RegisterRequestRow>[] {
    return [
        {
            accessorKey: "name",
            header: "Nome",
            cell: ({ row }) => {
                const item = row.original;

                return (
                    <div className="min-w-[220px]">
                        <div className="font-medium">{item.name}</div>
                        <div className="text-sm text-muted-foreground">{item.email}</div>
                    </div>
                );
            },
        },
        {
            accessorKey: "city",
            header: "Cidade",
            cell: ({ row }) => row.original.city || "—",
        },
        {
            accessorKey: "phone",
            header: "Telefone",
            cell: ({ row }) => row.original.phone || "—",
        },
        {
            accessorKey: "status",
            header: "Status",
            cell: ({ row }) => (
                <div className="flex flex-wrap gap-2">
                    {getStatusBadge(row.original.status)}
                </div>
            ),
        },
        {
            accessorKey: "approvedLevel",
            header: "Tipo de Usuário",
            cell: ({ row }) => (
                <div className="flex flex-wrap gap-2">
                    {row.original.approvedLevel ? (
                        <Badge variant="outline">{row.original.approvedLevel}</Badge>
                    ) : null}
                </div>
            ),
        },
        {
            accessorKey: "createdAt",
            header: "Criado em",
            cell: ({ row }) => formatDateTimeBR(row.original.createdAt),
        },
        {
            accessorKey: "reviewedAt",
            header: "Revisado em",
            cell: ({ row }) => formatDateTimeBR(row.original.reviewedAt),
        },
        {
            id: "actions",
            header: "Ações",
            cell: ({ row }) => (
                <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="gap-2"
                    onClick={(event) => {
                        event.stopPropagation();
                        onEdit(row.original);
                    }}
                >
                    <Pencil className="h-4 w-4" />
                    Editar
                </Button>
            ),
        },
    ];
}