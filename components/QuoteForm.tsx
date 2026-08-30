"use client";

import { FormEvent, useState } from "react";
import {
  PREFERRED_DATE_HELPER,
  QUOTE_ERROR,
  QUOTE_SUCCESS,
  SERVICES,
} from "@/lib/site";

type Status = "idle" | "submitting" | "success" | "error";

export default function QuoteForm() {
  const [status, setStatus] = useState<Status>("idle");
  const [errorText, setErrorText] = useState(QUOTE_ERROR);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("submitting");
    setErrorText(QUOTE_ERROR);

    const form = event.currentTarget;
    const data = new FormData(form);
    const payload = {
      name: String(data.get("name") ?? "").trim(),
      phone: String(data.get("phone") ?? "").trim(),
      email: String(data.get("email") ?? "").trim(),
      job_address: String(data.get("job_address") ?? "").trim(),
      type_of_clean: String(data.get("type_of_clean") ?? "").trim(),
      preferred_date: String(data.get("preferred_date") ?? "").trim(),
      notes: String(data.get("notes") ?? "").trim(),
      consent: data.get("consent") === "on",
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
      form.reset();
      setStatus("success");
    } catch {
      setErrorText(QUOTE_ERROR);
      setStatus("error");
    }
  }

  const fieldClass =
    "tap w-full rounded-md border border-purple-light bg-white px-3 text-base text-ink";
  const labelClass = "mb-1 block text-sm font-semibold text-purple-dark";

  return (
    <form onSubmit={onSubmit} className="space-y-5" noValidate>
      <div>
        <label htmlFor="name" className={labelClass}>
          Name
        </label>
        <input
          id="name"
          name="name"
          type="text"
          autoComplete="name"
          required
          className={fieldClass}
        />
      </div>
      <div>
        <label htmlFor="phone" className={labelClass}>
          Phone
        </label>
        <input
          id="phone"
          name="phone"
          type="tel"
          autoComplete="tel"
          required
          className={fieldClass}
        />
      </div>
      <div>
        <label htmlFor="email" className={labelClass}>
          Email
        </label>
        <input
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          required
          className={fieldClass}
        />
      </div>
      <div>
        <label htmlFor="job_address" className={labelClass}>
          Job address
        </label>
        <input
          id="job_address"
          name="job_address"
          type="text"
          autoComplete="street-address"
          required
          className={fieldClass}
        />
      </div>
      <div>
        <label htmlFor="type_of_clean" className={labelClass}>
          Type of clean
        </label>
        <select id="type_of_clean" name="type_of_clean" required className={fieldClass}>
          <option value="">Choose one</option>
          {SERVICES.map((service) => (
            <option key={service.slug} value={service.label}>
              {service.label}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label htmlFor="preferred_date" className={labelClass}>
          Preferred date (optional)
        </label>
        <input id="preferred_date" name="preferred_date" type="date" className={fieldClass} />
        <p className="mt-1 text-sm text-ink">{PREFERRED_DATE_HELPER}</p>
      </div>
      <div>
        <label htmlFor="notes" className={labelClass}>
          Notes (optional)
        </label>
        <textarea
          id="notes"
          name="notes"
          rows={4}
          className="w-full rounded-md border border-purple-light bg-white px-3 py-2 text-base text-ink"
        />
      </div>
      <div className="flex items-start gap-3">
        <input
          id="consent"
          name="consent"
          type="checkbox"
          required
          className="mt-2 h-5 w-5 accent-purple-mid"
        />
        <label htmlFor="consent" className="text-sm">
          I agree that Lisa McNamara Cleaning Service may store this request so she can follow
          up. No payment information is collected.
        </label>
      </div>
      {status === "success" ? (
        <p
          className="rounded-md bg-purple-soft p-4 text-sm font-medium text-purple-dark"
          role="status"
        >
          {QUOTE_SUCCESS}
        </p>
      ) : null}
      {status === "error" ? (
        <p
          className="rounded-md border border-purple-mid p-4 text-sm font-medium text-purple-dark"
          role="alert"
        >
          {errorText}
        </p>
      ) : null}
      <button
        type="submit"
        disabled={status === "submitting"}
        className="tap inline-flex w-full items-center justify-center rounded-md bg-purple-mid px-4 text-base font-semibold text-white hover:bg-purple-dark disabled:opacity-70 sm:w-auto"
      >
        {status === "submitting" ? "Sending…" : "Request a Quote"}
      </button>
    </form>
  );
}
