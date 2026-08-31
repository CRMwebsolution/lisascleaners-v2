export const SERVICE_COLORS: Record<string, string> = {
  "Residential Cleaning": "bg-purple-100 text-purple-800 border-purple-200",
  Residential: "bg-purple-100 text-purple-800 border-purple-200",
  "Office Cleaning": "bg-green-100 text-green-800 border-green-200",
  Office: "bg-green-100 text-green-800 border-green-200",
  "Deep Cleaning": "bg-orange-100 text-orange-800 border-orange-200",
  "Deep clean": "bg-orange-100 text-orange-800 border-orange-200",
  "Move-In / Move-Out Cleaning": "bg-purple-100 text-purple-800 border-purple-200",
  "Move in/out": "bg-purple-100 text-purple-800 border-purple-200",
  "Recurring Cleaning": "bg-cyan-100 text-cyan-800 border-cyan-200",
  Recurring: "bg-cyan-100 text-cyan-800 border-cyan-200",
  "Window & Floor Care": "bg-yellow-100 text-yellow-800 border-yellow-200",
  "Window and floor": "bg-yellow-100 text-yellow-800 border-yellow-200",
  "Vacation rental": "bg-rose-100 text-rose-800 border-rose-200",
};

export const SERVICE_LEGEND = [
  { name: "Residential Cleaning", colorClass: "bg-purple-100 border-purple-200" },
  { name: "Office Cleaning", colorClass: "bg-green-100 border-green-200" },
  { name: "Deep Cleaning", colorClass: "bg-orange-100 border-orange-200" },
  { name: "Move-In / Move-Out Cleaning", colorClass: "bg-purple-100 border-purple-200" },
  { name: "Recurring Cleaning", colorClass: "bg-cyan-100 border-cyan-200" },
  { name: "Window & Floor Care", colorClass: "bg-yellow-100 border-yellow-200" },
  { name: "Vacation rental", colorClass: "bg-rose-100 border-rose-200" },
  { name: "Other", colorClass: "bg-gray-100 border-gray-200" },
] as const;

export function normalizeServiceName(value: string | null | undefined) {
  const raw = (value ?? "").trim();
  const n = raw.toLowerCase();
  if (n.includes("office")) return "Office Cleaning";
  if (n.includes("deep")) return "Deep Cleaning";
  if (n.includes("move")) return "Move-In / Move-Out Cleaning";
  if (n.includes("recur")) return "Recurring Cleaning";
  if (n.includes("window") || n.includes("floor")) return "Window & Floor Care";
  if (n.includes("vacation") || n.includes("rental")) return "Vacation rental";
  if (n.includes("resident")) return "Residential Cleaning";
  return raw || "Other";
}

export function getServiceColor(value: string | null | undefined) {
  const raw = (value ?? "").trim();
  return SERVICE_COLORS[raw] ?? SERVICE_COLORS[normalizeServiceName(raw)] ?? "bg-gray-100 text-gray-800 border-gray-200";
}
