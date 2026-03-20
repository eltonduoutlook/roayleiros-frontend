import { useMemo, useState } from "react";
import type { PaginationState } from "@tanstack/react-table";
import {
    CheckCircle2,
    Clock3,
    RefreshCw,
    Search,
    ShieldCheck,
    XCircle,
} from "lucide-react";

import { PageHeader } from "@/components/common/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { adminService } from "@/services/admin.service";
import { useAsyncData } from "@/hooks/useAsyncData";
import { FullScreenLoader } from "@/components/common/FullScreenLoader";
import { DataTable } from "@/components/common/DataTable";
import { StatCard } from "@/components/common/StatCard";
import { DashboardStatsGrid } from "@/components/common/DashboardStatsGrid";
import { RegisterRequestEditModal } from "@/features/admin/RegisterRequestEditModal";
import {
    buildRegisterRequestsColumns,
    RegisterRequestRow,
} from "@/features/admin/RegisterRequestsColumns";
import type {
    PaginatedRegisterRequestsResponse,
    RegisterRequestFilters,
    UserLevel,
} from "@/services/admin.service";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

type AuthUser = {
    id: string;
    name: string;
    city: string;
    email: string;
    phone: string;
    active: boolean;
    level: UserLevel;
};

const emptyFilters: RegisterRequestFilters = {
    name: "",
    state: "",
    city: "",
    phone: "",
    status: "",
    createdFrom: "",
    createdTo: "",
};

const emptyResponse: PaginatedRegisterRequestsResponse = {
    data: [],
    meta: {
        page: 1,
        pageSize: 10,
        total: 0,
        totalPages: 1,
    },
};

