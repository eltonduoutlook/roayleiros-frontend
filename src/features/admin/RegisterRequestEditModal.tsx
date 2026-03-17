import { useEffect, useMemo, useState } from "react";
import { CheckCircle2, Loader2, XCircle } from "lucide-react";

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    adminService,
    type RegisterRequestStatus,
    type UserLevel,
} from "@/services/admin.service";
import type { RegisterRequestRow } from "@/features/admin/RegisterRequestsColumns";
import { formatPhone } from "@/lib/utils";

type Props = {
    open: boolean;
    request: RegisterRequestRow | null;
    currentUserLevel: UserLevel;
    onClose: () => void;
    onSuccess: () => Promise<void> | void;
};

type FormState = {
    name: string;
    city: string;
    email: string;
    phone: string;
    approvedLevel: UserLevel;
    rejectionReason: string;
};

const DEFAULT_FORM: FormState = {
    name: "",
    city: "",
    email: "",
    phone: "",
    approvedLevel: "MEMBER",
    rejectionReason: "",
};

function getStatusLabel(status: RegisterRequestStatus) {
    switch (status) {
        case "APPROVED":
            return "Aprovada";
        case "REJECTED":
            return "Rejeitada";
        default:
            return "Pendente";
    }
}

function getStatusClasses(status: RegisterRequestStatus) {
    switch (status) {
        case "APPROVED":
            return "border-green-200 bg-green-50 text-green-700";
        case "REJECTED":
            return "border-red-200 bg-red-50 text-red-700";
        default:
            return "border-yellow-200 bg-yellow-50 text-yellow-700";
    }
}

