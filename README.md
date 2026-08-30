# Lisa McNamara Cleaning Service (v2)

Public Next.js App Router site for Lisa McNamara Cleaning Service.

This is not the live lisascleaners.com site. Do not change DNS. Do not email anyone.

## Local run

Copy `.env.example` to `.env.local` and fill the values. Then:

```
npm install
npm run dev
```

## Quote form

The Request a Quote form posts to `/api/quote`. It validates the fields, inserts into `public.lisa_quote_requests` with the anon key, then notifies the n8n webhook. If insert fails, the visitor sees the error copy. If insert works but the webhook fails, the visitor still sees success because Lisa has the row.

Preferred date is not a booking. No public calendar hold. No payments. Do not add a service role key.

## Pages

Home, services, areas, gallery, about, request-a-quote, privacy, and a login stub.
