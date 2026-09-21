# GMS Technical Solutions

Hybrid IT/CS training site — classroom, live online and self-paced — on Next.js, Cloudflare Workers and D1.

## Stack

- **Next.js 15** (App Router, React 19)
- **Cloudflare Workers** via `@opennextjs/cloudflare`
- **D1** (SQLite) with **Drizzle ORM**
- **Tailwind CSS v4** (CSS-first config in `src/app/globals.css`)

## Getting started

```bash
npm install
```

Create the database and note the ID it prints:

```bash
npx wrangler d1 create gms-db
```

Paste that ID into `wrangler.jsonc` under `d1_databases[0].database_id`, then build the local schema and seed it:

```bash
npm run db:local && npm run db:seed
```

If you are upgrading an existing database rather than creating one, apply the migration that adds internships first:

```bash
npx wrangler d1 execute gms-db --local --file=./drizzle/0001_programmes.sql
```

Run it:

```bash
npm run dev
```

`initOpenNextCloudflareForDev()` in `next.config.ts` wires the real D1 binding into `next dev`, so local development hits the same database as production does.

## Deploying

```bash
npm run db:remote && npm run db:seed:remote
npm run deploy
```

`npm run preview` builds the worker and runs it locally first, which is worth doing before any deploy — it catches Node API usage that works in `next dev` but not on Workers.

## What is built

| Route | What it does |
|---|---|
| `/` | Landing page, outcome headline, course grid |
| `/courses` | All published courses, cheapest upcoming batch price |
| `/courses/[slug]` | Curriculum with free-preview lessons, sticky mode switcher, batch cards, enquiry capture, `Course` schema.org markup |
| `/internships` | Both internship programmes plus a "which one applies to you" comparison |
| `/internships/[slug]` | Same detail layout, with an apply CTA instead of a demo-class CTA |
| `/centres/[slug]` | Centre address, phone, directions, batches running there, `EducationalOrganization` markup |
| `/admin` | Password-protected admin panel — dashboard, enquiries, batches, courses, instructors, centres |
| `POST /api/enquiries` | Validated lead capture |

The mode switcher is the core pattern: classroom and live online show dated batches with seats and installments and a demo-class CTA, while self-paced shows a price and an instant-enrol button. Offline converts over the phone, online converts at checkout — the page adapts to which one the visitor picked.

## The admin panel

`/admin` is protected by a single shared password held in the `ADMIN_PASSWORD` binding. Sign-in sets an HMAC-signed, httpOnly cookie that lasts 12 hours; every admin page and every mutation calls `requireAdmin()` independently, so a missing check on one page cannot expose an action.

Locally the password comes from `.dev.vars` (gitignored). Set a real one before deploying:

```bash
npx wrangler secret put ADMIN_PASSWORD
```

From the panel you can manage upcoming batches (timings, seats, fees, installments, instructor, status), create and edit courses and internships, publish or hide them, add instructors and centres, and work the enquiry pipeline. Removing an instructor or centre unassigns their batches rather than deleting the classes; deleting a programme does delete its batches.

For stronger protection, put Cloudflare Access in front of `/admin/*` as well — free for up to 50 users, and it stops requests before they reach the Worker.

## Confirmation emails

Every enquiry that includes an email address triggers a confirmation to the
student: the course they asked about with its batch, fee and installments, a
"what happens next" section, four other courses, and the centre's contact
details. The template lives in `src/emails/enquiry-confirmation.ts` and the
send is one `fetch` in `src/lib/email.ts`.

Signed in as an admin, `/admin/email-preview` renders the real thing with live
course data — use it after any copy change.

Sending goes through [Resend](https://resend.com). To switch it on:

1. Add `gmstechnicalsolutions.com` as a domain in Resend and paste the DKIM
   and SPF records it gives you into Cloudflare DNS. Wait for it to verify.
2. Set the key for production:

   ```bash
   npx wrangler secret put RESEND_API_KEY
   ```

3. For local testing, put the same key after `RESEND_API_KEY=` in `.dev.vars`.

Nothing breaks while this is unset. `sendEmail()` returns `not-configured`,
the email is skipped and the enquiry still saves — which is why local
development works with an empty key. The send is also wrapped in try/catch
after the database insert, so a Resend outage can never cost you a lead.

`from` is `CONTACT.email`, so it has to stay on the verified domain. The
accent colour follows whichever theme is selected in `/admin/appearance`.


## Before this goes live

1. **Set a real `ADMIN_PASSWORD`.** The local default is `change-me-in-production`, which is exactly what it sounds like.
2. **Wire a payment gateway.** The self-paced "Enrol now" button is inert. Cashfree or Razorpay both work from a Worker with `fetch` — create an order server-side, redirect to the hosted checkout, and verify the webhook signature before inserting into `enrolments`.
3. **Replace seed data** in `drizzle/seed.sql` with real centres, courses, instructors and batch dates.
4. **Claim a Google Business Profile** per centre and link it from the centre page. For classroom enrolments this will out-perform the website itself.
5. **Add video.** `lessons.video_id` is ready — point it at YouTube unlisted IDs to stay free, or Bunny Stream with signed URLs once courses are paid.

## Notes on the schema

`courses` holds the syllabus and is shared across all three delivery modes; `batches` are scheduled instances of a course with a mode, centre, timing, capacity and price. That separation is what lets one course page serve a classroom student in Dehradun and a self-paced student anywhere.

Internships live in the same `courses` table, distinguished by `kind` (`course` or `internship`). They reuse modules, lessons and batches unchanged — a six-month programme is just a course whose modules are months — so scheduling, seats, installments and enquiry capture all work without a second system. `duration_label` overrides the computed "N weeks" where a human label reads better, such as "6 months".

`enquiries` matters more than `enrolments` for the offline side — the phone number is the conversion, and staff work the list. `payments` models installments properly (due date per installment) because a single `amount_paid` column stops being enough within a month.

`attendance` is in the schema but has no UI yet. That is deliberate — keep attendance in a spreadsheet until the site has actually brought students in.
