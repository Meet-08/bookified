import BookCard from "#/components/BookCard";
import Hero from "#/components/Hero";
import { getAllBooks } from "#/server/book";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
	loader: () => getAllBooks(),
	component: App,
});

function App() {
	const { data: books, error } = Route.useLoaderData();

	return (
		<main className="wrapper container">
			<Hero />

			{error !== "Unauthorized" && <p className="error">{error}</p>}

			<div className="library-books-grid">
				{books?.map((book) => (
					<BookCard
						key={book.id}
						title={book.title}
						author={book.author}
						coverURL={book.coverURL}
						slug={book.slug}
					/>
				))}
			</div>
		</main>
	);
}
