import Link from "next/link";
import ServiceIcon from "@/components/ServiceIcon";
import { SERVICE_BENEFITS } from "@/lib/publicCopy";
import { SERVICES } from "@/lib/site";

export default function ServiceCards() {
  return (
    <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {SERVICES.map((service) => {
        const featured = service.slug === "vacation-rental";
        return (
          <li key={service.slug} className={featured ? "sm:col-span-2 lg:col-span-1" : undefined}>
            <Link href={`/services#${service.slug}`} className={`card-lift block h-full rounded-2xl border p-5 ${featured ? "border-purple-mid bg-cream shadow-sm" : "border-purple-light bg-white"}`}>
              <ServiceIcon slug={service.slug} />
              <h3 className="mt-3 text-lg font-semibold text-purple-dark">{service.slug === "vacation-rental" ? "Vacation rental turnovers" : service.label}</h3>
              <p className="mt-2 text-sm leading-relaxed">{SERVICE_BENEFITS[service.slug] ?? service.summary}</p>
              {featured ? <p className="mt-3 text-xs font-semibold uppercase tracking-wide text-purple-mid">Especially useful on the Crystal Coast</p> : null}
            </Link>
          </li>
        );
      })}
    </ul>
  );
}
