import { db } from "#/db/index";
import { book } from "#/db/schema";
import { generateSlug } from "#/lib/utils";
import { createServerFn } from "@tanstack/react-start";
import { eq } from "drizzle-orm";

export const checkBookExists = createServerFn()
	.inputValidator((input: { title: string }) => input)
	.handler(async ({ data }) => {
		try {
			const slug = generateSlug(data.title);
			const dbBook = await db.select().from(book).where(eq(book.slug, slug));

			if (!dbBook.length) return { exists: false };
			return { exists: true, book: dbBook[0] };
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
		console.error("Error connecting to database: ", error);
		return {
			success: false,
			error: error instanceof Error ? error.message : "Unknown error",
		};
	}
});
