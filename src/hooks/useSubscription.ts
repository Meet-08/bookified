import {
	PLAN_LIMITS,
	PLAN_SLUGS,
	type PlanLimits,
	type PlanSlug,
} from "#/lib/subscriptions";
import { useAuth } from "@clerk/react";

interface UseSubscriptionReturn {
	planSlug: PlanSlug;
	limits: PlanLimits;
	isLoaded: boolean;
	hasPlan: (plan: PlanSlug) => boolean;
}

/**
 * Client-side hook to get the current user's subscription plan and limits.
 * Uses Clerk's useAuth() has() method for plan detection.
 */
export function useSubscription(): UseSubscriptionReturn {
	const { has, isLoaded } = useAuth();

	const hasPlan = (plan: PlanSlug): boolean => {
		if (!isLoaded || !has) return false;
		if (plan === PLAN_SLUGS.FREE) return true;
		return has({ plan });
	};

	let planSlug: PlanSlug = PLAN_SLUGS.FREE;
	if (isLoaded && has) {
		if (has({ plan: PLAN_SLUGS.PRO })) {
			planSlug = PLAN_SLUGS.PRO;
		} else if (has({ plan: PLAN_SLUGS.STANDARD })) {
			planSlug = PLAN_SLUGS.STANDARD;
		}
	}

	return {
		planSlug,
		limits: PLAN_LIMITS[planSlug],
		isLoaded,
		hasPlan,
	};
}
