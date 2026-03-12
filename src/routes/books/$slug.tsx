import { getBookBySlug } from "#/server/book";
import { Link, createFileRoute, redirect } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import VapiControls from "../../components/VapiControls";

export const Route = createFileRoute("/books/$slug")({
	loader: async ({ params }) => {
		const result = await getBookBySlug({ data: { slug: params.slug } });

		if (!result.success && result.error === "Unauthorized") {
			throw redirect({ to: "/" });
		}

		return result;
	},
	component: RouteComponent,
});

function RouteComponent() {
	const { data: book, success, error } = Route.useLoaderData();

	if (!success && error) {
		return (
			<div className="flex items-center justify-center h-screen">
				<p className="text-(--text-muted) text-lg">Failed to load book</p>
			</div>
		);
	}

	if (!book) {
		return (
			<div className="flex items-center justify-center h-screen">
				<p className="text-(--text-muted) text-lg">Book not found</p>
			</div>
		);
	}

	return (
		<main className="book-page-container">
			<Link to="/" className="back-btn-floating" aria-label="Back to library">
				<ArrowLeft className="w-5 h-5 text-(--text-primary)" />
			</Link>

			<div className="max-w-4xl mx-auto">
				<VapiControls book={book} />
			</div>
		</main>
	);
}