export function RegisterRequestEditModal({
    open,
    request,
    currentUserLevel,
    onClose,
    onSuccess,
}: Props) {
    const [form, setForm] = useState<FormState>(DEFAULT_FORM);
    const [savingApprove, setSavingApprove] = useState(false);
    const [savingReject, setSavingReject] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        if (!request) {
            setForm(DEFAULT_FORM);
            setError("");
            return;
        }

        setForm({
            name: request.name ?? "",
            city: request.city ?? "",
            email: request.email ?? "",
            phone: request.phone ?? "",
            approvedLevel: (request.approvedLevel as UserLevel | null) ?? "MEMBER",
            rejectionReason: request.rejectionReason ?? "",
        });
        setError("");
    }, [request]);

    const allowedLevels = useMemo<UserLevel[]>(() => {
        if (currentUserLevel === "ADMIN") {
            return ["ADMIN", "COORDINATOR", "MEMBER"];
        }

        if (currentUserLevel === "COORDINATOR") {
            return ["MEMBER"];
        }

        return [];
    }, [currentUserLevel]);

    const isPending = request?.status === "PENDING";
    const isApproved = request?.status === "APPROVED";
    const isRejected = request?.status === "REJECTED";
    const isBusy = savingApprove || savingReject;

    const canApprove = !!request && !isBusy && request.status !== "APPROVED";
    const canReject = !!request && !isBusy && request.status !== "REJECTED";

    function updateField<K extends keyof FormState>(field: K, value: FormState[K]) {
        setForm((prev) => ({ ...prev, [field]: value }));
    }

    async function handleApprove() {
        if (!request) return;

        setError("");

        if (!allowedLevels.includes(form.approvedLevel)) {
            setError("Você não tem permissão para aprovar com esse nível.");
            return;
        }

        try {
            setSavingApprove(true);

            await adminService.approveRegisterRequest(request.id, {
                approvedLevel: form.approvedLevel,
                name: form.name.trim(),
                city: form.city.trim(),
                email: form.email.trim(),
                phone: form.phone.replace(/\D/g, ""),
            });

            await onSuccess();
        } catch (err) {
            setError(err instanceof Error ? err.message : "Erro ao aprovar solicitação.");
        } finally {
            setSavingApprove(false);
        }
    }

    async function handleReject() {
        if (!request) return;

        setError("");

        if (!form.rejectionReason.trim()) {
            setError("Informe o motivo da rejeição.");
            return;
        }

        try {
            setSavingReject(true);

            await adminService.rejectRegisterRequest(request.id, {
                rejectionReason: form.rejectionReason.trim(),
            });

            await onSuccess();
        } catch (err) {
            setError(err instanceof Error ? err.message : "Erro ao rejeitar solicitação.");
        } finally {
            setSavingReject(false);
        }
    }

    return (
        <Dialog open={open} onOpenChange={(value) => !value && !isBusy && onClose()}>
            <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-2xl">
                <DialogHeader>
                    <DialogTitle>Solicitação de cadastro</DialogTitle>
                    <DialogDescription>
                        Revise os dados e decida se deseja aprovar ou rejeitar a solicitação.
                    </DialogDescription>
                </DialogHeader>

                {!request ? null : (
                    <div className="space-y-6">
                        {error ? (
                            <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                                {error}
                            </div>
                        ) : null}

                        <div className="flex flex-wrap items-center gap-2">
                            <div
                                className={`inline-flex rounded-full border px-3 py-1 text-xs font-medium ${getStatusClasses(
                                    request.status
                                )}`}
                            >
                                Status atual: {getStatusLabel(request.status)}
                            </div>

                            {request.approvedLevel ? (
                                <div className="inline-flex rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-medium text-slate-700">
                                    Level atual: {request.approvedLevel}
                                </div>
                            ) : null}
                        </div>

                        <div className="grid gap-4 md:grid-cols-2">
                            <div className="space-y-2">
                                <Label htmlFor="register-name">Nome</Label>
                                <Input
                                    id="register-name"
                                    value={form.name}
                                    onChange={(e) => updateField("name", e.target.value)}
                                    disabled={isBusy}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="register-city">Cidade</Label>
                                <Input
                                    id="register-city"
                                    value={form.city}
                                    onChange={(e) => updateField("city", e.target.value)}
                                    disabled={isBusy}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="register-email">E-mail</Label>
                                <Input
                                    id="register-email"
                                    type="email"
                                    value={form.email}
                                    onChange={(e) => updateField("email", e.target.value)}
                                    disabled={isBusy}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="register-phone">Telefone</Label>
                                <Input
                                    id="register-phone"
                                    value={form.phone}
                                    onChange={(e) => updateField("phone", formatPhone(e.target.value))}
                                    disabled={isBusy}
                                    placeholder="(11) 31648-5555"
                                />
                            </div>
                        </div>

                        <div className="grid gap-4 md:grid-cols-2">
                            <div className="space-y-2">
                                <Label>Nível de acesso</Label>
                                <Select
                                    value={form.approvedLevel}
                                    onValueChange={(value) => updateField("approvedLevel", value as UserLevel)}
                                    disabled={isBusy}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Selecione o nível" />
                                    </SelectTrigger>

                                    <SelectContent>
                                        {allowedLevels.includes("ADMIN") && (
                                            <SelectItem value="ADMIN">Admin</SelectItem>
                                        )}
                                        {allowedLevels.includes("COORDINATOR") && (
                                            <SelectItem value="COORDINATOR">Coordinator</SelectItem>
                                        )}
                                        {allowedLevels.includes("MEMBER") && (
                                            <SelectItem value="MEMBER">Member</SelectItem>
                                        )}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="register-created-at">Criada em</Label>
                                <Input
                                    id="register-created-at"
                                    value={new Date(request.createdAt).toLocaleString("pt-BR")}
                                    disabled
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="register-rejection-reason">Motivo da rejeição</Label>
                            <Textarea
                                id="register-rejection-reason"
                                value={form.rejectionReason}
                                onChange={(e) => updateField("rejectionReason", e.target.value)}
                                rows={4}
                                disabled={isBusy}
                                placeholder="Preencha apenas se for rejeitar a solicitação"
                            />
                        </div>

                        {isRejected && request.rejectionReason ? (
                            <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                                <span className="font-medium">Motivo registrado:</span>{" "}
                                {request.rejectionReason}
                            </div>
                        ) : null}

                        <DialogFooter className="flex-col gap-2 sm:flex-row sm:justify-between">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={onClose}
                                disabled={isBusy}
                            >
                                Cancelar
                            </Button>

                            <div className="flex flex-col gap-2 sm:flex-row">
                                <Button
                                    type="button"
                                    variant="destructive"
                                    onClick={handleReject}
                                    disabled={!canReject}
                                >
                                    {savingReject ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            Rejeitando...
                                        </>
                                    ) : (
                                        <>
                                            <XCircle className="mr-2 h-4 w-4" />
                                            {request.status === "APPROVED" ? "Rejeitar" : "Rejeitar"}
                                        </>
                                    )}
                                </Button>

                                <Button
                                    type="button"
                                    onClick={handleApprove}
                                    disabled={!canApprove}
                                >
                                    {savingApprove ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            Aprovando...
                                        </>
                                    ) : (
                                        <>
                                            <CheckCircle2 className="mr-2 h-4 w-4" />
                                            {request.status === "REJECTED" ? "Reaprovar" : "Aprovar"}
                                        </>
                                    )}
                                </Button>
                            </div>
                        </DialogFooter>

                        {isPending ? (
                            <p className="text-xs text-muted-foreground">
                                Enquanto nenhuma ação for tomada, a solicitação continua pendente.
                            </p>
                        ) : null}
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
}