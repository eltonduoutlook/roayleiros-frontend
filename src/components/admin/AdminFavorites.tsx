import type { AdminFeature } from "@/data/adminFeatures";
import type { AdminFeatureStatsMap } from "@/hooks/useAdminFeatureStats";
import { Heart } from "lucide-react";
import { AdminFeatureCard } from "./AdminFeatureCard";

interface AdminFavoritesProps {
  features: AdminFeature[];
  favoriteKeys: string[];
  onToggleFavorite: (key: string) => void;
  stats?: AdminFeatureStatsMap;
}

export function AdminFavorites({
  features,
  favoriteKeys,
  onToggleFavorite,
  stats,
}: AdminFavoritesProps) {
  const favoriteFeatures = favoriteKeys
    .map((key) => features.find((feature) => feature.key === key))
    .filter((feature): feature is AdminFeature => Boolean(feature));

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center gap-2">
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-red-50 text-red-500">
          <Heart className="h-4 w-4" fill="currentColor" />
        </div>

        <div>
          <h2 className="text-base font-semibold text-slate-900">Favoritos</h2>
          <p className="text-sm text-slate-600">
            Acesse rapidamente as funcionalidades que você mais usa.
          </p>
        </div>
      </div>

      {favoriteFeatures.length === 0 ? (
        <div className="mt-4 rounded-xl border border-dashed border-slate-300 bg-slate-50 px-4 py-6 text-sm text-slate-600">
          Clique no coração de uma funcionalidade para fixá-la aqui.
        </div>
      ) : (
        <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {favoriteFeatures.map((feature) => (
            <AdminFeatureCard
              key={feature.key}
              feature={feature}
              isFavorite={true}
              onToggleFavorite={onToggleFavorite}
              statLabel={stats?.[feature.key]?.label}
            />
          ))}
        </div>
      )}
    </section>
  );
}