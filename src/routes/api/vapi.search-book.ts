import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/vapi/search-book")({
	server: {
		handlers: {},
	},
});
