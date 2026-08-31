"use client";

import { FormEvent, useMemo, useState } from "react";
import {
  addDays,
  addMonths,
  format,
  isBefore,
  isSameDay,
  parseISO,
  startOfDay,
  startOfMonth,
  startOfWeek,
} from "date-fns";
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

function isoDay(date: Date) {
  return format(date, "yyyy-MM-dd");
}

function QuoteDatePicker({
  value,
  invalid,
  onChange,
}: {
  value: string;
  invalid: boolean;
  onChange: (iso: string) => void;
}) {
  const selected = value ? parseISO(`${value}T12:00:00`) : null;
  const [month, setMonth] = useState(() => startOfMonth(selected && !Number.isNaN(selected.getTime()) ? selected : new Date()));
  const today = startOfDay(new Date());
  const days = useMemo(() => Array.from({ length: 42 }, (_, i) => addDays(startOfWeek(month), i)), [month]);

  return (
    <div className={`rounded-md border bg-white p-3 ${invalid ? "border-red-500" : "border-purple-light"}`}>
      <div className="mb-2 flex items-center justify-between">
        <button type="button" className="tap rounded-md px-2 text-sm" onClick={() => setMonth((m) => addMonths(m, -1))}>Prev</button>
        <p className="text-sm font-semibold text-purple-dark">{format(month, "MMMM yyyy")}</p>
        <button type="button" className="tap rounded-md px-2 text-sm" onClick={() => setMonth((m) => addMonths(m, 1))}>Next</button>
      </div>
      <div className="grid grid-cols-7 gap-1 text-center text-xs font-semibold uppercase text-purple-mid">
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((label) => <span key={label}>{label}</span>)}
      </div>
      <div className="mt-1 grid grid-cols-7 gap-1">
        {days.map((day) => {
          const iso = isoDay(day);
          const allowed = isAllowedQuoteDate(iso) && !isBefore(startOfDay(day), today);
          const chosen = selected && isSameDay(day, selected);
          const outside = day.getMonth() !== month.getMonth();
          return (
            <button
              key={iso}
              type="button"
              disabled={!allowed}
              onClick={() => onChange(iso)}
              className={`h-9 rounded text-sm ${
                chosen
                  ? "bg-purple-mid font-semibold text-white"
                  : allowed
                    ? "bg-purple-soft text-purple-dark hover:bg-purple-light"
                    : "cursor-not-allowed bg-gray-100 text-gray-400 line-through"
              } ${outside ? "opacity-50" : ""}`}
              aria-disabled={!allowed}
              title={allowed ? format(day, "EEEE, MMM d") : "Not available. Quote dates are Friday through Monday."}
            >
              {format(day, "d")}
            </button>
          );
        })}
      </div>
      <p className="mt-2 text-xs text-purple-mid">Gray crossed-out days are Tuesday–Thursday or dates that already passed.</p>
    </div>
  );
}

