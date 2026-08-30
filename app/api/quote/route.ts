import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import {
  DEFAULT_LISA_BUSINESS_ID,
  isTypeOfClean,
  QUOTE_ERROR,
} from "@/lib/site";

export const runtime = "nodejs";

const DEFAULT_N8N_WEBHOOK_URL =
  "https://n8n.southernautomate.com/webhook/c3f44912-221e-4f3b-bc97-80ccd0e472ae";
const BLOCKED_N8N_WEBHOOK_ID = "2e3de640-d6dc-4fca-a404-0b71b9403227";

type QuoteBody = {
  name?: unknown;
  phone?: unknown;
  email?: unknown;
  job_address?: unknown;
  type_of_clean?: unknown;
  preferred_date?: unknown;
  notes?: unknown;
  consent?: unknown;
};

function asString(value: unknown) {
  return typeof value === "string" ? value.trim() : "";
}

function isEmail(value: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function isValidDate(value: string) {
  return /^\d{4}-\d{2}-\d{2}$/.test(value) && !Number.isNaN(Date.parse(value));
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
  const notes = asString(body.notes);
  const consent = body.consent === true;

  if (!name || !phone || !email || !job_address || !type_of_clean || !consent) {
    return NextResponse.json({ error: QUOTE_ERROR }, { status: 400 });
  }
  if (!isEmail(email)) {
    return NextResponse.json({ error: QUOTE_ERROR }, { status: 400 });
  }
  if (!isTypeOfClean(type_of_clean)) {
    return NextResponse.json({ error: QUOTE_ERROR }, { status: 400 });
  }
  if (preferred_date && !isValidDate(preferred_date)) {
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

  const { data, error } = await supabase
    .from("lisa_quote_requests")
    .insert({
      business_id: businessId,
      name,
      phone,
      email,
      job_address,
      type_of_clean,
      preferred_date: preferred_date || null,
      notes: notes || null,
      consent_at,
      status: "new",
    })
    .select("id")
    .single();

  if (error) {
    console.error("Quote insert failed:", error.message);
    return NextResponse.json({ error: QUOTE_ERROR }, { status: 500 });
  }

  const webhookUrl = process.env.N8N_WEBHOOK_URL || DEFAULT_N8N_WEBHOOK_URL;
  if (webhookUrl.includes(BLOCKED_N8N_WEBHOOK_ID)) {
    console.error("Blocked n8n webhook id; skipping notify");
    return NextResponse.json({ ok: true });
  }

  try {
    const n8nRes = await fetch(webhookUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        id: data?.id ?? null,
        business_id: businessId,
        name,
        phone,
        email,
        job_address,
        type_of_clean,
        preferred_date: preferred_date || null,
        notes: notes || null,
        consent_at,
        status: "new",
      }),
    });
    if (!n8nRes.ok) {
      const text = await n8nRes.text().catch(() => "");
      console.error("n8n webhook failed:", n8nRes.status, text);
    }
  } catch (err) {
    console.error("n8n webhook error:", err);
  }

  return NextResponse.json({ ok: true });
}
