import { MAX_FILE_SIZE } from "#/lib/constants";
import { auth } from "@clerk/tanstack-react-start/server";
import { createFileRoute } from "@tanstack/react-router";
import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";

export const Route = createFileRoute("/api/upload")({
	server: {
		handlers: {
			POST: async ({ request }) => {
				const body = (await request.json()) as HandleUploadBody;
				try {
					const jsonResponse = await handleUpload({
						token: process.env.BLOB_READ_WRITE_TOKEN,
						body,
						request,
						onBeforeGenerateToken: async () => {
							const { userId } = await auth();

							if (!userId)
								throw new Error("Unauthorized: User not authenticated");

							return {
								allowedContentTypes: [
									"application/pdf",
									"image/png",
									"image/jpeg",
									"image/webp",
								],
								addRandomSuffix: true,
								maximumSizeInBytes: MAX_FILE_SIZE,
								tokenPayload: JSON.stringify({ userId }),
							};
						},
						onUploadCompleted: async ({ blob }) => {
							console.log("File uploaded successfully: ", blob.url);
						},
					});

					return new Response(JSON.stringify(jsonResponse), {
						headers: { "Content-Type": "application/json" },
					});
				} catch (error) {
					console.error("Error:", error);
					return new Response(
						JSON.stringify({ error: "Failed to upload file" }),
						{ status: 500, headers: { "Content-Type": "application/json" } },
					);
				}
			},
		},
	},
});
