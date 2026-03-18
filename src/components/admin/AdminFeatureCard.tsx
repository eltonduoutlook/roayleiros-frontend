import type React from "react";
import { Heart, LayoutGrid } from "lucide-react";
import { useNavigate } from "react-router-dom";
import type { AdminFeature } from "@/data/adminFeatures";

interface AdminFeatureCardProps {
  feature: AdminFeature;
  isFavorite: boolean;
  onToggleFavorite: (key: string) => void;
  statLabel?: string;
}

export function AdminFeatureCard({
  feature,
  isFavorite,
  onToggleFavorite,
  statLabel,
}: AdminFeatureCardProps) {
  const navigate = useNavigate();
  const Icon = feature.icon ?? LayoutGrid;

  const handleNavigate = () => {
    if (!feature.enabled) return;
    navigate(feature.route);
  };

  const handleToggleFavorite = (
    event: React.MouseEvent<HTMLButtonElement>
  ) => {
    event.stopPropagation();
    onToggleFavorite(feature.key);
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (!feature.enabled) return;

    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      handleNavigate();
    }
  };

  return (
    <div
      role="button"
      tabIndex={feature.enabled ? 0 : -1}
      onClick={handleNavigate}
      onKeyDown={handleKeyDown}
      aria-disabled={!feature.enabled}
      className={[
        "group relative flex min-h-[180px] w-full flex-col overflow-hidden rounded-2xl border p-5 text-left shadow-sm transition-all duration-200",
        feature.enabled
          ? "cursor-pointer hover:-translate-y-1 hover:shadow-md"
          : "cursor-not-allowed opacity-75",
        isFavorite
          ? "border-red-200 bg-gradient-to-br from-red-50 via-white to-white"
          : "border-slate-200 bg-white",
      ].join(" ")}
    >
      <div className="absolute right-4 top-4">
        <button
          type="button"
          onClick={handleToggleFavorite}
          className={[
            "flex h-9 w-9 items-center justify-center rounded-full border transition",
            isFavorite
              ? "border-red-200 bg-red-50 text-red-500 hover:bg-red-100"
              : "border-slate-200 bg-white text-slate-400 hover:border-slate-300 hover:bg-slate-50 hover:text-slate-600",
          ].join(" ")}
          aria-label={
            isFavorite ? "Remover dos favoritos" : "Adicionar aos favoritos"
          }
          title={isFavorite ? "Remover dos favoritos" : "Adicionar aos favoritos"}
        >
          <Heart
            className="h-4 w-4"
            fill={isFavorite ? "currentColor" : "none"}
          />
        </button>
      </div>

      <div className="flex items-start gap-4 pr-12">
        <div
          className={[
            "flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border",
            isFavorite
              ? "border-red-100 bg-red-50 text-red-500"
              : "border-slate-200 bg-slate-50 text-slate-700",
          ].join(" ")}
        >
          <Icon className="h-6 w-6" />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-base font-semibold text-slate-900">
              {feature.title}
            </h3>

            {isFavorite && (
              <span className="inline-flex rounded-full bg-red-100 px-2.5 py-1 text-xs font-medium text-red-700">
                Favorito
              </span>
            )}
          </div>

          <p className="mt-2 text-sm leading-relaxed text-slate-600">
            {feature.description}
          </p>

          {statLabel && (
            <div className="mt-3">
              <span className="inline-flex rounded-full bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700">
                {statLabel}
              </span>
            </div>
          )}
        </div>
      </div>

      <div className="mt-auto pt-5">
        <span
          className={[
            "inline-flex rounded-full px-3 py-1 text-xs font-medium",
            feature.enabled
              ? "bg-emerald-50 text-emerald-700"
              : "bg-amber-50 text-amber-700",
          ].join(" ")}
        >
          {feature.enabled ? "Disponível" : "Em breve"}
        </span>
      </div>
    </div>
  );
}