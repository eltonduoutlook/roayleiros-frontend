import type { ReactNode } from "react";

type PageHeaderProps = {
  title?: string;
  subtitle?: string;
  actions?: ReactNode;
};

export function PageHeader({ title, subtitle, actions }: PageHeaderProps) {
  const hasHeading = Boolean(title || subtitle);

  return (
    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
      {hasHeading ? (
        <div>
          {title ? (
            <h2 className="text-3xl font-bold text-slate-900">{title}</h2>
          ) : null}
          {subtitle ? <p className="mt-1 text-slate-500">{subtitle}</p> : null}
        </div>
      ) : null}

      {actions ? (
        <div className={hasHeading ? "w-full md:flex-1" : "w-full"}>
          {actions}
        </div>
      ) : null}
    </div>
  );
}
