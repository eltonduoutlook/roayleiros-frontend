import { useMemo, useState } from "react";
import { Shield } from "lucide-react";
import { AdminFavorites } from "@/components/admin/AdminFavorites";
import { AdminFeatureGrid } from "@/components/admin/AdminFeatureGrid";
import { adminFeatures } from "@/data/adminFeatures";
import { useAdminFavorites } from "@/hooks/useAdminFavorites";
import { useAdminFeatureStats } from "@/hooks/useAdminFeatureStats";
import { authStorage } from "@/lib/authStorage";

export default function AdminHome() {
  const [user] = useState(() => authStorage.getUser());

  const availableFeatures = useMemo(() => {
    return adminFeatures.filter((feature) => {
      if (!user) return false;
      if (feature.key === "admin-home") return false;

      return feature.allowedLevels.includes(user.level);
    });
  }, [user]);

  const validKeys = useMemo(
    () => availableFeatures.map((feature) => feature.key),
    [availableFeatures]
  );

  const { favoriteKeys, toggleFavorite } = useAdminFavorites(validKeys);
  const { stats } = useAdminFeatureStats();

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex items-start gap-4">
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-slate-900 text-white">
            <Shield className="h-6 w-6" />
          </div>

          <div className="min-w-0">
            <p className="text-sm font-medium text-slate-500">Início / Admin</p>
            <h1 className="mt-1 text-2xl font-semibold text-slate-900">
              Administração
            </h1>
            <p className="mt-2 text-sm leading-relaxed text-slate-600">
              Acesse rapidamente as funcionalidades administrativas disponíveis
              para o seu perfil.
            </p>

            <div className="mt-4 flex flex-wrap gap-2">
              <span className="rounded-full bg-slate-100 px-3 py-1 text-sm text-slate-700">
                Perfil: {user?.level ?? "-"}
              </span>
              <span className="rounded-full bg-slate-100 px-3 py-1 text-sm text-slate-700">
                Funcionalidades: {availableFeatures.length}
              </span>
              <span className="rounded-full bg-red-50 px-3 py-1 text-sm text-red-700">
                Favoritos: {favoriteKeys.length}
              </span>
            </div>
          </div>
        </div>
      </section>

      <AdminFavorites
        features={availableFeatures}
        favoriteKeys={favoriteKeys}
        onToggleFavorite={toggleFavorite}
        stats={stats}
      />

      <AdminFeatureGrid
        features={availableFeatures}
        favoriteKeys={favoriteKeys}
        onToggleFavorite={toggleFavorite}
        stats={stats}
      />
    </div>
  );
}