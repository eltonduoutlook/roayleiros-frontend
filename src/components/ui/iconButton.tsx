import type { ButtonHTMLAttributes, ReactNode } from "react";

interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    children: ReactNode;
}

export function IconButton({
    children,
    className = "",
    ...props
}: IconButtonProps) {
    return (
        <button
            type="button"
            className={`flex items-center justify-center rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-600 hover:bg-slate-100 cursor-pointer ${className}`}
            {...props}
        >
            {children}
        </button>
    );
}