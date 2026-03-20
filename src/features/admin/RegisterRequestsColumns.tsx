import { ColumnDef } from "@tanstack/react-table";
import { Pencil } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { formatPhone } from "@/lib/utils";
import { registerRequestStatusConfig } from "@/components/common/status/statusConfigs";
import { StatusBadge } from "@/components/common/status/StatusBadge";
import { AdminRegisterRequestItem } from "@/types/admin";

export type RegisterRequestRow = AdminRegisterRequestItem;

function formatDateTimeBR(value: string | null) {
    if (!value) return "—";

    return new Date(value).toLocaleString("pt-BR", {
        dateStyle: "short",
        timeStyle: "short",
    });
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
            cell: ({ row }) => row.original.city + " - " + row.original.state || "—",
        },
        {
            accessorKey: "phone",
            header: "Telefone",
            cell: ({ row }) => formatPhone(row.original.phone) || "—",
        },
        {
            accessorKey: "status",
            header: "Status",
            cell: ({ row }) => (
                <StatusBadge
                    status={row.original.status}
                    config={registerRequestStatusConfig}
                />
            ),
        },
        {
            accessorKey: "approvedLevel",
            header: () => (
                <Tooltip>
                    <TooltipTrigger asChild>
                        <span className="cursor-help">
                            Tipo de Usuário
                        </span>
                    </TooltipTrigger>
                    <TooltipContent>
                        Tipo de usuário selecionado no momento da aprovação!
                    </TooltipContent>
                </Tooltip>
            ),
            cell: ({ row }) => (
                <div
                    title="Tipo de usuário selecionado no momento da aprovação!"
                    className="flex flex-wrap gap-2">
                    {row.original.approvedLevel ? (
                        <Badge className="w-full py-3" variant="outline">
                            {row.original.approvedLevel}
                        </Badge>
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
            cell: ({ row }) => {
                const isApproved = row.original.status === "APPROVED";

                return (
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <span>
                                {/* span necessário porque button disabled não dispara tooltip */}
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    className="gap-2"
                                    disabled={isApproved}
                                    onClick={(event) => {
                                        event.stopPropagation();
                                        if (!isApproved) {
                                            onEdit(row.original);
                                        }
                                    }}
                                >
                                    <Pencil
                                        className={`h-4 w-4 ${isApproved ? "opacity-50" : ""
                                            }`}
                                    />
                                    Editar
                                </Button>
                            </span>
                        </TooltipTrigger>

                        {isApproved && (
                            <TooltipContent>
                                Solicitações aprovadas não podem ser editadas aqui.
                            </TooltipContent>
                        )}
                    </Tooltip>
                );
            },
        }
    ];
}