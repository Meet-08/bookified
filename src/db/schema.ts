import { relations, sql } from "drizzle-orm";
import {
	index,
	integer,
	pgTable,
	text,
	timestamp,
	uniqueIndex,
	uuid,
} from "drizzle-orm/pg-core";

export const book = pgTable("books", {
	id: uuid().primaryKey().defaultRandom(),
	clerkId: text().notNull(),
	title: text().notNull(),
	slug: text().notNull().unique(),
	author: text().notNull(),
	persona: text(),
	fileURL: text().notNull(),
	fileBlobKey: text().notNull(),
	coverURL: text().notNull(),
	coverBlobKey: text(),
	fileSize: text().notNull(),
	totalSegments: integer().default(0),
});

export const bookSegment = pgTable(
	"book_segments",
	{
		id: uuid().primaryKey().defaultRandom(),
		clerkId: text().notNull(),
		bookId: uuid()
			.notNull()
			.references(() => book.id),
		content: text().notNull(),
		segmentIndex: integer().notNull(),
		pageNumber: integer(),
		wordCount: integer().notNull(),
	},
	(table) => [
		uniqueIndex("book_segment_unique_idx").on(table.bookId, table.segmentIndex),
		index("book_segment_page_idx").on(table.bookId, table.pageNumber),
		index("book_segment_index_idx").on(table.segmentIndex),
		index("book_segment_content_fts_idx").using(
			"gin",
			sql`to_tsvector('english', ${table.content})`,
		),
	],
);

export const bookSegmentRelations = relations(bookSegment, ({ one }) => ({
	book: one(book, {
		fields: [bookSegment.bookId],
		references: [book.id],
	}),
}));

export const voiceSession = pgTable(
	"voice_sessions",
	{
		id: uuid().primaryKey().defaultRandom(),
		clerkId: text().notNull(),
		bookId: uuid()
			.notNull()
			.references(() => book.id),
		startedAt: timestamp().defaultNow().notNull(),
		endedAt: timestamp(),
		durationSeconds: integer().default(0).notNull(),
		billingPeriodStart: timestamp().notNull(),
	},
	(table) => [
		index("voice_session_billing_idx").on(table.billingPeriodStart),
		index("voice_session_clerk_billing_idx").on(
			table.clerkId,
			table.billingPeriodStart,
		),
	],
);

export const voiceSessionRelations = relations(voiceSession, ({ one }) => ({
	book: one(book, {
		fields: [voiceSession.bookId],
		references: [book.id],
	}),
}));
