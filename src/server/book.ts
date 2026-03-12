import { db } from "#/db/index";
import { book, bookSegment } from "#/db/schema";
import { generateSlug } from "#/lib/utils";
import { auth } from "@clerk/tanstack-react-start/server";
import { createServerFn } from "@tanstack/react-start";
import { and, eq, sql } from "drizzle-orm";
import type { CreateBook, TextSegment } from "types";

export const checkBookExists = createServerFn()
	.inputValidator((input: { title: string }) => input)
	.handler(async ({ data }) => {
		try {
			const slug = generateSlug(data.title);
			const dbBook = await db.query.book.findFirst({
				where: eq(book.slug, slug),
			});
			if (!dbBook) return { exists: false };
			return { exists: true, book: dbBook };
		} catch (error) {
			console.error("Error connecting to database: ", error);
			return {
				exists: false,
				error: error instanceof Error ? error.message : "Unknown error",
			};
		}
	});

export const getAllBooks = createServerFn().handler(async () => {
	try {
		const books = await db.select().from(book);
		return {
			success: true,
			data: books,
		};
	} catch (error) {
		console.error("Error fetching all books: ", error);
		return {
			success: false,
			error: error instanceof Error ? error.message : "Unknown error",
		};
	}
});

export const createBook = createServerFn({ method: "POST" })
	.inputValidator((input: CreateBook) => input)
	.handler(async ({ data }) => {
		try {
			const {
				clerkId,
				title,
				author,
				fileBlobKey,
				fileURL,
				coverBlobKey,
				fileSize,
				persona,
				coverURL,
			} = data;
			const slug = generateSlug(title);
			const existingBook = await db.query.book.findFirst({
				where: eq(book.slug, slug),
			});

			if (existingBook) {
				return {
					success: true,
					data: existingBook,
					alreadyExists: true,
				};
			}

			const { userId } = await auth();

			if (!userId || userId !== clerkId) {
				return { success: false, error: "Unauthorized" };
			}

			if (!coverURL) {
				return { success: false, error: "Cover URL is required" };
			}

			const [newBook] = await db
				.insert(book)
				.values({
					clerkId: userId,
					title,
					author,
					slug,
					fileBlobKey,
					fileURL,
					coverBlobKey: coverBlobKey ?? null,
					coverURL,
					fileSize: String(fileSize),
					persona: persona ?? null,
				})
				.returning();

			return {
				success: true,
				data: newBook,
			};
		} catch (error) {
			console.error("Error creating a book: ", error);

			return {
				success: false,
				error: error instanceof Error ? error.message : "Unknown error",
			};
		}
	});

export const getBookBySlug = createServerFn()
	.inputValidator((input: { slug: string }) => input)
	.handler(async ({ data }) => {
		try {
			const { userId } = await auth();
			if (!userId) {
				return { success: false, error: "Unauthorized" };
			}
			const dbBook = await db.query.book.findFirst({
				where: eq(book.slug, data.slug),
			});
			if (!dbBook) {
				return { success: false, data: null };
			}
			return { success: true, data: dbBook };
		} catch (error) {
			console.error("Error fetching book by slug: ", error);
			return {
				success: false,
				error: error instanceof Error ? error.message : "Unknown error",
			};
		}
	});

export const searchBookSegments = createServerFn()
	.inputValidator(
		(input: { bookId: string; query: string; limit: number }) => input,
	)
	.handler(async ({ data }) => {
		try {
			const { bookId, query, limit } = data;
			const results = await db
				.select({ content: bookSegment.content })
				.from(bookSegment)
				.where(
					and(
						eq(bookSegment.bookId, bookId),
						sql`to_tsvector('english', ${bookSegment.content}) @@ websearch_to_tsquery('english', ${query})`,
					),
				)
				.orderBy(
					sql`ts_rank(to_tsvector('english', ${bookSegment.content}), websearch_to_tsquery('english', ${query})) DESC`,
				)
				.limit(limit);
			return { success: true, data: results };
		} catch (error) {
			console.error("Error searching book segments: ", error);
			return {
				success: false,
				error: error instanceof Error ? error.message : "Unknown error",
			};
		}
	});

export const saveBookSegments = createServerFn({ method: "POST" })
	.inputValidator(
		(input: { bookId: string; clerkId: string; segments: TextSegment[] }) =>
			input,
	)
	.handler(async ({ data }) => {
		try {
			const { bookId, clerkId, segments } = data;
			const segmentsToInsert = segments.map(
				({ text, pageNumber, segmentIndex, wordCount }) => ({
					clerkId,
					bookId,
					content: text,
					pageNumber,
					segmentIndex,
					wordCount,
				}),
			);
			await db.insert(bookSegment).values(segmentsToInsert);
			await db
				.update(book)
				.set({ totalSegments: segments.length })
				.where(eq(book.id, bookId));

			return {
				success: true,
				data: { segments: segments.length },
			};
		} catch (error) {
			console.error("Error saving book segments: ", error);
			await db.delete(bookSegment).where(eq(bookSegment.bookId, data.bookId));
			await db.delete(book).where(eq(book.id, data.bookId));
			return {
				success: false,
				error: error instanceof Error ? error.message : "Unknown error",
			};
		}
	});
