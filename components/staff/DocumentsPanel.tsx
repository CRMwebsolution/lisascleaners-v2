"use client";

import { useState } from "react";
import { format } from "date-fns";
import { downloadLisaPdf } from "@/lib/pdf";
import type { JobWithAssignments, QuoteRequest } from "@/lib/types";

const inputCls = "w-full rounded-md border border-purple-light px-3 py-2 text-sm";
const labelCls = "mb-1 block text-sm font-semibold text-purple-dark";

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
  const [item, setItem] = useState("Cleaning");
  const [qty, setQty] = useState("1");
  const [price, setPrice] = useState("");
  const [includeThanks, setIncludeThanks] = useState(true);

  return (
    <section className="max-w-xl rounded-md bg-white p-4">
      <h1 className="text-2xl font-bold text-purple-dark">Quote / invoice PDF</h1>
      <p className="mt-1 text-sm">Quotes are never labeled Invoice.</p>
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
            if (job) { setCustomer(job.customer_name); setAddress(job.address); setPrice(job.price != null ? String(job.price) : ""); setItem(job.type_of_clean); }
            else if (req) { setCustomer(req.name); setAddress(req.job_address); setItem(req.type_of_clean); }
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
          <label className={labelCls} htmlFor="pdf-item">Line item / service</label>
          <input id="pdf-item" className={inputCls} value={item} onChange={(e) => setItem(e.target.value)} />
        </div>
        <div>
          <label className={labelCls} htmlFor="pdf-qty">Quantity</label>
          <input id="pdf-qty" className={inputCls} value={qty} onChange={(e) => setQty(e.target.value)} />
        </div>
        <div>
          <label className={labelCls} htmlFor="pdf-price">Price</label>
          <input id="pdf-price" className={inputCls} value={price} onChange={(e) => setPrice(e.target.value)} />
        </div>
        <label className="flex items-center gap-2 text-sm font-semibold text-purple-dark">
          <input type="checkbox" className="h-4 w-4 accent-purple-mid" checked={includeThanks} onChange={(e) => setIncludeThanks(e.target.checked)} />
          Include &quot;Thank You&quot; message in PDF
        </label>
        <button type="button" className="tap rounded-md bg-purple-mid px-4 text-sm font-semibold text-white" onClick={() => downloadLisaPdf({ kind, number, customer, address, date: format(new Date(), "yyyy-MM-dd"), lines: [{ item, qty: Number(qty) || 1, price: Number(price) || 0 }], includeThanks })}>
          Download {kind === "quote" ? "quote" : "invoice"} PDF
        </button>
      </div>
    </section>
  );
}
