import { useMemo, useState } from "react";

import { DataTable } from "@/components/common/DataTable";
import { Button } from "@/components/ui/button";
import { UnitCoordinatorsField } from "@/components/units/UnitCoordinatorsField";
import { buildSelectedUnitCoordinatorsColumns } from "@/features/admin/SelectedUnitCoordinatorsColumns";
import { unitService } from "@/services/unit.service";
import type { UnitCoordinatorItem } from "@/types/unitCoordinator";
import type { EligibleCoordinator } from "@/types/users";

type UnitCoordinatorsSectionProps =
    | {
        mode: "create";
        value: string[];
        selectedCoordinators: EligibleCoordinator[];
        onChange: (coordinatorIds: string[]) => void;
        onSelectedCoordinatorsChange: (items: EligibleCoordinator[]) => void;
        disabled?: boolean;
    }
    | {
        mode: "edit";
        unitId: string;
        activeCoordinators: UnitCoordinatorItem[];
        disabled?: boolean;
        onCoordinatorsChange: (items: UnitCoordinatorItem[]) => void;
    };

function mapCoordinatorToEligible(item: UnitCoordinatorItem): EligibleCoordinator {
    return {
        id: item.user.id,
        name: item.user.name,
        email: item.user.email,
        phone: item.user.phone ?? "",
        city: item.user.city ?? "",
        active: item.user.active,
        level: item.user.level,
    };
}

export function UnitCoordinatorsSection(props: UnitCoordinatorsSectionProps) {
    const disabled = props.disabled ?? false;
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [searchSelectedIds, setSearchSelectedIds] = useState<string[]>([]);
    const [searchSelectedUsers, setSearchSelectedUsers] = useState<
        EligibleCoordinator[]
    >([]);

    const isEditMode = props.mode === "edit";

    const selectedRows = useMemo<EligibleCoordinator[]>(() => {
        if (props.mode === "create") {
            return props.selectedCoordinators;
        }

        return props.activeCoordinators
            .filter((item) => item.active)
            .map(mapCoordinatorToEligible);
    }, [props]);

    async function handleInactivateCoordinator(user: EligibleCoordinator) {
        if (props.mode !== "edit") {
            props.onChange(props.value.filter((id) => id !== user.id));
            props.onSelectedCoordinatorsChange(
                props.selectedCoordinators.filter((item) => item.id !== user.id),
            );
            return;
        }

        const target = props.activeCoordinators.find(
            (item) => item.userId === user.id && item.active,
        );

        if (!target) return;

        try {
            setSaving(true);
            setError(null);

            const updated = await unitService.inactivateUnitCoordinator(
                props.unitId,
                target.userId,
            );

            props.onCoordinatorsChange(
                props.activeCoordinators.map((item) =>
                    item.userId === target.userId ? updated : item,
                ),
            );
        } catch (err) {
            console.error(err);
            setError("Não foi possível inativar o coordenador.");
        } finally {
            setSaving(false);
        }
    }

    async function handleAddSelectedCoordinators() {
        if (props.mode !== "edit") return;
        if (searchSelectedUsers.length === 0) return;

        try {
            setSaving(true);
            setError(null);

            const activeIds = new Set(
                props.activeCoordinators.filter((item) => item.active).map((item) => item.userId),
            );

            const usersToAdd = searchSelectedUsers.filter(
                (user) => !activeIds.has(user.id),
            );

            if (usersToAdd.length === 0) {
                setError("Os coordenadores selecionados já estão vinculados à unidade.");
                return;
            }

            const createdItems = await Promise.all(
                usersToAdd.map((user) =>
                    unitService.addUnitCoordinator(props.unitId, { userId: user.id }),
                ),
            );

            const nextItems = [...props.activeCoordinators];

            for (const created of createdItems) {
                const existingIndex = nextItems.findIndex(
                    (item) => item.userId === created.userId,
                );

                if (existingIndex >= 0) {
                    nextItems[existingIndex] = created;
                } else {
                    nextItems.push(created);
                }
            }

            props.onCoordinatorsChange(nextItems);
            setSearchSelectedIds([]);
            setSearchSelectedUsers([]);
        } catch (err) {
            console.error(err);
            setError("Não foi possível vincular os coordenadores.");
        } finally {
            setSaving(false);
        }
    }

    const columns = useMemo(
        () =>
            buildSelectedUnitCoordinatorsColumns({
                onRemove: handleInactivateCoordinator,
                disabled: disabled || saving,
            }),
        [disabled, saving, selectedRows],
    );

    return (
        <div className="space-y-4">
            <UnitCoordinatorsField
                value={
                    props.mode === "create"
                        ? props.value
                        : searchSelectedIds
                }
                onChange={
                    props.mode === "create"
                        ? props.onChange
                        : setSearchSelectedIds
                }
                selectedCoordinators={
                    props.mode === "create"
                        ? props.selectedCoordinators
                        : searchSelectedUsers
                }
                onSelectedCoordinatorsChange={
                    props.mode === "create"
                        ? props.onSelectedCoordinatorsChange
                        : setSearchSelectedUsers
                }
                disabled={disabled || saving}
            />

            {isEditMode && searchSelectedUsers.length > 0 && (
                <div className="flex justify-end">
                    <Button
                        type="button"
                        onClick={() => void handleAddSelectedCoordinators()}
                        disabled={disabled || saving}
                    >
                        {saving
                            ? "Vinculando..."
                            : `Vincular selecionados (${searchSelectedUsers.length})`}
                    </Button>
                </div>
            )}

            <div className="space-y-2">
                <div className="text-sm font-medium text-slate-700">
                    {props.mode === "create"
                        ? `Coordenadores selecionados (${selectedRows.length})`
                        : `Coordenadores ativos (${selectedRows.length})`}
                </div>

                <DataTable
                    columns={columns}
                    data={selectedRows}
                    emptyMessage={
                        props.mode === "create"
                            ? "Nenhum coordenador selecionado."
                            : "Nenhum coordenador ativo."
                    }
                    initialPageSize={5}
                    pageSizeOptions={[5]}
                />
            </div>

            {error && (
                <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                    {error}
                </div>
            )}
        </div>
    );
}