import { db } from "#/db/index";
import { book, voiceSession } from "#/db/schema";
import { PLAN_LIMITS, PLAN_SLUGS, type PlanLimits } from "#/lib/subscriptions";
import { auth } from "@clerk/tanstack-react-start/server";
import { and, count, eq, gte } from "drizzle-orm";

export async function getUserPlanLimits(): Promise<PlanLimits> {
	const { has } = await auth();

	if (has({ plan: PLAN_SLUGS.PRO })) {
		return PLAN_LIMITS[PLAN_SLUGS.PRO];
	}
	if (has({ plan: PLAN_SLUGS.STANDARD })) {
		return PLAN_LIMITS[PLAN_SLUGS.STANDARD];
	}
	return PLAN_LIMITS[PLAN_SLUGS.FREE];
}

export async function getUserPlanSlug(): Promise<string> {
	const { has } = await auth();

	if (has({ plan: PLAN_SLUGS.PRO })) return PLAN_SLUGS.PRO;
	if (has({ plan: PLAN_SLUGS.STANDARD })) return PLAN_SLUGS.STANDARD;
	return PLAN_SLUGS.FREE;
}

export async function checkBookUploadAllowed(userId: string) {
	const limits = await getUserPlanLimits();

	const [{ value: bookCount }] = await db
		.select({ value: count() })
		.from(book)
		.where(eq(book.clerkId, userId));

	if (bookCount >= limits.maxBooks) {
		return {
			allowed: false,
			limit: limits.maxBooks,
			current: bookCount,
		} as const;
	}

	return { allowed: true } as const;
}

export async function checkSessionAllowed(userId: string) {
	const limits = await getUserPlanLimits();

	// Unlimited sessions on Pro
	if (limits.maxSessionsPerMonth === null) {
		return { allowed: true } as const;
	}

	const billingPeriodStart = new Date(
		new Date().getFullYear(),
		new Date().getMonth(),
		1,
	);

	const [{ value: sessionCount }] = await db
		.select({ value: count() })
		.from(voiceSession)
		.where(
			and(
				eq(voiceSession.clerkId, userId),
				gte(voiceSession.billingPeriodStart, billingPeriodStart),
			),
		);

	if (sessionCount >= limits.maxSessionsPerMonth) {
		return {
			allowed: false,
			limit: limits.maxSessionsPerMonth,
			current: sessionCount,
		} as const;
	}

	return { allowed: true } as const;
}
