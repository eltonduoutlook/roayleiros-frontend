import { useEffect, useMemo, useState } from "react";
import type {
  AdminFeature,
  AdminFeatureCategory,
} from "@/data/adminFeatures";
import type { AdminFeatureStatsMap } from "@/hooks/useAdminFeatureStats";
import { AdminFeatureCard } from "./AdminFeatureCard";

interface AdminFeatureGridProps {
  features: AdminFeature[];
  favoriteKeys: string[];
  onToggleFavorite: (key: string) => void;
  stats?: AdminFeatureStatsMap;
}

const ITEMS_PER_PAGE = 12;
const ALL_CATEGORIES = "Todas";

export function AdminFeatureGrid({
  features,
  favoriteKeys,
  onToggleFavorite,
  stats,
}: AdminFeatureGridProps) {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] =
    useState<AdminFeatureCategory | typeof ALL_CATEGORIES>(ALL_CATEGORIES);

  const categories = useMemo(() => {
    const unique = Array.from(new Set(features.map((feature) => feature.category)));
    return [ALL_CATEGORIES, ...unique];
  }, [features]);

  const filteredFeatures = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    return features.filter((feature) => {
      const matchesCategory =
        selectedCategory === ALL_CATEGORIES ||
        feature.category === selectedCategory;

      const matchesSearch =
        normalizedSearch.length === 0 ||
        feature.title.toLowerCase().includes(normalizedSearch) ||
        feature.description.toLowerCase().includes(normalizedSearch) ||
        feature.category.toLowerCase().includes(normalizedSearch);

      return matchesCategory && matchesSearch;
    });
  }, [features, search, selectedCategory]);

  useEffect(() => {
    setPage(1);
  }, [search, selectedCategory]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredFeatures.length / ITEMS_PER_PAGE)
  );

  useEffect(() => {
    if (page > totalPages) {
      setPage(totalPages);
    }
  }, [page, totalPages]);

  const paginatedFeatures = useMemo(() => {
    const start = (page - 1) * ITEMS_PER_PAGE;
    const end = start + ITEMS_PER_PAGE;
    return filteredFeatures.slice(start, end);
  }, [filteredFeatures, page]);

  const pageNumbers = useMemo(() => {
    const maxVisible = 5;

    if (totalPages <= maxVisible) {
      return Array.from({ length: totalPages }, (_, index) => index + 1);
    }

    if (page <= 3) {
      return [1, 2, 3, 4, 5];
    }

    if (page >= totalPages - 2) {
      return [
        totalPages - 4,
        totalPages - 3,
        totalPages - 2,
        totalPages - 1,
        totalPages,
      ];
    }

    return [page - 2, page - 1, page, page + 1, page + 2];
  }, [page, totalPages]);

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h2 className="text-base font-semibold text-slate-900">
            Funcionalidades
          </h2>
          <p className="text-sm text-slate-600">
            Recursos disponíveis para o seu perfil.
          </p>
        </div>

        <div className="rounded-full bg-slate-100 px-3 py-1 text-sm text-slate-600">
          {filteredFeatures.length} item(ns)
        </div>
      </div>

      <div className="mt-5 grid grid-cols-1 gap-3 lg:grid-cols-[minmax(0,1fr)_220px]">
        <input
          type="text"
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Buscar funcionalidade..."
          className="h-11 rounded-xl border border-slate-300 px-4 text-sm text-slate-700 outline-none transition focus:border-slate-400"
        />

        <select
          value={selectedCategory}
          onChange={(event) =>
            setSelectedCategory(
              event.target.value as AdminFeatureCategory | typeof ALL_CATEGORIES
            )
          }
          className="h-11 rounded-xl border border-slate-300 px-4 text-sm text-slate-700 outline-none transition focus:border-slate-400"
        >
          {categories.map((category) => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </select>
      </div>

      {filteredFeatures.length === 0 ? (
        <div className="mt-5 rounded-xl border border-dashed border-slate-300 bg-slate-50 px-4 py-10 text-center text-sm text-slate-600">
          Nenhuma funcionalidade encontrada para o filtro informado.
        </div>
      ) : (
        <>
          <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            {paginatedFeatures.map((feature) => (
              <AdminFeatureCard
                key={feature.key}
                feature={feature}
                isFavorite={favoriteKeys.includes(feature.key)}
                onToggleFavorite={onToggleFavorite}
                statLabel={stats?.[feature.key]?.label}
              />
            ))}
          </div>

          <div className="mt-6 flex flex-col gap-3 border-t border-slate-200 pt-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-slate-600">
              Mostrando{" "}
              <span className="font-medium text-slate-900">
                {paginatedFeatures.length}
              </span>{" "}
              de{" "}
              <span className="font-medium text-slate-900">
                {filteredFeatures.length}
              </span>{" "}
              registros — Página{" "}
              <span className="font-medium text-slate-900">{page}</span> de{" "}
              <span className="font-medium text-slate-900">{totalPages}</span>
            </p>

            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => setPage(1)}
                disabled={page === 1}
                className="rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-600 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {"<<"}
              </button>

              <button
                type="button"
                onClick={() => setPage((current) => Math.max(1, current - 1))}
                disabled={page === 1}
                className="rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-600 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {"<"}
              </button>

              {pageNumbers[0] > 1 && (
                <>
                  <button
                    type="button"
                    onClick={() => setPage(1)}
                    className="rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-600"
                  >
                    1
                  </button>
                  {pageNumbers[0] > 2 && (
                    <span className="px-1 text-sm text-slate-500">...</span>
                  )}
                </>
              )}

              {pageNumbers.map((pageNumber) => (
                <button
                  key={pageNumber}
                  type="button"
                  onClick={() => setPage(pageNumber)}
                  className={[
                    "rounded-md border px-3 py-2 text-sm",
                    pageNumber === page
                      ? "border-slate-900 bg-slate-900 text-white"
                      : "border-slate-300 text-slate-600",
                  ].join(" ")}
                >
                  {pageNumber}
                </button>
              ))}

              {pageNumbers[pageNumbers.length - 1] < totalPages && (
                <>
                  {pageNumbers[pageNumbers.length - 1] < totalPages - 1 && (
                    <span className="px-1 text-sm text-slate-500">...</span>
                  )}
                  <button
                    type="button"
                    onClick={() => setPage(totalPages)}
                    className="rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-600"
                  >
                    {totalPages}
                  </button>
                </>
              )}

              <button
                type="button"
                onClick={() =>
                  setPage((current) => Math.min(totalPages, current + 1))
                }
                disabled={page === totalPages}
                className="rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-600 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {">"}
              </button>

              <button
                type="button"
                onClick={() => setPage(totalPages)}
                disabled={page === totalPages}
                className="rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-600 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {">>"}
              </button>
            </div>
          </div>
        </>
      )}
    </section>
  );
}