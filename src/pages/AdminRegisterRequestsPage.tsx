import { useMemo } from "react";
import { ShieldCheck, RefreshCw, XCircle, CheckCircle2, Clock3 } from "lucide-react";
import { PageHeader } from "@/components/common/PageHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { adminService } from "@/services/admin.service";
import { useAsyncData } from "@/hooks/useAsyncData";
import { FullScreenLoader } from "@/components/common/FullScreenLoader";

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

export default function AdminRegisterRequestsPage() {
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

  if (loading) {
    return <FullScreenLoader text="Carregando solicitações..." />;
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Admin • Solicitações de cadastro"
        description="Gerencie aprovações e rejeições de novos cadastros."
      />

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="flex items-center justify-between p-4">
            <div>
              <p className="text-sm text-muted-foreground">Total</p>
              <p className="text-2xl font-bold">{summary.total}</p>
            </div>
            <ShieldCheck className="h-5 w-5 text-muted-foreground" />
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Pendentes</p>
            <p className="text-2xl font-bold">{summary.pending}</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Aprovadas</p>
            <p className="text-2xl font-bold">{summary.approved}</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">Rejeitadas</p>
            <p className="text-2xl font-bold">{summary.rejected}</p>
          </CardContent>
        </Card>
      </div>

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
          ) : null}

          {!error && data.length === 0 ? (
            <div className="rounded-lg border border-dashed p-6 text-sm text-muted-foreground">
              Nenhuma solicitação encontrada.
            </div>
          ) : null}

          <div className="space-y-4">
            {data.map((request) => (
              <div
                key={request.id}
                className="rounded-xl border p-4 shadow-sm"
              >
                <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                  <div className="space-y-1">
                    <h3 className="text-base font-semibold">{request.name}</h3>
                    <p className="text-sm text-muted-foreground">{request.email}</p>
                    <p className="text-sm text-muted-foreground">
                      {request.city} • {request.phone}
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    {getStatusBadge(request.status)}
                    {request.approvedLevel ? (
                      <Badge variant="outline">{request.approvedLevel}</Badge>
                    ) : null}
                  </div>
                </div>

                <div className="mt-4 grid gap-3 text-sm md:grid-cols-2">
                  <div>
                    <span className="font-medium">Criado em:</span>{" "}
                    {formatDateTimeBR(request.createdAt)}
                  </div>

                  <div>
                    <span className="font-medium">Revisado em:</span>{" "}
                    {formatDateTimeBR(request.reviewedAt)}
                  </div>

                  <div>
                    <span className="font-medium">Revisado por:</span>{" "}
                    {request.reviewedByUserId ?? "—"}
                  </div>

                  <div>
                    <span className="font-medium">Usuário criado:</span>{" "}
                    {request.createdUserId ?? "—"}
                  </div>
                </div>

                {request.status === "REJECTED" && request.rejectionReason ? (
                  <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                    <span className="font-medium">Motivo da rejeição:</span>{" "}
                    {request.rejectionReason}
                  </div>
                ) : null}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}