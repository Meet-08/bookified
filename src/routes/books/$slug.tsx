import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/books/$slug")({
	component: RouteComponent,
});

function RouteComponent() {
	const slug = Route.useParams().slug;
	return <div>Hello "/books/{slug}"!</div>;
}
