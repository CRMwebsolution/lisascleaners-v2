import { TOWNS } from "@/lib/site";

const pins = [
  { name: "Swansboro", x: 18, y: 42 },
  { name: "Cape Carteret", x: 28, y: 48 },
  { name: "Emerald Isle", x: 42, y: 70 },
  { name: "Indian Beach", x: 52, y: 66 },
  { name: "Pine Knoll Shores", x: 62, y: 62 },
  { name: "Atlantic Beach", x: 72, y: 60 },
  { name: "Morehead City", x: 68, y: 42 },
  { name: "Newport", x: 50, y: 34 },
  { name: "Beaufort", x: 82, y: 46 },
  { name: "Harkers Island", x: 90, y: 58 },
];

export default function CoastalMap() {
  return (
    <div className="overflow-hidden rounded-2xl border border-purple-light bg-white">
      <svg viewBox="0 0 100 86" className="h-auto w-full" role="img" aria-label="Map of Crystal Coast towns Lisa serves">
        <rect width="100" height="86" fill="#f5f3ff" />
        <path d="M0 58 C18 52, 30 68, 48 64 C62 61, 74 54, 100 58 L100 86 L0 86 Z" fill="#ddd6fe" />
        <path d="M0 70 C22 64, 40 76, 58 72 C74 69, 86 64, 100 68 L100 86 L0 86 Z" fill="#c4b5fd" />
        <path d="M8 40 C22 28, 38 24, 54 30 C66 22, 80 26, 94 34" fill="none" stroke="#3b0764" strokeWidth="0.6" strokeDasharray="1.2 1.2" />
        {pins.map((pin) => (
          <g key={pin.name}>
            <circle cx={pin.x} cy={pin.y} r={pin.name === "Newport" ? 2.2 : 1.6} fill={pin.name === "Newport" ? "#3b0764" : "#5b21b6"} />
            <text x={pin.x} y={pin.y - 3} textAnchor="middle" fontSize="3.1" fill="#3b0764" fontFamily="Georgia, serif">{pin.name}</text>
          </g>
        ))}
      </svg>
      <ul className="flex flex-wrap gap-2 border-t border-purple-light p-4">
        {TOWNS.map((town) => (
          <li key={town} className="rounded-full bg-purple-soft px-3 py-1 text-sm font-medium text-purple-dark">{town}</li>
        ))}
      </ul>
    </div>
  );
}
