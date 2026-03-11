import { devtools } from "@tanstack/devtools-vite";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";

import { tanstackStart } from "@tanstack/react-start/plugin/vite";

import tailwindcss from "@tailwindcss/vite";
import viteReact from "@vitejs/plugin-react";
import { nitro } from "nitro/vite";
import neon from "./neon-vite-plugin.ts";

const config = defineConfig({
	ssr: {
		external: ["@clerk/ui"],
	},
	plugins: [
		devtools(),
		neon,
		tsconfigPaths({ projects: ["./tsconfig.json"] }),
		tailwindcss(),
		tanstackStart(),
		nitro({ preset: "bun" }),
		viteReact(),
	],
});

export default config;
