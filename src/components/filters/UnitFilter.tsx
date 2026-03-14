import type { Unit } from "@/types/unit";

type UnitFilterProps = {
  units: Unit[];
  value: string;
  onChange: (value: string) => void;
};

export function UnitFilter({ units, value, onChange }: UnitFilterProps) {
  return (
    <div className="rounded-2xl border bg-white p-4">
      <label
        htmlFor="unit-filter"
        className="mb-2 block text-sm font-medium text-slate-700"
      >
        Filtrar por expansão
      </label>

      <select
        id="unit-filter"
        value={value}
        onChange={(e) => onChange(String(e.target.value))}
        className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-sm outline-none focus:border-slate-500"
      >
        <option value="">Todas as expansões</option>

        {units.map((unit) => (
          <option key={String(unit.id)} value={String(unit.id)}>
            {unit.name} - {unit.city}
          </option>
        ))}
      </select>
    </div>
  );
}