import { TOWNS } from "@/lib/site";

const MAP_SRC =
  "https://maps.google.com/maps?q=Carteret%20County%2C%20North%20Carolina&z=10&hl=en&output=embed";

export default function CoastalMap() {
  return (
    <div className="overflow-hidden rounded-2xl border border-purple-light bg-white">
      <div className="aspect-[16/10] min-h-[240px] bg-purple-soft">
        <iframe
          title="Map of Crystal Coast towns Lisa serves"
          src={MAP_SRC}
          className="h-full w-full border-0"
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          allowFullScreen
        />
      </div>
      <ul className="flex flex-wrap gap-2 border-t border-purple-light p-4">
        {TOWNS.map((town) => (
          <li key={town} className="rounded-full bg-purple-soft px-3 py-1 text-sm font-medium text-purple-dark">
            {town}
          </li>
        ))}
      </ul>
    </div>
  );
}
