import { getBookBySlug } from "#/server/book";
import { auth } from "@clerk/tanstack-react-start/server";
import { Link, createFileRoute, redirect } from "@tanstack/react-router";
import { ArrowLeft, Mic, MicOff } from "lucide-react";

export const Route = createFileRoute("/books/$slug")({
	loader: async ({ params }) => {
		const { userId } = await auth();
		if (!userId) {
			throw redirect({ to: "/" });
		}
		const result = await getBookBySlug({ data: { slug: params.slug } });
		if (!result.success || !result.data) {
			throw redirect({ to: "/" });
		}
		return result.data;
	},
	component: RouteComponent,
});

function RouteComponent() {
	const book = Route.useLoaderData();

	return (
		<main className="book-page-container">
			{/* Floating back button */}
			<Link to="/" className="back-btn-floating" aria-label="Back to library">
				<ArrowLeft className="w-5 h-5 text-(--text-primary)" />
			</Link>

			<div className="max-w-4xl mx-auto space-y-4">
				{/* Header card */}
				<div className="vapi-header-card">
					{/* Cover + mic button */}
					<div className="vapi-cover-wrapper">
						<img
							src={book.coverURL}
							alt={book.title}
							className="vapi-cover-image"
						/>
						<div className="vapi-mic-wrapper">
							<button
								type="button"
								className="vapi-mic-btn vapi-mic-btn-inactive"
								aria-label="Start conversation"
							>
								<MicOff className="w-5 h-5 sm:w-6 sm:h-6 text-(--text-primary)" />
							</button>
						</div>
					</div>

					{/* Book info */}
					<div className="flex flex-col gap-3 flex-1 min-w-0">
						<div>
							<h1 className="font-serif font-bold text-2xl sm:text-3xl text-(--text-primary) leading-tight">
								{book.title}
							</h1>
							<p className="text-(--text-secondary) text-base mt-1">
								by {book.author}
							</p>
						</div>

						{/* Status badges row */}
						<div className="flex flex-wrap gap-2 mt-1">
							<div className="vapi-status-indicator">
								<span className="vapi-status-dot vapi-status-dot-ready" />
								<span className="vapi-status-text">Ready</span>
							</div>

							<div className="vapi-status-indicator">
								<span className="vapi-status-text">
									Voice: {book.persona ?? "Default"}
								</span>
							</div>

							<div className="vapi-status-indicator">
								<span className="vapi-status-text">0:00 / 15:00</span>
							</div>
						</div>
					</div>
				</div>

				{/* Transcript area */}
				<div className="transcript-container">
					<div className="transcript-empty">
						<Mic className="w-12 h-12 text-(--text-muted) mb-4" />
						<p className="transcript-empty-text">No conversation yet</p>
						<p className="transcript-empty-hint">
							Click the mic button above to start talking
						</p>
					</div>
				</div>
			</div>
		</main>
	);
}
