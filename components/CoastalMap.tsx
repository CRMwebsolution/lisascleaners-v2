const GROUPS = [
  {
    title: "Based in",
    towns: ["Newport"],
  },
  {
    title: "Mainland towns",
    towns: ["Morehead City", "Beaufort", "Cape Carteret", "Swansboro"],
  },
  {
    title: "Crystal Coast beaches",
    towns: ["Emerald Isle", "Indian Beach", "Pine Knoll Shores", "Atlantic Beach", "Harkers Island"],
  },
] as const;

export default function CoastalMap() {
  return (
    <div className="overflow-hidden rounded-2xl border border-purple-light bg-white">
      <div className="bg-purple-soft px-4 py-3">
        <p className="text-sm font-semibold text-purple-dark">Towns Lisa serves</p>
        <p className="mt-1 text-sm">Newport is home base. The rest are regular service towns on the mainland and along Bogue Banks.</p>
      </div>
      <div className="grid gap-5 p-4 sm:grid-cols-3">
        {GROUPS.map((group) => (
          <div key={group.title}>
            <p className="text-xs font-semibold uppercase tracking-wide text-purple-mid">{group.title}</p>
            <ul className="mt-2 space-y-2">
              {group.towns.map((town) => (
                <li key={town} className="rounded-full bg-purple-soft px-3 py-1 text-sm font-medium text-purple-dark">
                  {town}
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}
