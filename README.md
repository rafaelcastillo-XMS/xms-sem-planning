# SEM Planning Client Form (Internal)

This project is an internal web form workflow for XMS Ai.

It replaces PowerPoint + email back-and-forth with a structured SEM/LSA planning flow where:
- the SEM team prepares planning proposals internally,
- clients complete the required information step by step,
- the team reviews one consolidated submission.

## Internal Use Notice

This application is for **internal use only** at **XMS Ai** and is exclusive to the internal SEM team processes.

## Tech Stack

- Next.js (App Router)
- React + TypeScript
- Tailwind CSS
- shadcn/ui components
- react-hook-form + zod
- lucide-react


## Planning logos and reports

The planning builder accepts PNG, JPEG and WebP logos (up to 5 MB). The browser
resizes the image to at most 512 × 512 pixels, preserves transparency, and saves
its PNG data URL in the existing `sem_clients.logo_url` text column. No database
migration, Storage bucket, Drive connection or new secret is required. Existing
URL logos remain supported. The logo is persisted only when the planning is saved;
removing it clears the stored value. This approach is intended for small logos,
not photo galleries. Supabase Storage is the next step for larger assets.

The admin **Results** tab offers a single **Descargar PDF** button. It remains
visible but disabled until the client submits the planning. Clicking it downloads
an A4 PDF directly, with no print dialog or HTML export. The client view does not
show report download controls. Reports include the proposal, logo, decisions,
comments, budgets, locations, business hours, profile and team information.
PDF generation is loaded on demand and supports pagination for long responses.

Planning creation writes the full proposal and initial response in the first
session insert. Create, edit, draft-save and final-submit flows await Supabase;
failed saves retain the form and show an error instead of reporting success.

### Verification

- `npm run lint`
- `npx tsc --noEmit`
- `npm run build`
- `node --test tests/planning-report.cjs`
- Optional live check: `node --env-file=.env.local tests/supabase-logo-smoke.cjs`
  creates a uniquely named temporary client, checks logo persistence/removal and
  deletes only that test record.

### Existing limitations identified during review

- Client wizard asset inputs record filenames only; the underlying client photos
  and client-provided asset files are not uploaded. This is separate from the
  planning builder logo attachment implemented above.
- The app has no administrator sign-in and uses the public Supabase client for
  CRUD. Deployment access and database authorization need a separate review
  before treating it as a private multi-user service.
- The provider still loads the full client/session collection; inline logos add
  to that payload. For a larger deployment, use scoped queries and Storage.
- Deployment uses Next.js standalone/Docker. Historical failed GitHub Pages runs
  do not verify the current Docker deployment.
