import { StatusBadge } from "./StatusBadge";
import { statusBooleanConfig } from "./statusConfigs";

type Props = {
    value: boolean;
};

export function StatusBooleanBadge({ value }: Props) {
    return (
        <StatusBadge
            status={value ? "ACTIVE" : "INACTIVE"}
            config={statusBooleanConfig}
        />
    );
}