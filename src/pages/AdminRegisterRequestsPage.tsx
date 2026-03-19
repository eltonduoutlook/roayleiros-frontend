import { useMemo, useState } from "react";
import { CheckCircle2, Clock3, RefreshCw, ShieldCheck, XCircle } from "lucide-react";

import { PageHeader } from "@/components/common/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { adminService } from "@/services/admin.service";
import { useAsyncData } from "@/hooks/useAsyncData";
import { FullScreenLoader } from "@/components/common/FullScreenLoader";

import { DataTable } from "@/components/common/DataTable";
import { StatCard } from "@/components/common/StatCard";
import { DashboardStatsGrid } from "@/components/common/DashboardStatsGrid";
import { RegisterRequestEditModal } from "@/features/admin/RegisterRequestEditModal";
import { buildRegisterRequestsColumns, RegisterRequestRow } from "@/features/admin/RegisterRequestsColumns";
import type { UserLevel } from "@/services/admin.service";

type AuthUser = {
    id: string;
    name: string;
    city: string;
    email: string;
    phone: string;
    active: boolean;
    level: UserLevel;
};

export default function AdminRegisterRequestsPage() {
    const [selectedRequest, setSelectedRequest] = useState<RegisterRequestRow | null>(null);

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

    const {
        data,
        loading,
        error,
        reload,
    } = useAsyncData(() => adminService.getRegisterRequests(), [], []);

    const summary = useMemo(() => {
        const counts = {
            total: data.length,
            pending: 0,
            approved: 0,
            rejected: 0,
        };

        for (const item of data) {
            if (item.status === "PENDING") counts.pending += 1;
            if (item.status === "APPROVED") counts.approved += 1;
            if (item.status === "REJECTED") counts.rejected += 1;
        }

        return counts;
    }, [data]);

    const columns = useMemo(
        () =>
            buildRegisterRequestsColumns({
                onEdit: (row: RegisterRequestRow) => {
                    setSelectedRequest(row);
                },
            }),
        [],
    );

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
                <CardContent className="space-y-4 p-4 md:p-6">
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
                            data={data}
                            emptyMessage="Nenhuma solicitação encontrada."
                            onRowClick={(row) => {
                                const canEdit = row.status === "PENDING" || row.status === "REJECTED";
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