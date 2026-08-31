import { OG_FEATURES, WHY_LISA } from "@/lib/publicCopy";

export default function WhyLisa() {
  return (
    <div>
      <ul className="grid gap-4 sm:grid-cols-2">
        {WHY_LISA.map((item) => (
          <li key={item.title} className="rounded-2xl border border-purple-light bg-white p-5">
            <h3 className="font-semibold text-purple-dark">{item.title}</h3>
            <p className="mt-2 text-sm leading-relaxed">{item.body}</p>
          </li>
        ))}
      </ul>
      <ul className="mt-6 flex flex-wrap gap-2">
        {OG_FEATURES.map((item) => (
          <li key={item} className="rounded-full bg-cream px-3 py-1 text-sm font-medium text-purple-dark">{item}</li>
        ))}
      </ul>
    </div>
  );
}
