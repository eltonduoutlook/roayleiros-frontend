import type { ReactNode } from "react";

interface ButtonsContainerProps {
    children: ReactNode;
    className?: string;
}

export function ButtonsContainer({
    children,
    className = "",
}: ButtonsContainerProps) {
    return (
        <div className={`flex items-center gap-2 ${className}`}>
            {children}
        </div>
    );
}