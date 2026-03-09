CREATE TABLE "books" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"clerk_id" text NOT NULL,
	"title" text NOT NULL,
	"slug" text NOT NULL,
	"author" text NOT NULL,
	"persona" text,
	"file_url" text NOT NULL,
	"file_blob_key" text NOT NULL,
	"cover_url" text,
	"cover_blob_key" text,
	"file_size" text NOT NULL,
	"total_segments" integer DEFAULT 0,
	CONSTRAINT "books_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "book_segments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"clerk_id" text NOT NULL,
	"book_id" uuid NOT NULL,
	"content" text NOT NULL,
	"segment_index" integer NOT NULL,
	"page_number" integer,
	"word_count" integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE "voice_sessions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"clerk_id" text NOT NULL,
	"book_id" uuid NOT NULL,
	"started_at" timestamp DEFAULT now() NOT NULL,
	"ended_at" timestamp,
	"duration_seconds" integer DEFAULT 0 NOT NULL,
	"billing_period_start" timestamp NOT NULL
);
--> statement-breakpoint
ALTER TABLE "book_segments" ADD CONSTRAINT "book_segments_book_id_books_id_fk" FOREIGN KEY ("book_id") REFERENCES "public"."books"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "voice_sessions" ADD CONSTRAINT "voice_sessions_book_id_books_id_fk" FOREIGN KEY ("book_id") REFERENCES "public"."books"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "book_segment_unique_idx" ON "book_segments" USING btree ("book_id","segment_index");--> statement-breakpoint
CREATE INDEX "book_segment_page_idx" ON "book_segments" USING btree ("book_id","page_number");--> statement-breakpoint
CREATE INDEX "book_segment_index_idx" ON "book_segments" USING btree ("segment_index");--> statement-breakpoint
CREATE INDEX "book_segment_content_fts_idx" ON "book_segments" USING gin (to_tsvector('english', "content"));--> statement-breakpoint
CREATE INDEX "voice_session_billing_idx" ON "voice_sessions" USING btree ("billing_period_start");--> statement-breakpoint
CREATE INDEX "voice_session_clerk_billing_idx" ON "voice_sessions" USING btree ("clerk_id","billing_period_start");