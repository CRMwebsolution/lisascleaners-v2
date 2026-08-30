# Lisa McNamara Cleaning Service (v2)

Public Next.js App Router site plus staff admin for Lisa McNamara Cleaning Service.

This is not the live lisascleaners.com site. Do not change DNS. Do not email Lisa.

## Local / Bolt

Copy `.env.example` to `.env.local` and fill:

- `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` for Carteret County Biz (`rwmpqlnakmexugwihisy`)
- `LISA_BUSINESS_ID` if it is not the default in `lib/site.ts`
- `N8N_WEBHOOK_URL` if you need to override the quote webhook
- `SUPABASE_SERVICE_ROLE_KEY` only on the server, for adding staff from `/admin`

```
npm install
npm run dev
```

## Quote form

The Request a Quote form uses the original site field set: name, optional email, phone, address, quote date (Fri–Mon), quote time, cleaning schedule, cleaning time, service type, notes, consent.

It posts to `/api/quote`, inserts `lisa_quote_requests`, then notifies n8n. Preferred date is not a booking. No payments.

## Staff

- `/login`
- `/admin` requests inbox, calendar, jobs, staff, quote/invoice PDF
- `/dashboard` assigned jobs only, coworkers visible, mark complete + note, no price

Seed admin emails (changeable in Staff): `cody@southernautomate.com`, `nyther1@gmail.com`.

Create those auth users in Supabase, add matching `lisa_profiles` rows with role `admin`, or use the Staff form after the service role key is set.

## Pages

Home, services, areas, gallery (placeholders), about, request-a-quote, privacy.
