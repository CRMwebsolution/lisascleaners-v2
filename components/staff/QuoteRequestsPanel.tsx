"use client";

import type { QuoteRequest } from "@/lib/types";

export default function QuoteRequestsPanel({
  requests,
  onCreate,
  onStatus,
}: {
  requests: QuoteRequest[];
  onCreate: (req: QuoteRequest) => void;
  onStatus: (id: string, status: QuoteRequest["status"]) => void;
}) {
  return (
    <section>
      <h1 className="text-2xl font-bold text-purple-dark">Quote requests</h1>
      <ul className="mt-4 space-y-3">
        {requests.length === 0 ? <li className="rounded-md bg-white p-4 text-sm">No requests yet.</li> : null}
        {requests.map((req) => (
          <li key={req.id} className="rounded-md border border-purple-light bg-white p-4">
            <div className="flex justify-between gap-2">
              <p className="font-semibold text-purple-dark">{req.name}</p>
              <span className="text-xs uppercase text-purple-mid">{req.status}</span>
            </div>
            <p className="text-sm">{req.phone} {req.email ? `· ${req.email}` : ""}</p>
            <p className="text-sm">{req.job_address}</p>
            <p className="text-sm">{req.type_of_clean}{req.preferred_date ? ` · ${req.preferred_date}` : ""}{req.quote_time ? ` · ${req.quote_time}` : ""}</p>
            {req.notes ? <p className="mt-2 whitespace-pre-wrap text-sm">{req.notes}</p> : null}
            <div className="mt-3 flex flex-wrap gap-2">
              <button type="button" className="tap rounded-md bg-purple-mid px-3 text-sm font-semibold text-white" onClick={() => onCreate(req)}>Create job from request</button>
              {(["new", "contacted", "booked", "declined"] as const).map((status) => (
                <button
                  key={status}
                  type="button"
                  className={`tap rounded-md px-3 text-sm capitalize ${req.status === status ? "bg-purple-mid text-white" : "border border-purple-light bg-white text-purple-dark"}`}
                  onClick={() => onStatus(req.id, status)}
                >
                  {status}
                </button>
              ))}
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