export default function AdminRegisterRequestsPage() {
    const [selectedRequest, setSelectedRequest] = useState<RegisterRequestRow | null>(null);
    const [filters, setFilters] = useState<RegisterRequestFilters>(emptyFilters);
    const [appliedFilters, setAppliedFilters] =
        useState<RegisterRequestFilters>(emptyFilters);

    const [pagination, setPagination] = useState<PaginationState>({
        pageIndex: 0,
        pageSize: 10,
    });

    const currentUserLevel = useMemo<UserLevel>(() => {
        const storedUser = localStorage.getItem("auth:user");

        if (!storedUser) {
            return "MEMBER";
        }

        try {
            const user = JSON.parse(storedUser) as AuthUser;
            return user.level ?? "MEMBER";
        } catch {
            return "MEMBER";
        }
    }, []);

    const { data, loading, error, reload } =
        useAsyncData<PaginatedRegisterRequestsResponse>(
            () =>
                adminService.getRegisterRequests({
                    ...appliedFilters,
                    page: pagination.pageIndex + 1,
                    pageSize: pagination.pageSize,
                }),
            emptyResponse,
            [appliedFilters, pagination.pageIndex, pagination.pageSize]
        );

    const rows = data.data;
    const meta = data.meta;

    const summary = useMemo(() => {
        const counts = {
            total: meta.total,
            pending: 0,
            approved: 0,
            rejected: 0,
        };

        for (const item of rows) {
            if (item.status === "PENDING") counts.pending += 1;
            if (item.status === "APPROVED") counts.approved += 1;
            if (item.status === "REJECTED") counts.rejected += 1;
        }

        return counts;
    }, [rows, meta.total]);

    const columns = useMemo(
        () =>
            buildRegisterRequestsColumns({
                onEdit: (row: RegisterRequestRow) => {
                    setSelectedRequest(row);
                },
            }),
        [],
    );

    const handleChange = (key: keyof RegisterRequestFilters, value: string) => {
        setFilters((prev) => ({
            ...prev,
            [key]: value,
        }));
    };

    const handleClearFilters = () => {
        setFilters(emptyFilters);
        setAppliedFilters(emptyFilters);
        setPagination((prev) => ({
            ...prev,
            pageIndex: 0,
        }));
    };

    const handleApplyFilters = () => {
        setAppliedFilters(filters);
        setPagination((prev) => ({
            ...prev,
            pageIndex: 0,
        }));
    };

    if (loading) {
        return <FullScreenLoader text="Carregando solicitações de cadastro..." />;
    }

    return (
        <div className="space-y-6">
            <PageHeader
                title="Admin • Solicitações de cadastro"
                description="Gerencie aprovações e rejeições de novos cadastros."
            />

            <DashboardStatsGrid columns={4}>
                <StatCard
                    title="Total"
                    value={summary.total}
                    icon={ShieldCheck}
                    color="info"
                />

                <StatCard
                    title="Pendentes"
                    value={summary.pending}
                    icon={Clock3}
                    color="warning"
                />

                <StatCard
                    title="Aprovadas"
                    value={summary.approved}
                    icon={CheckCircle2}
                    color="success"
                />

                <StatCard
                    title="Rejeitadas"
                    value={summary.rejected}
                    icon={XCircle}
                    color="danger"
                />
            </DashboardStatsGrid>

            <Card>
                <CardContent className="space-y-6 p-4 md:p-6">
                    <div className="space-y-4 rounded-2xl border bg-background p-4">
                        <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Nome</label>
                                <Input
                                    placeholder="Buscar por nome"
                                    value={filters.name}
                                    onChange={(e) => handleChange("name", e.target.value)}
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium">Estado</label>
                                <Input
                                    placeholder="Digite o estado"
                                    value={filters.state}
                                    onChange={(e) => handleChange("state", e.target.value)}
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium">Cidade</label>
                                <Input
                                    placeholder="Digite a cidade"
                                    value={filters.city}
                                    onChange={(e) => handleChange("city", e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 gap-4 lg:grid-cols-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Telefone</label>
                                <Input
                                    placeholder="Digite o telefone"
                                    value={filters.phone}
                                    onChange={(e) => handleChange("phone", e.target.value)}
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium">Status</label>
                                <Select
                                    value={filters.status || "__all__"}
                                    onValueChange={(value) =>
                                        handleChange("status", value === "__all__" ? "" : value)
                                    }
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Selecione o status" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="__all__">Todos</SelectItem>
                                        <SelectItem value="PENDING">Pendente</SelectItem>
                                        <SelectItem value="APPROVED">Aprovado</SelectItem>
                                        <SelectItem value="REJECTED">Rejeitado</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium">Criado de</label>
                                <Input
                                    type="date"
                                    value={filters.createdFrom}
                                    onChange={(e) => handleChange("createdFrom", e.target.value)}
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-medium">Criado até</label>
                                <Input
                                    type="date"
                                    value={filters.createdTo}
                                    onChange={(e) => handleChange("createdTo", e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-2">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={handleClearFilters}
                            >
                                Limpar
                            </Button>

                            <Button
                                type="button"
                                className="gap-2"
                                onClick={handleApplyFilters}
                            >
                                <Search className="h-4 w-4" />
                                Filtrar
                            </Button>
                        </div>
                    </div>

                    <div className="flex items-center justify-between gap-3">
                        <div>
                            <h2 className="text-lg font-semibold">Lista de solicitações</h2>
                            <p className="text-sm text-muted-foreground">
                                Mais recentes primeiro.
                            </p>
                        </div>

                        <Button
                            variant="outline"
                            className="gap-2"
                            onClick={reload}
                            type="button"
                        >
                            <RefreshCw className="h-4 w-4" />
                            Atualizar
                        </Button>
                    </div>

                    {error ? (
                        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700">
                            {error}
                        </div>
                    ) : (
                        <DataTable
                            columns={columns}
                            data={rows}
                            emptyMessage="Nenhuma solicitação encontrada."
                            manualPagination
                            pageCount={meta.totalPages}
                            rowCount={meta.total}
                            pagination={pagination}
                            onPaginationChange={setPagination}
                            pageSizeOptions={[10, 20, 50]}
                            onRowClick={(row) => {
                                const canEdit =
                                    row.status === "PENDING" || row.status === "REJECTED";

                                if (!canEdit) return;

                                setSelectedRequest(row);
                            }}
                        />
                    )}
                </CardContent>
            </Card>

            <RegisterRequestEditModal
                open={!!selectedRequest}
                request={selectedRequest}
                currentUserLevel={currentUserLevel}
                onClose={() => setSelectedRequest(null)}
                onSuccess={async () => {
                    setSelectedRequest(null);
                    await reload();
                }}
            />
        </div>
    );
}