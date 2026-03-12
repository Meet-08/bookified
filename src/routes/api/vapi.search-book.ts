import { searchBookSegments } from "#/server/book";
import { createFileRoute } from "@tanstack/react-router";

type VapiToolCall = {
	id: string;
	function: {
		name: string;
		arguments: Record<string, unknown>;
	};
};

type VapiRequest = {
	message: {
		toolCallList: VapiToolCall[];
	};
};

export const Route = createFileRoute("/api/vapi/search-book")({
	server: {
		handlers: {
			POST: async ({ request }) => {
				const body = (await request.json()) as VapiRequest;
				const toolCallList = body?.message?.toolCallList ?? [];

				const results = await Promise.all(
					toolCallList.map(async (toolCall) => {
						if (toolCall.function.name !== "searchBook") {
							return { toolCallId: toolCall.id, result: "Unknown tool call." };
						}

						const { bookId, query } = toolCall.function.arguments as {
							bookId: string;
							query: string;
						};

						const response = await searchBookSegments({
							data: { bookId, query, limit: 3 },
						});

						if (!response.success || !response.data?.length) {
							return {
								toolCallId: toolCall.id,
								result: "No information found about this topic.",
							};
						}

						const combined = response.data.map((s) => s.content).join("\n\n");

						return { toolCallId: toolCall.id, result: combined };
					}),
				);

				return new Response(JSON.stringify({ results }), {
					headers: { "Content-Type": "application/json" },
				});
			},
		},
	},
});
