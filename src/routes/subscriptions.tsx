import { PricingTable } from "@clerk/tanstack-react-start";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/subscriptions")({
	component: SubscriptionsPage,
});

function SubscriptionsPage() {
	return (
		<main className="wrapper container">
			<div className="mx-auto max-w-5xl space-y-10">
				<section className="flex flex-col gap-5">
					<h1 className="page-title-xl">Choose Your Plan</h1>
					<p className="subtitle">
						Unlock more books, longer sessions, and advanced features.
					</p>
				</section>

				<div className="clerk-pricing-table-wrapper">
					<PricingTable
						appearance={{
							variables: {
								colorPrimary: "var(--color-brand)",
								colorBackground: "var(--bg-card)",
								colorText: "var(--text-primary)",
								colorTextSecondary: "var(--text-secondary)",
								borderRadius: "0.625rem",
							},
						}}
					/>
				</div>
			</div>
		</main>
	);
}
