import type { Unit } from "@/types/unit";

type UnitFilterProps = {
  units: Unit[];
  value: string;
  onChange: (value: string) => void;
};

export function UnitFilter({ units, value, onChange }: UnitFilterProps) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <label
        htmlFor="unit-filter"
        className="mb-2 block text-sm font-medium text-slate-700"
      >
        Filtrar por unidade
      </label>

      <select
        id="unit-filter"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 transition-colors outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
      >
        <option value="">Todas as unidades</option>

        {units.map((unit) => (
          <option key={unit.id} value={unit.id}>
            {unit.city ? `${unit.name} - ${unit.city}` : unit.name}
          </option>
        ))}
      </select>
    </div>
  );
}