export default function QuoteForm() {
  const [form, setForm] = useState(EMPTY);
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  const [status, setStatus] = useState<Status>("idle");
  const [errorText, setErrorText] = useState(QUOTE_ERROR);

  const errors = useMemo(() => {
    const next: Record<string, string> = {};
    if (form.name.trim().length < 2) next.name = "Please enter your full name.";
    if (!form.phone.trim()) next.phone = "A phone number is required so Lisa can call you back.";
    else if (!isUsPhone(form.phone)) next.phone = "Use a US phone number, like (252) 555-1234.";
    if (form.address.trim().length < 5) next.address = "Enter the job address so Lisa knows where to come.";
    if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
      next.email = "That email doesn’t look right. Fix the typo or leave email blank.";
    }
    if (!form.quoteDate) next.quoteDate = "Pick a quote date. Only Friday, Saturday, Sunday, or Monday work.";
    else if (!isAllowedQuoteDate(form.quoteDate)) next.quoteDate = "That day is blocked. Quote visits are Friday through Monday only — not Tuesday, Wednesday, or Thursday.";
    if (!form.quoteTime) next.quoteTime = "Pick a time window for the quote visit.";
    if (!form.cleaningSchedule) next.cleaningSchedule = "Tell us how often you want the cleaning.";
    if (!form.cleaningTime) next.cleaningTime = "Pick a time window for the cleaning itself.";
    if (!form.serviceType || !isTypeOfClean(form.serviceType)) next.serviceType = "Choose the type of clean you need.";
    if (!form.consent) next.consent = "Check the box so Lisa can keep this request and follow up. This is not a booking.";
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
      name: true, email: true, phone: true, address: true, quoteDate: true,
      quoteTime: true, cleaningSchedule: true, cleaningTime: true, serviceType: true, consent: true,
    });
    if (form.website) return;
    const reasons = Object.values(errors);
    if (reasons.length > 0) {
      setErrorText(`This quote didn’t send. ${reasons.join(" ")}`);
      setStatus("error");
      return;
    }
    setStatus("submitting");
    setErrorText(QUOTE_ERROR);
    try {
      const res = await fetch("/api/quote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
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
        }),
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
      setErrorText("The request didn’t reach the server. Check your internet and try again, or call (252) 659-1868.");
      setStatus("error");
    }
  }

  const labelClass = "mb-1 block text-sm font-semibold text-purple-dark";

  if (status === "success") {
    return (
      <div className="rounded-md bg-purple-soft p-6 text-center" role="status">
        <p className="text-lg font-semibold text-purple-dark">Request received</p>
        <p className="mt-2 text-sm">{QUOTE_SUCCESS}</p>
        <button type="button" className="tap mt-4 inline-flex items-center justify-center rounded-md bg-purple-mid px-4 text-sm font-semibold text-white hover:bg-purple-dark" onClick={() => setStatus("idle")}>
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
          {touched.name && errors.name ? <p className="mt-1 text-sm text-red-700">{errors.name}</p> : null}
        </div>
        <div>
          <label htmlFor="email" className={labelClass}>Email (optional)</label>
          <input id="email" name="email" type="email" autoComplete="email" value={form.email} onBlur={() => setTouched((t) => ({ ...t, email: true }))} onChange={(e) => setField("email", e.target.value)} className={fieldClass("email")} placeholder="your@email.com" />
          {touched.email && errors.email ? <p className="mt-1 text-sm text-red-700">{errors.email}</p> : null}
        </div>
        <div>
          <label htmlFor="phone" className={labelClass}>Phone number</label>
          <input id="phone" name="phone" type="tel" autoComplete="tel" required value={form.phone} onBlur={() => setTouched((t) => ({ ...t, phone: true }))} onChange={(e) => setField("phone", e.target.value)} className={fieldClass("phone")} placeholder="(252) 555-1234" />
          {touched.phone && errors.phone ? <p className="mt-1 text-sm text-red-700">{errors.phone}</p> : null}
        </div>
        <div>
          <label htmlFor="address" className={labelClass}>Address</label>
          <input id="address" name="address" type="text" autoComplete="street-address" required value={form.address} onBlur={() => setTouched((t) => ({ ...t, address: true }))} onChange={(e) => setField("address", e.target.value)} className={fieldClass("address")} placeholder="123 Beach Dr, Emerald Isle, NC" />
          {touched.address && errors.address ? <p className="mt-1 text-sm text-red-700">{errors.address}</p> : null}
        </div>
        <div className="sm:col-span-2">
          <p className={labelClass}>Quote date</p>
          <QuoteDatePicker value={form.quoteDate} invalid={Boolean(touched.quoteDate && errors.quoteDate)} onChange={(iso) => { setField("quoteDate", iso); setTouched((t) => ({ ...t, quoteDate: true })); }} />
          <p className="mt-1 text-sm">{PREFERRED_DATE_HELPER}</p>
          {touched.quoteDate && errors.quoteDate ? <p className="mt-1 text-sm text-red-700">{errors.quoteDate}</p> : null}
        </div>
        <div>
          <label htmlFor="quoteTime" className={labelClass}>Quote time</label>
          <select id="quoteTime" name="quoteTime" required value={form.quoteTime} onBlur={() => setTouched((t) => ({ ...t, quoteTime: true }))} onChange={(e) => setField("quoteTime", e.target.value)} className={fieldClass("quoteTime")}>
            <option value="">Select a time</option>
            {QUOTE_TIME_OPTIONS.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
          </select>
          {touched.quoteTime && errors.quoteTime ? <p className="mt-1 text-sm text-red-700">{errors.quoteTime}</p> : null}
        </div>
        <div>
          <label htmlFor="cleaningSchedule" className={labelClass}>Cleaning schedule</label>
          <select id="cleaningSchedule" name="cleaningSchedule" required value={form.cleaningSchedule} onBlur={() => setTouched((t) => ({ ...t, cleaningSchedule: true }))} onChange={(e) => setField("cleaningSchedule", e.target.value)} className={fieldClass("cleaningSchedule")}>
            <option value="">Select frequency</option>
            {CLEANING_SCHEDULE_OPTIONS.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
          </select>
          {touched.cleaningSchedule && errors.cleaningSchedule ? <p className="mt-1 text-sm text-red-700">{errors.cleaningSchedule}</p> : null}
        </div>
        <div>
          <label htmlFor="cleaningTime" className={labelClass}>Cleaning time</label>
          <select id="cleaningTime" name="cleaningTime" required value={form.cleaningTime} onBlur={() => setTouched((t) => ({ ...t, cleaningTime: true }))} onChange={(e) => setField("cleaningTime", e.target.value)} className={fieldClass("cleaningTime")}>
            <option value="">Select a time</option>
            {QUOTE_TIME_OPTIONS.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
          </select>
          {touched.cleaningTime && errors.cleaningTime ? <p className="mt-1 text-sm text-red-700">{errors.cleaningTime}</p> : null}
        </div>
      </div>
      <div>
        <label htmlFor="serviceType" className={labelClass}>Service type</label>
        <select id="serviceType" name="serviceType" required value={form.serviceType} onBlur={() => setTouched((t) => ({ ...t, serviceType: true }))} onChange={(e) => setField("serviceType", e.target.value)} className={fieldClass("serviceType")}>
          <option value="">Select a service</option>
          {JOB_SERVICE_TYPES.map((label) => <option key={label} value={label}>{label}</option>)}
          <option value="Other">Other (explain in comments)</option>
        </select>
        {touched.serviceType && errors.serviceType ? <p className="mt-1 text-sm text-red-700">{errors.serviceType}</p> : null}
      </div>
      <div>
        <label htmlFor="message" className={labelClass}>Special instructions</label>
        <textarea id="message" name="message" rows={4} value={form.message} onChange={(e) => setField("message", e.target.value)} className="w-full rounded-md border border-purple-light bg-white px-3 py-2 text-base text-ink" placeholder="Any special requests or notes..." />
      </div>
      <div className="flex items-start gap-3">
        <input id="consent" name="consent" type="checkbox" required checked={form.consent} onChange={(e) => { setField("consent", e.target.checked); setTouched((t) => ({ ...t, consent: true })); }} className="mt-2 h-5 w-5 accent-purple-mid" />
        <label htmlFor="consent" className="text-sm">I agree that Lisa McNamara Cleaning Service may store this request so she can follow up. No payment information is collected. This is not a booking.</label>
      </div>
      {touched.consent && errors.consent ? <p className="text-sm text-red-700">{errors.consent}</p> : null}
      {status === "error" ? <p className="rounded-md border border-red-300 bg-red-50 p-4 text-sm font-medium text-red-800" role="alert">{errorText}</p> : null}
      <button type="submit" disabled={status === "submitting"} className="tap inline-flex w-full items-center justify-center rounded-md bg-purple-mid px-4 text-base font-semibold text-white hover:bg-purple-dark disabled:opacity-70 sm:w-auto">
        {status === "submitting" ? "Sending\u2026" : "Request a Quote"}
      </button>
    </form>
  );
}
