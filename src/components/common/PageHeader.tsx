import type { ReactNode } from "react";

type PageHeaderProps = {
  title?: string;
  subtitle?: string;
  description?: string;
  actions?: ReactNode;
};

export function PageHeader({ title, subtitle, description, actions }: PageHeaderProps) {
  const hasHeading = Boolean(title || subtitle);

  return (
    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
      {hasHeading ? (
        <div>
          {title ? (
            <p className="text-2xl font-bold text-slate-900">{title}</p>
          ) : null}
          {subtitle ? <p className="mt-1 text-slate-500">{subtitle}</p> : null}
          {description ? <p className="mt-1 text-slate-500">{description}</p> : null}
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
