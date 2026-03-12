import { db } from "#/db/index";
import { voiceSession } from "#/db/schema";
import { auth } from "@clerk/tanstack-react-start/server";
import { createServerFn } from "@tanstack/react-start";
import { eq } from "drizzle-orm";

const getBillingPeriodStart = () => {
	const now = new Date();
	return new Date(now.getFullYear(), now.getMonth(), 1);
};

export const startVoiceSession = createServerFn({ method: "POST" })
	.inputValidator((input: { bookId: string }) => input)
	.handler(async ({ data }) => {
		try {
			const { userId } = await auth();

			if (!userId) {
				return { success: false, error: "Unauthorized" };
			}

			const [session] = await db
				.insert(voiceSession)
				.values({
					clerkId: userId,
					bookId: data.bookId,
					startedAt: new Date(),
					billingPeriodStart: getBillingPeriodStart(),
					durationSeconds: 0,
				})
				.returning();

			return { success: true, sessionId: session.id };
		} catch (error) {
			console.error("Error: Starting voice session", error);
			return {
				success: false,
				error: "Failed to start the voice session. Please try again.",
			};
		}
	});

export const endVoiceSession = createServerFn({ method: "POST" })
	.inputValidator(
		(input: { sessionId: string; durationSeconds: number }) => input,
	)
	.handler(async ({ data }) => {
		try {
			const [result] = await db
				.update(voiceSession)
				.set({
					endedAt: new Date(),
					durationSeconds: data.durationSeconds,
				})
				.where(eq(voiceSession.id, data.sessionId))
				.returning();

			if (!result) {
				return { success: false, error: "Voice session not found" };
			}

			return { success: true };
		} catch (error) {
			console.error("Error: Ending voice session", error);
			return {
				success: false,
				error: "Failed to end voice session. Please try again later.",
			};
		}
	});
