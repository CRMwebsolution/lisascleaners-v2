import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import {
  DEFAULT_LISA_BUSINESS_ID,
  isAllowedQuoteDate,
  isTypeOfClean,
  isUsPhone,
  QUOTE_ERROR,
} from "@/lib/site";

export const runtime = "nodejs";

const DEFAULT_N8N_WEBHOOK_URL =
  "https://n8n.southernautomate.com/webhook/c3f44912-221e-4f3b-bc97-80ccd0e472ae";
const BLOCKED_N8N_WEBHOOK_ID = "2e3de640-d6dc-4fca-a404-0b71b9403227";

type QuoteBody = Record<string, unknown>;

function asString(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function isEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export async function POST(request: Request) {
  let body: QuoteBody;
  try {
    body = (await request.json()) as QuoteBody;
  } catch {
    return NextResponse.json({ error: QUOTE_ERROR }, { status: 400 });
  }

  const name = asString(body.name);
  const phone = asString(body.phone);
  const email = asString(body.email);
  const job_address = asString(body.job_address);
  const type_of_clean = asString(body.type_of_clean);
  const preferred_date = asString(body.preferred_date);
  const quote_time = asString(body.quote_time);
  const cleaning_schedule = asString(body.cleaning_schedule);
  const cleaning_time = asString(body.cleaning_time);
  const notes = asString(body.notes);
  const consent = body.consent === true;

  if (!name || name.length < 2 || !phone || !job_address || job_address.length < 5 || !type_of_clean || !consent) {
    return NextResponse.json({ error: QUOTE_ERROR }, { status: 400 });
  }
  if (!isUsPhone(phone) || (email && !isEmail(email)) || !isTypeOfClean(type_of_clean)) {
    return NextResponse.json({ error: QUOTE_ERROR }, { status: 400 });
  }
  if (!preferred_date || !isAllowedQuoteDate(preferred_date) || !quote_time || !cleaning_schedule || !cleaning_time) {
    return NextResponse.json({ error: QUOTE_ERROR }, { status: 400 });
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!supabaseUrl || !supabaseAnonKey) {
    console.error("Missing Supabase env");
    return NextResponse.json({ error: QUOTE_ERROR }, { status: 500 });
  }

  const businessId = process.env.LISA_BUSINESS_ID || DEFAULT_LISA_BUSINESS_ID;
  const supabase = createClient(supabaseUrl, supabaseAnonKey);
  const consent_at = new Date().toISOString();
  const fullRow = {
    business_id: businessId,
    name,
    phone,
    email: email || null,
    job_address,
    type_of_clean,
    preferred_date,
    quote_time,
    cleaning_schedule,
    cleaning_time,
    notes: notes || null,
    consent_at,
    status: "new",
  };

  let insertedId: string | null = null;
  const first = await supabase.from("lisa_quote_requests").insert(fullRow).select("id").single();
  if (first.error) {
    console.error("Quote insert with extra columns failed:", first.error.message);
    const fallbackNotes = [notes, quote_time ? `Quote time: ${quote_time}` : "", cleaning_schedule ? `Schedule: ${cleaning_schedule}` : "", cleaning_time ? `Cleaning time: ${cleaning_time}` : ""].filter(Boolean).join("\n");
    const fallback = await supabase.from("lisa_quote_requests").insert({
      business_id: businessId,
      name,
      phone,
      email: email || null,
      job_address,
      type_of_clean,
      preferred_date,
      notes: fallbackNotes || null,
      consent_at,
      status: "new",
    }).select("id").single();
    if (fallback.error) {
      console.error("Quote insert failed:", fallback.error.message);
      return NextResponse.json({ error: QUOTE_ERROR }, { status: 500 });
    }
    insertedId = fallback.data?.id ?? null;
  } else {
    insertedId = first.data?.id ?? null;
  }

  const webhookUrl = process.env.N8N_WEBHOOK_URL || DEFAULT_N8N_WEBHOOK_URL;
  if (webhookUrl.includes(BLOCKED_N8N_WEBHOOK_ID)) {
    return NextResponse.json({ ok: true });
  }
  try {
    const n8nRes = await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: insertedId, ...fullRow, source: "lisascleaners" }),
    });
    if (!n8nRes.ok) console.error("n8n webhook failed:", n8nRes.status);
  } catch (err) {
    console.error("n8n webhook error:", err);
  }
  return NextResponse.json({ ok: true });
}
