export const PLAN_SLUGS = {
	FREE: "free",
	STANDARD: "standard",
	PRO: "pro",
} as const;

export type PlanSlug = (typeof PLAN_SLUGS)[keyof typeof PLAN_SLUGS];

export interface PlanLimits {
	maxBooks: number;
	maxSessionsPerMonth: number | null; // null = unlimited
	maxSessionMinutes: number;
	sessionHistory: boolean;
}

export const PLAN_LIMITS: Record<PlanSlug, PlanLimits> = {
	[PLAN_SLUGS.FREE]: {
		maxBooks: 1,
		maxSessionsPerMonth: 5,
		maxSessionMinutes: 5,
		sessionHistory: false,
	},
	[PLAN_SLUGS.STANDARD]: {
		maxBooks: 10,
		maxSessionsPerMonth: 100,
		maxSessionMinutes: 15,
		sessionHistory: true,
	},
	[PLAN_SLUGS.PRO]: {
		maxBooks: 100,
		maxSessionsPerMonth: null,
		maxSessionMinutes: 60,
		sessionHistory: true,
	},
};

export const PLAN_DISPLAY_NAMES: Record<PlanSlug, string> = {
	[PLAN_SLUGS.FREE]: "Free",
	[PLAN_SLUGS.STANDARD]: "Standard",
	[PLAN_SLUGS.PRO]: "Pro",
};
