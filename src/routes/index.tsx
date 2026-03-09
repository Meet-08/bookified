import Hero from "#/components/Hero";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/")({ component: App });

function App() {
	return (
		<main className="wrapper container">
			<Hero />
		</main>
	);
}
