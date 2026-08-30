"use client";

import { FormEvent, useMemo, useState } from "react";
import {
  CLEANING_SCHEDULE_OPTIONS,
  isAllowedQuoteDate,
  isTypeOfClean,
  isUsPhone,
  JOB_SERVICE_TYPES,
  PREFERRED_DATE_HELPER,
  QUOTE_ERROR,
  QUOTE_SUCCESS,
  QUOTE_TIME_OPTIONS,
} from "@/lib/site";

type Status = "idle" | "submitting" | "success" | "error";

const EMPTY = {
  name: "",
  email: "",
  phone: "",
  address: "",
  quoteDate: "",
  quoteTime: "",
  cleaningSchedule: "",
  cleaningTime: "",
  serviceType: "",
  message: "",
  consent: false,
  website: "",
};

export default function QuoteForm() {
  const [form, setForm] = useState(EMPTY);
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [status, setStatus] = useState<Status>("idle");
  const [errorText, setErrorText] = useState(QUOTE_ERROR);

  const errors = useMemo(() => {
    const next: Record<string, string> = {};
    if (form.name.trim().length < 2) next.name = "Required";
    if (form.phone && !isUsPhone(form.phone)) next.phone = "Invalid phone";
    if (!form.phone.trim()) next.phone = "Required";
    if (form.address.trim().length < 5) next.address = "Required";
    if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
      next.email = "Invalid email";
    }
    if (!form.quoteDate) next.quoteDate = "Required";
    else if (!isAllowedQuoteDate(form.quoteDate)) next.quoteDate = "Use Fri–Mon";
    if (!form.quoteTime) next.quoteTime = "Required";
    if (!form.cleaningSchedule) next.cleaningSchedule = "Required";
    if (!form.cleaningTime) next.cleaningTime = "Required";
    if (!form.serviceType || !isTypeOfClean(form.serviceType)) next.serviceType = "Required";
    if (!form.consent) next.consent = "Required";
    return next;
  }, [form]);

  function setField<K extends keyof typeof EMPTY>(name: K, value: (typeof EMPTY)[K]) {
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  function fieldClass(name: string) {
    const base = "tap w-full rounded-md border bg-white px-3 text-base text-ink";
    if (!touched[name]) return `${base} border-purple-light`;
    return errors[name] ? `${base} border-red-500` : `${base} border-purple-mid`;
  }

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setTouched({
      name: true,
      email: true,
      phone: true,
      address: true,
      quoteDate: true,
      quoteTime: true,
      cleaningSchedule: true,
      cleaningTime: true,
      serviceType: true,
      consent: true,
    });
    if (Object.keys(errors).length > 0 || form.website) {
      if (form.website) return;
      setErrorText(QUOTE_ERROR);
      setStatus("error");
      return;
    }
    setStatus("submitting");
    setErrorText(QUOTE_ERROR);
    const payload = {
      name: form.name.trim(),
      email: form.email.trim(),
      phone: form.phone.trim(),
      job_address: form.address.trim(),
      type_of_clean: form.serviceType,
      preferred_date: form.quoteDate,
      quote_time: form.quoteTime,
      cleaning_schedule: form.cleaningSchedule,
      cleaning_time: form.cleaningTime,
      notes: form.message.trim(),
      consent: true,
      source: "lisascleaners",
    };
    try {
      const res = await fetch("/api/quote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const body = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) {
        setErrorText(body.error || QUOTE_ERROR);
        setStatus("error");
        return;
      }
      setForm(EMPTY);
      setTouched({});
      setStatus("success");
    } catch {
      setErrorText(QUOTE_ERROR);
      setStatus("error");
    }
  }

  const labelClass = "mb-1 block text-sm font-semibold text-purple-dark";

  if (status === "success") {
    return (
      <div className="rounded-md bg-purple-soft p-6 text-center" role="status">
        <p className="text-lg font-semibold text-purple-dark">Request received</p>
        <p className="mt-2 text-sm">{QUOTE_SUCCESS}</p>
        <button
          type="button"
          className="tap mt-4 inline-flex items-center justify-center rounded-md bg-purple-mid px-4 text-sm font-semibold text-white hover:bg-purple-dark"
          onClick={() => setStatus("idle")}
        >
          Request another quote
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-5" noValidate>
      <div className="hidden" aria-hidden="true">
        <label htmlFor="website">Website</label>
        <input id="website" name="website" tabIndex={-1} autoComplete="off" value={form.website} onChange={(e) => setField("website", e.target.value)} />
      </div>
      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <label htmlFor="name" className={labelClass}>Full name</label>
          <input id="name" name="name" type="text" autoComplete="name" required value={form.name} onBlur={() => setTouched((t) => ({ ...t, name: true }))} onChange={(e) => setField("name", e.target.value)} className={fieldClass("name")} placeholder="Your name" />
        </div>
        <div>
          <label htmlFor="email" className={labelClass}>Email (optional)</label>
          <input id="email" name="email" type="email" autoComplete="email" value={form.email} onBlur={() => setTouched((t) => ({ ...t, email: true }))} onChange={(e) => setField("email", e.target.value)} className={fieldClass("email")} placeholder="your@email.com" />
        </div>
        <div>
          <label htmlFor="phone" className={labelClass}>Phone number</label>
          <input id="phone" name="phone" type="tel" autoComplete="tel" required value={form.phone} onBlur={() => setTouched((t) => ({ ...t, phone: true }))} onChange={(e) => setField("phone", e.target.value)} className={fieldClass("phone")} placeholder="(252) 555-1234" />
        </div>
        <div>
          <label htmlFor="address" className={labelClass}>Address</label>
          <input id="address" name="address" type="text" autoComplete="street-address" required value={form.address} onBlur={() => setTouched((t) => ({ ...t, address: true }))} onChange={(e) => setField("address", e.target.value)} className={fieldClass("address")} placeholder="123 Beach Dr, Emerald Isle, NC" />
        </div>
        <div>
          <label htmlFor="quoteDate" className={labelClass}>Quote date</label>
          <input id="quoteDate" name="quoteDate" type="date" required value={form.quoteDate} onBlur={() => setTouched((t) => ({ ...t, quoteDate: true }))} onChange={(e) => setField("quoteDate", e.target.value)} className={fieldClass("quoteDate")} />
          <p className="mt-1 text-sm">{PREFERRED_DATE_HELPER}</p>
        </div>
        <div>
          <label htmlFor="quoteTime" className={labelClass}>Quote time</label>
          <select id="quoteTime" name="quoteTime" required value={form.quoteTime} onBlur={() => setTouched((t) => ({ ...t, quoteTime: true }))} onChange={(e) => setField("quoteTime", e.target.value)} className={fieldClass("quoteTime")}>
            <option value="">Select a time</option>
            {QUOTE_TIME_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="cleaningSchedule" className={labelClass}>Cleaning schedule</label>
          <select id="cleaningSchedule" name="cleaningSchedule" required value={form.cleaningSchedule} onBlur={() => setTouched((t) => ({ ...t, cleaningSchedule: true }))} onChange={(e) => setField("cleaningSchedule", e.target.value)} className={fieldClass("cleaningSchedule")}>
            <option value="">Select frequency</option>
            {CLEANING_SCHEDULE_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="cleaningTime" className={labelClass}>Cleaning time</label>
          <select id="cleaningTime" name="cleaningTime" required value={form.cleaningTime} onBlur={() => setTouched((t) => ({ ...t, cleaningTime: true }))} onChange={(e) => setField("cleaningTime", e.target.value)} className={fieldClass("cleaningTime")}>
            <option value="">Select a time</option>
            {QUOTE_TIME_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>
        </div>
      </div>
      <div>
        <label htmlFor="serviceType" className={labelClass}>Service type</label>
        <select id="serviceType" name="serviceType" required value={form.serviceType} onBlur={() => setTouched((t) => ({ ...t, serviceType: true }))} onChange={(e) => setField("serviceType", e.target.value)} className={fieldClass("serviceType")}>
          <option value="">Select a service</option>
          {JOB_SERVICE_TYPES.map((label) => (
            <option key={label} value={label}>{label}</option>
          ))}
          <option value="Other">Other (explain in comments)</option>
        </select>
      </div>
      <div>
        <label htmlFor="message" className={labelClass}>Special instructions</label>
        <textarea id="message" name="message" rows={4} value={form.message} onChange={(e) => setField("message", e.target.value)} className="w-full rounded-md border border-purple-light bg-white px-3 py-2 text-base text-ink" placeholder="Any special requests or notes..." />
      </div>
      <div className="flex items-start gap-3">
        <input id="consent" name="consent" type="checkbox" required checked={form.consent} onChange={(e) => setField("consent", e.target.checked)} className="mt-2 h-5 w-5 accent-purple-mid" />
        <label htmlFor="consent" className="text-sm">I agree that Lisa McNamara Cleaning Service may store this request so she can follow up. No payment information is collected. This is not a booking.</label>
      </div>
      {status === "error" ? (
        <p className="rounded-md border border-purple-mid p-4 text-sm font-medium text-purple-dark" role="alert">{errorText}</p>
      ) : null}
      <button type="submit" disabled={status === "submitting"} className="tap inline-flex w-full items-center justify-center rounded-md bg-purple-mid px-4 text-base font-semibold text-white hover:bg-purple-dark disabled:opacity-70 sm:w-auto">
        {status === "submitting" ? "Sending…" : "Request a Quote"}
      </button>
    </form>
  );
}
