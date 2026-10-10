import { defineConfig } from "vite";
import path from "path";

import { viteSingleFile } from "vite-plugin-singlefile";
import { viteStaticCopy } from "vite-plugin-static-copy";
import { jsxPlugin } from "dreamland/vite";

export default defineConfig({
	base: "/apps/browser/browserjs/",
	envDir: false,
	publicDir: false,

	plugins: [
		process.env.VITE_SINGLEFILE ? viteSingleFile() : null,
		// cssHmrPlugin(),
		jsxPlugin(),
		// ssr({ entry: "/src/main-server.ts" }),
		// viteStaticCopy({
		// 	structured: false,
		// 	targets: [
		// 		{
		// 			src: scramjetPath + "/*",
		// 			dest: "scram/",
		// 		},
		// 		{
		// 			src: "../inject/dist/inject.js",
		// 			dest: ".",
		// 		},
		// 		// {
		// 		// 	src: "../chii/public/*",
		// 		// 	dest: "chii",
		// 		// },
		// 	],
		// }),
	],
	define: {
		"import.meta.env.VITE_PUTER_BRANDING": false,
		__PORTFOLIOS_SOURCE_URL__: JSON.stringify(
			process.env.PORTFOLIOS_SOURCE_URL ||
				"https://github.com/Bl4ut0/PortfoliOS-Browser.JS"
		),
		"import.meta.env.VITE_ISOLATION_ORIGIN":
			JSON.stringify("https://puter.zone"),
		__COPYRIGHT_YEAR__: JSON.stringify(new Date().getFullYear()),
		__DEFAULT_SETTINGS__: {
			tabLayout: "horizontal",
			verticalTabJustify: "left",
			sidebarWidth: null,
			uiProfile: "default",
			themeId: "dark",
			followSystemTheme: false,
			lightThemeId: "light",
			darkThemeId: "dark",
			roundness: "balanced",
			tabStyle: "floating",
			iconSet: "ionicons",
			animations: "bouncy",
			startupPage: "continue",
			defaultZoom: 100,
			showBookmarksBar: false,
			defaultSearchEngine: "duckduckgo",
			searchSuggestionsEnabled: true,
			blockTrackers: true,
			clearHistoryOnExit: false,
			doNotTrack: true,
			extensionsDevMode: false,
		},
	},
	resolve: {
		alias: {
			"@components": path.resolve(__dirname, "./src/components"),
		},
	},
	esbuild: {
		keepNames: true,
	},
	build: {
		sourcemap: false,
		outDir: "dist",
		emptyOutDir: false,
	},
});
