"use client";

import { useState } from "react";
import type { QuoteRequest, RequestStatus } from "@/lib/types";

export function declineReasonFrom(req: QuoteRequest) {
  if (req.decline_reason?.trim()) return req.decline_reason.trim();
  const match = req.notes?.match(/^Decline reason:\s*(.+)$/m);
  return match?.[1]?.trim() || "";
}

export default function QuoteRequestsPanel({
  requests,
  onCreate,
  onStatus,
}: {
  requests: QuoteRequest[];
  onCreate: (req: QuoteRequest) => void;
  onStatus: (id: string, status: RequestStatus, reason?: string) => void | Promise<void>;
}) {
  const [decliningId, setDecliningId] = useState<string | null>(null);
  const [reason, setReason] = useState("");
  const [reasonError, setReasonError] = useState<string | null>(null);

  function startDecline(req: QuoteRequest) {
    setDecliningId(req.id);
    setReason(declineReasonFrom(req));
    setReasonError(null);
  }

  function saveDecline(id: string) {
    const next = reason.trim();
    if (!next) {
      setReasonError("Add a reason before declining this request.");
      return;
    }
    setReasonError(null);
    setDecliningId(null);
    void onStatus(id, "declined", next);
  }

  return (
    <section>
      <h1 className="text-2xl font-bold text-purple-dark">Quote requests</h1>
      <ul className="mt-4 space-y-3">
        {requests.length === 0 ? <li className="rounded-md bg-white p-4 text-sm">No requests yet.</li> : null}
        {requests.map((req) => {
          const savedReason = declineReasonFrom(req);
          const isDeclining = decliningId === req.id;
          return (
            <li key={req.id} className="rounded-md border border-purple-light bg-white p-4">
              <div className="flex justify-between gap-2">
                <p className="font-semibold text-purple-dark">{req.name}</p>
                <span className="text-xs uppercase text-purple-mid">{req.status}</span>
              </div>
              <p className="text-sm">{req.phone} {req.email ? `· ${req.email}` : ""}</p>
              <p className="text-sm">{req.job_address}</p>
              <p className="text-sm">{req.type_of_clean}{req.preferred_date ? ` · ${req.preferred_date}` : ""}{req.quote_time ? ` · ${req.quote_time}` : ""}</p>
              {req.notes ? <p className="mt-2 whitespace-pre-wrap text-sm">{req.notes.replace(/^Decline reason:\s*.+$/m, "").trim()}</p> : null}
              {req.status === "declined" && savedReason && !isDeclining ? (
                <p className="mt-2 rounded-md bg-purple-soft p-2 text-sm text-purple-dark"><span className="font-semibold">Declined because:</span> {savedReason}</p>
              ) : null}
              <div className="mt-3 flex flex-wrap gap-2">
                <button type="button" className="tap rounded-md bg-purple-mid px-3 text-sm font-semibold text-white" onClick={() => onCreate(req)}>Create job from request</button>
                {(["new", "contacted", "booked"] as const).map((status) => (
                  <button
                    key={status}
                    type="button"
                    className={`tap rounded-md px-3 text-sm capitalize ${req.status === status ? "bg-purple-mid text-white" : "border border-purple-light bg-white text-purple-dark"}`}
                    onClick={() => {
                      setDecliningId(null);
                      void onStatus(req.id, status);
                    }}
                  >
                    {status}
                  </button>
                ))}
                <button
                  type="button"
                  className={`tap rounded-md px-3 text-sm capitalize ${req.status === "declined" || isDeclining ? "bg-purple-mid text-white" : "border border-purple-light bg-white text-purple-dark"}`}
                  onClick={() => startDecline(req)}
                >
                  declined
                </button>
              </div>
              {isDeclining ? (
                <div className="mt-3 rounded-md border border-purple-light p-3">
                  <label className="mb-1 block text-sm font-semibold text-purple-dark" htmlFor={`decline-${req.id}`}>Why is this request declined?</label>
                  <textarea
                    id={`decline-${req.id}`}
                    className="w-full rounded-md border border-purple-light px-3 py-2 text-sm"
                    rows={3}
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    placeholder="Outside service area, date not available, etc."
                  />
                  {reasonError ? <p className="mt-1 text-sm text-red-700">{reasonError}</p> : null}
                  <div className="mt-2 flex gap-2">
                    <button type="button" className="tap rounded-md bg-purple-mid px-3 text-sm font-semibold text-white" onClick={() => saveDecline(req.id)}>Save decline</button>
                    <button type="button" className="tap rounded-md bg-purple-soft px-3 text-sm" onClick={() => { setDecliningId(null); setReasonError(null); }}>Cancel</button>
                  </div>
                </div>
              ) : null}
            </li>
          );
        })}
      </ul>
    </section>
  );
}
