import { devtools } from "@tanstack/devtools-vite";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";

import { tanstackStart } from "@tanstack/react-start/plugin/vite";

import tailwindcss from "@tailwindcss/vite";
import viteReact from "@vitejs/plugin-react";
import { nitro } from "nitro/vite";
import neon from "./neon-vite-plugin.ts";

const config = defineConfig({
	plugins: [
		devtools(),
		neon,
		tsconfigPaths({ projects: ["./tsconfig.json"] }),
		tailwindcss(),
		tanstackStart(),
		nitro({
			vercel: {
				functions: {
					runtime: "bun1.x",
				},
			},
		}),
		viteReact(),
	],
});

export default config;
