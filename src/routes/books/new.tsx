import { BookUploadForm } from "#/components/BookUploadForm";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/books/new")({
	component: RouteComponent,
});

function RouteComponent() {
	return (
		<main className="wrapper container">
			<div className="mx-auto max-w-180 space-y-10">
				<section className="flex flex-col gap-5">
					<h1 className="page-title-xl">Add a New Book</h1>
					<p className="subtitle">
						Upload a PDF to generate your interactive voice-enabled book.
					</p>
				</section>

				<BookUploadForm />
			</div>
		</main>
	);
}
