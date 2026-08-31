"use client";

import { useState } from "react";
import { format } from "date-fns";
import { downloadLisaPdf } from "@/lib/pdf";
import type { JobWithAssignments, QuoteRequest } from "@/lib/types";

const inputCls = "w-full rounded-md border border-purple-light px-3 py-2 text-sm";
const labelCls = "mb-1 block text-sm font-semibold text-purple-dark";

type Line = { item: string; qty: string; price: string };

export default function DocumentsPanel({
  jobs,
  requests,
}: {
  jobs: JobWithAssignments[];
  requests: QuoteRequest[];
}) {
  const [kind, setKind] = useState<"quote" | "invoice">("quote");
  const [customer, setCustomer] = useState("");
  const [address, setAddress] = useState("");
  const [number, setNumber] = useState("001");
  const [lines, setLines] = useState<Line[]>([{ item: "Cleaning", qty: "1", price: "" }]);
  const [includeThanks, setIncludeThanks] = useState(true);

  function updateLine(index: number, field: keyof Line, value: string) {
    setLines((prev) => prev.map((line, i) => (i === index ? { ...line, [field]: value } : line)));
  }

  const total = lines.reduce((sum, line) => sum + (Number(line.qty) || 0) * (Number(line.price) || 0), 0);

  return (
    <section className="max-w-2xl rounded-md bg-white p-4">
      <h1 className="text-2xl font-bold text-purple-dark">Quote / invoice PDF</h1>
      <p className="mt-1 text-sm">Quotes are never labeled Invoice. Add one row per service.</p>
      <div className="mt-4 space-y-3">
        <div>
          <label className={labelCls} htmlFor="pdf-kind">Document type</label>
          <select id="pdf-kind" className={inputCls} value={kind} onChange={(e) => setKind(e.target.value as "quote" | "invoice")}>
            <option value="quote">Quote</option>
            <option value="invoice">Invoice</option>
          </select>
        </div>
        <div>
          <label className={labelCls} htmlFor="pdf-prefill">Prefill from a job or request</label>
          <select id="pdf-prefill" className={inputCls} onChange={(e) => {
            const job = jobs.find((row) => row.id === e.target.value);
            const req = requests.find((row) => row.id === e.target.value);
            if (job) {
              setCustomer(job.customer_name);
              setAddress(job.address);
              setLines([{ item: job.type_of_clean, qty: "1", price: job.price != null ? String(job.price) : "" }]);
            } else if (req) {
              setCustomer(req.name);
              setAddress(req.job_address);
              setLines([{ item: req.type_of_clean, qty: "1", price: "" }]);
            }
          }}>
            <option value="">Choose a job or request</option>
            {jobs.map((job) => <option key={job.id} value={job.id}>Job: {job.customer_name}</option>)}
            {requests.map((req) => <option key={req.id} value={req.id}>Request: {req.name}</option>)}
          </select>
        </div>
        <div>
          <label className={labelCls} htmlFor="pdf-number">Quote / invoice number</label>
          <input id="pdf-number" className={inputCls} value={number} onChange={(e) => setNumber(e.target.value)} />
        </div>
        <div>
          <label className={labelCls} htmlFor="pdf-customer">Customer name</label>
          <input id="pdf-customer" className={inputCls} value={customer} onChange={(e) => setCustomer(e.target.value)} />
        </div>
        <div>
          <label className={labelCls} htmlFor="pdf-address">Job address</label>
          <input id="pdf-address" className={inputCls} value={address} onChange={(e) => setAddress(e.target.value)} />
        </div>
        <div>
          <div className="mb-2 flex items-center justify-between">
            <p className={labelCls}>Line items</p>
            <button type="button" className="tap rounded-md bg-purple-mid px-3 text-sm font-semibold text-white" onClick={() => setLines((prev) => [...prev, { item: "", qty: "1", price: "" }])}>
              Add item
            </button>
          </div>
          <div className="space-y-3">
            {lines.map((line, index) => {
              const amount = (Number(line.qty) || 0) * (Number(line.price) || 0);
              return (
                <div key={index} className="rounded-md border border-purple-light p-3">
                  <div className="mb-2 flex items-center justify-between">
                    <p className="text-xs font-semibold uppercase text-purple-mid">Item {index + 1}</p>
                    {lines.length > 1 ? (
                      <button type="button" className="text-sm text-red-700" onClick={() => setLines((prev) => prev.filter((_, i) => i !== index))}>Remove</button>
                    ) : null}
                  </div>
                  <div className="grid gap-2 sm:grid-cols-[minmax(0,1fr)_88px_110px]">
                    <div>
                      <label className={labelCls} htmlFor={`pdf-item-${index}`}>Item / service</label>
                      <input id={`pdf-item-${index}`} className={inputCls} value={line.item} onChange={(e) => updateLine(index, "item", e.target.value)} placeholder="Residential clean" />
                    </div>
                    <div>
                      <label className={labelCls} htmlFor={`pdf-qty-${index}`}>Qty</label>
                      <input id={`pdf-qty-${index}`} className={inputCls} type="number" min="1" value={line.qty} onChange={(e) => updateLine(index, "qty", e.target.value)} />
                    </div>
                    <div>
                      <label className={labelCls} htmlFor={`pdf-price-${index}`}>Price</label>
                      <input id={`pdf-price-${index}`} className={inputCls} type="number" min="0" step="0.01" value={line.price} onChange={(e) => updateLine(index, "price", e.target.value)} />
                    </div>
                  </div>
                  <p className="mt-2 text-right text-sm font-semibold text-purple-dark">Line total ${amount.toFixed(2)}</p>
                </div>
              );
            })}
          </div>
          <p className="mt-3 text-right text-base font-bold text-purple-dark">Total ${total.toFixed(2)}</p>
        </div>
        <label className="flex items-center gap-2 text-sm font-semibold text-purple-dark">
          <input type="checkbox" className="h-4 w-4 accent-purple-mid" checked={includeThanks} onChange={(e) => setIncludeThanks(e.target.checked)} />
          Include &quot;Thank You&quot; message in PDF
        </label>
        <button
          type="button"
          className="tap rounded-md bg-purple-mid px-4 text-sm font-semibold text-white"
          onClick={() => downloadLisaPdf({
            kind,
            number,
            customer,
            address,
            date: format(new Date(), "yyyy-MM-dd"),
            lines: lines.map((line) => ({ item: line.item.trim() || "Cleaning", qty: Number(line.qty) || 1, price: Number(line.price) || 0 })),
            includeThanks,
          })}
        >
          Download {kind === "quote" ? "quote" : "invoice"} PDF
        </button>
      </div>
    </section>
  );
}
