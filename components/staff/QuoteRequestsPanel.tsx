"use client";

import { useState } from "react";
import type { QuoteRequest, RequestStatus } from "@/lib/types";

function cleanText(value: string | null | undefined) {
  const text = (value ?? "").trim();
  if (!text || text.toLowerCase() === "null" || text.toLowerCase() === "undefined") return "";
  return text;
}

export function declineReasonFrom(req: QuoteRequest) {
  const column = cleanText(req.decline_reason);
  if (column) return column;
  const match = req.notes?.match(/^Decline reason:\s*(.+)$/m);
  return cleanText(match?.[1]);
}

export default function QuoteRequestsPanel({
  requests,
  onCreate,
  onStatus,
  onDelete,
}: {
  requests: QuoteRequest[];
  onCreate: (req: QuoteRequest) => void;
  onStatus: (id: string, status: RequestStatus, reason?: string) => void | Promise<void>;
  onDelete?: (id: string) => void | Promise<void>;
}) {
  const [decliningId, setDecliningId] = useState<string | null>(null);
  const [reason, setReason] = useState("");
  const [pendingDelete, setPendingDelete] = useState<QuoteRequest | null>(null);

  function startDecline(req: QuoteRequest) {
    setDecliningId(req.id);
    setReason(declineReasonFrom(req));
  }

  function saveDecline(id: string) {
    setDecliningId(null);
    void onStatus(id, "declined", cleanText(reason) || undefined);
  }

  return (
    <section>
      <h1 className="text-2xl font-bold text-purple-dark">Quote requests</h1>
      <ul className="mt-4 space-y-3">
        {requests.length === 0 ? <li className="rounded-md bg-white p-4 text-sm">No requests yet.</li> : null}
        {requests.map((req) => {
          const savedReason = declineReasonFrom(req);
          const isDeclining = decliningId === req.id;
          const visibleNotes = cleanText((req.notes ?? "").replace(/^Decline reason:\s*.+$/m, ""));
          return (
            <li key={req.id} className="rounded-md border border-purple-light bg-white p-4">
              <div className="flex justify-between gap-2">
                <p className="font-semibold text-purple-dark">{req.name}</p>
                <span className="text-xs uppercase text-purple-mid">{req.status}</span>
              </div>
              <p className="text-sm">{req.phone} {req.email ? `· ${req.email}` : ""}</p>
              <p className="text-sm">{req.job_address}</p>
              <p className="text-sm">{req.type_of_clean}{req.preferred_date ? ` · ${req.preferred_date}` : ""}{req.quote_time ? ` · ${req.quote_time}` : ""}</p>
              {visibleNotes ? <p className="mt-2 whitespace-pre-wrap text-sm">{visibleNotes}</p> : null}
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
                {onDelete ? (
                  <button type="button" className="tap rounded-md px-3 text-sm text-red-700" onClick={() => setPendingDelete(req)}>Delete</button>
                ) : null}
              </div>
              {isDeclining ? (
                <div className="mt-3 rounded-md border border-purple-light p-3">
                  <label className="mb-1 block text-sm font-semibold text-purple-dark" htmlFor={`decline-${req.id}`}>Reason (optional)</label>
                  <textarea
                    id={`decline-${req.id}`}
                    className="w-full rounded-md border border-purple-light px-3 py-2 text-sm"
                    rows={3}
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    placeholder="Outside service area, date not available, etc."
                  />
                  <div className="mt-2 flex gap-2">
                    <button type="button" className="tap rounded-md bg-purple-mid px-3 text-sm font-semibold text-white" onClick={() => saveDecline(req.id)}>Save decline</button>
                    <button type="button" className="tap rounded-md bg-purple-soft px-3 text-sm" onClick={() => setDecliningId(null)}>Cancel</button>
                  </div>
                </div>
              ) : null}
            </li>
          );
        })}
      </ul>
      {pendingDelete ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-5">
            <h2 className="text-lg font-semibold text-purple-dark">Delete this request?</h2>
            <p className="mt-2 text-sm">{pendingDelete.name}{pendingDelete.preferred_date ? ` · ${pendingDelete.preferred_date}` : ""}</p>
            <p className="mt-1 text-sm text-gray-600">This removes the quote request. It does not delete a job if one was already created.</p>
            <div className="mt-4 flex gap-2">
              <button type="button" className="tap flex-1 rounded-md bg-gray-100 py-2" onClick={() => setPendingDelete(null)}>Keep request</button>
              <button
                type="button"
                className="tap flex-1 rounded-md bg-red-700 py-2 font-semibold text-white"
                onClick={() => {
                  const id = pendingDelete.id;
                  setPendingDelete(null);
                  void onDelete?.(id);
                }}
              >
                Delete request
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}
