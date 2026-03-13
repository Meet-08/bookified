# Bookified

Bookified is a TanStack Start application that turns uploaded PDF books into voice-interactive experiences.

The app lets users:

- Upload a PDF (with optional custom cover image)
- Parse and segment text client-side
- Persist book metadata and searchable text segments in PostgreSQL (Drizzle ORM)
- Start AI voice conversations with Vapi about the selected book
- Enforce plan-based limits using Clerk billing plans

## Core Stack

- Runtime and package manager: Bun
- App framework: TanStack Start + TanStack Router
- UI: React 19 + Tailwind CSS v4
- Auth and plans: Clerk
- Database: Neon Postgres + Drizzle ORM
- File storage: Vercel Blob
- Voice assistant: Vapi (with ElevenLabs voice settings)

## Feature Breakdown

### 1) Library and Book Management

- Home route (`/`) loads signed-in user books from the database.
- Books are isolated per Clerk user via `clerkId`.
- Book identity in URLs uses a generated slug from title.

### 2) PDF Upload and Processing Pipeline

- Upload form validates:
  - PDF required, up to 50MB
  - Optional cover image up to 10MB
  - Title and author required
  - Voice selection required
- PDF is parsed in browser via `pdfjs-dist`.
- Text is split into searchable segments with overlap for better context continuity.
- PDF and cover image are uploaded through `/api/upload` using Vercel Blob token flow.
- Database write sequence:
  1. Create `books` row
  2. Insert many `book_segments`
  3. Update `books.total_segments`

### 3) Voice Conversation Flow

- Book detail route (`/books/$slug`) renders the voice console.
- Starting conversation:
  1. Calls server function to create a `voice_sessions` record
  2. Checks plan quota before session starts
  3. Starts Vapi assistant with book context (`title`, `author`, `bookId`)
- During call:
  - Transcript messages stream into UI (partial and final)
  - Session timer runs in client
- Ending call:
  - Stops Vapi call
  - Persists `endedAt` and `durationSeconds`

### 4) Semantic Book Search for Vapi Tool Calls

- Endpoint: `POST /api/vapi/search-book`
- Accepts Vapi tool calls for `searchBook`
- Executes full-text search against `book_segments.content`
- Returns top ranked excerpts (default limit: 3)

### 5) Subscription and Limits

- Plan detection uses Clerk `has({ plan: ... })`.
- Plan limits (configured in `src/lib/subscriptions.ts`):
  - Free: 1 book, 5 sessions/month, 5 minutes/session
  - Standard: 10 books, 100 sessions/month, 15 minutes/session
  - Pro: 100 books, unlimited monthly sessions, 60 minutes/session
- Enforced server-side in:
  - Book upload checks
  - Voice session start checks

## Architecture Overview

### Routing Model

File-based routing under `src/routes`:

- `/` - library view (book listing)
- `/books/new` - upload + ingestion flow
- `/books/$slug` - voice chat for one book
- `/subscriptions` - Clerk pricing table
- `/api/upload` - Vercel Blob upload token endpoint
- `/api/vapi/search-book` - retrieval endpoint for Vapi tool calls

### Server-side Execution Patterns

The project mixes two server patterns:

- TanStack server functions (`createServerFn`) for typed internal app calls:
  - Book CRUD/read/search helper functions
  - Session lifecycle methods
  - Plan-limit checks
- Route handlers for external HTTP integrations:
  - Blob uploads
  - Vapi retrieval webhook/tool endpoint

### Data Layer

- DB client lives in `src/db/index.ts`.
- Schema is defined in `src/db/schema.ts`.
- SQL migrations are generated under `drizzle/`.

## Database Schema

### `books`

- Stores book metadata and ownership
- Key fields: `id`, `clerk_id`, `title`, `slug`, `author`, `persona`, `file_url`, `cover_url`, `total_segments`
- `slug` is unique

### `book_segments`

- Stores segmented text for search and retrieval
- Key fields: `book_id`, `segment_index`, `content`, `word_count`, `page_number`
- Indexes:
  - unique (`book_id`, `segment_index`)
  - btree (`book_id`, `page_number`)
  - btree (`segment_index`)
  - GIN full-text index on `to_tsvector('english', content)`

### `voice_sessions`

- Tracks session usage for billing/limit enforcement
- Key fields: `book_id`, `clerk_id`, `started_at`, `ended_at`, `duration_seconds`, `billing_period_start`
- Indexes:
  - btree (`billing_period_start`)
  - btree (`clerk_id`, `billing_period_start`)

## Environment Variables

Create `.env.local` (or `.env`) with the following keys:

- `DATABASE_URL`
  - Required for Drizzle and runtime DB access.

- `VITE_CLERK_PUBLISHABLE_KEY`
  - Required by the Clerk client provider.

- `BLOB_READ_WRITE_TOKEN`
  - Required by `/api/upload` for Vercel Blob token generation.

- `VITE_VAPI_API_KEY`
  - Required in browser for Vapi SDK initialization.

- `VITE_ASSISTANT_ID`
  - Assistant ID used when starting voice calls.

## Local Development

### 1) Install dependencies

```bash
bun install
```

### 2) Configure environment

```bash
cp .env.example .env.local
```

If `.env.example` is not present in your local clone, create `.env.local` manually with the keys above.

### 3) Run migrations

```bash
bun run db:generate
bun run db:migrate
```

For schema synchronization workflows:

```bash
bun run db:push
```

### 4) Start dev server

```bash
bun run dev
```

App runs on port `3000` by default.

## Build, Preview, Quality

```bash
bun run build
bun run preview
```

```bash
bun run test
bun run lint
bun run format
bun run check
```

## Project Structure (High Signal)

```text
src/
  components/         UI and feature components (upload, transcript, voice controls)
  db/                 Drizzle client + schema
  hooks/              voice and subscription hooks
  integrations/clerk/ Clerk provider wiring
  lib/                constants, validation, utils, plan configuration
  routes/             file-based pages and API handlers
  server/             server functions (books, sessions, subscription checks)
drizzle/              migration SQL and schema snapshots
public/assets/        app artwork and branding assets
```

## Operational Notes

- Upload + parsing happens in the browser; very large PDFs may affect client memory and processing time.
- API route file naming and route path generation are handled by TanStack route generation (`routeTree.gen.ts`).

## Deployment Notes

- Vite + Nitro config is present for Bun-based server output and Vercel function runtime settings.
- Ensure all env vars listed above are configured in the deployment platform.

## Maintainers

If you extend this codebase, update this README when changing:

- routes/endpoints
- schema or migrations
- environment variables
- subscription limit logic
