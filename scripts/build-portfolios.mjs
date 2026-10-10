/** Build the maintained Browser.js chrome. Engines remain app-only and visited content stays external. */
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { fileURLToPath } from "node:url";
import { execFileSync, spawnSync } from "node:child_process";
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const source = root;
const provenance = JSON.parse(
	fs.readFileSync(path.join(source, "portfolios/build-inputs.json"))
);
const temporary = path.join(root, ".tmp/browserjs-build");
fs.mkdirSync(temporary, { recursive: true });
function pnpm(directory, args) {
	const result = spawnSync(
		process.platform === "win32" ? "npx.cmd" : "npx",
		["--yes", "pnpm@10.12.1", ...args],
		{
			cwd: directory,
			stdio: "inherit",
			shell: process.platform === "win32",
			env: { ...process.env, CI: "true" },
		}
	);
	if (result.status !== 0)
		throw new Error("Browser.js build command failed: " + args.join(" "));
}
if (process.argv.includes("--install"))
	pnpm(source, [
		"--filter",
		"aboutproxy-2...",
		"--filter",
		"dreamland",
		"install",
		"--ignore-scripts",
		"--frozen-lockfile",
	]);
const engine = path.join(source, "packages/scramjet/packages/core");
if (!fs.existsSync(path.join(engine, "dist/scramjet_bundled.mjs"))) {
	const response = await fetch(
		"https://registry.npmjs.org/@mercuryworkshop/scramjet/-/scramjet-" +
			provenance.scramjet.version +
			".tgz"
	);
	if (!response.ok) throw new Error("Scramjet download failed");
	const bytes = Buffer.from(await response.arrayBuffer());
	const integrity =
		"sha512-" + crypto.createHash("sha512").update(bytes).digest("base64");
	if (integrity !== provenance.scramjet.integrity)
		throw new Error("Scramjet integrity mismatch");
	const archive = path.join(temporary, "scramjet.tgz");
	fs.writeFileSync(archive, bytes);
	execFileSync("tar", [
		"-xf",
		archive,
		"-C",
		engine,
		"--strip-components=1",
		"package/dist",
	]);
}
const injection = path.join(source, "packages/inject/dist/inject.js");
if (!fs.existsSync(injection)) {
	const response = await fetch(provenance.inject.url);
	if (!response.ok) throw new Error("Injection runtime download failed");
	const bytes = Buffer.from(await response.arrayBuffer());
	if (
		crypto.createHash("sha256").update(bytes).digest("hex") !==
		provenance.inject.sha256
	)
		throw new Error("Injection runtime integrity mismatch");
	fs.mkdirSync(path.dirname(injection), { recursive: true });
	fs.writeFileSync(injection, bytes);
}
const dreamlandConfig = path.join(
	source,
	"external/dreamlandjs/rollup.config.ts"
);
if (!fs.existsSync(dreamlandConfig))
	throw new Error("Initialize the pinned Dreamland submodule first.");
const originalDreamland = fs.readFileSync(dreamlandConfig, "utf8");
try {
	const patched = originalDreamland
		.replace(
			'import fs from "node:fs";',
			'import fs from "node:fs";\nimport path from "node:path";'
		)
		.replace(
			"id !== input &&",
			"id !== input &&\n\t\t\t\t\t!path.isAbsolute(id) &&"
		);
	fs.writeFileSync(dreamlandConfig, patched);
	if (!fs.existsSync(path.join(source, "external/dreamlandjs/dist/vite.js")))
		pnpm(path.join(source, "external/dreamlandjs"), ["build"]);
} finally {
	fs.writeFileSync(dreamlandConfig, originalDreamland);
}
const revision = execFileSync("git", ["rev-parse", "HEAD"], {
	cwd: root,
	encoding: "utf8",
}).trim();
process.env.PORTFOLIOS_SOURCE_URL =
	"https://github.com/Bl4ut0/PortfoliOS-Browser.JS/tree/" + revision;

pnpm(path.join(source, "packages/chrome"), ["build"]);
const output = path.resolve(root, "packages/chrome/dist");
const html = fs.readFileSync(path.join(output, "index.html"), "utf8");
const referenced = new Set(
	[
		...html.matchAll(
			/(?:src|href)="\/apps\/browser\/browserjs\/assets\/([^"]+)"/g
		),
	].map((m) => m[1])
);
// Remove only obsolete generated entry bundles, maps and unused upstream workers in the checked output.
if (output !== path.join(root, "packages/chrome/dist"))
	throw new Error("Unexpected output directory");
for (const file of fs.readdirSync(path.join(output, "assets")))
	if (/^index-.*\.(js|css)(\.map)?$/.test(file) && !referenced.has(file))
		fs.unlinkSync(path.join(output, "assets", file));
for (const file of ["sw.js", "controller.sw.js", "localcontrollersw.js"])
	if (fs.existsSync(path.join(output, file)))
		fs.unlinkSync(path.join(output, file));
for (const file of ["icon.png", "defaultfavicon.png"])
	fs.copyFileSync(
		path.join(source, "packages/chrome/public", file),
		path.join(output, file)
	);
fs.copyFileSync(path.join(source, "LICENSE"), path.join(output, "LICENSE"));
const artifacts = {};
for (const entry of fs.readdirSync(output, {
	recursive: true,
	withFileTypes: true,
})) {
	if (!entry.isFile() || entry.name === "release.json") continue;
	const absolute = path.join(entry.parentPath, entry.name);
	artifacts[path.relative(output, absolute).replaceAll("\\", "/")] = crypto
		.createHash("sha256")
		.update(fs.readFileSync(absolute))
		.digest("hex");
}
const dirty = !!execFileSync(
	"git",
	["status", "--porcelain", "--untracked-files=normal"],
	{ cwd: root, encoding: "utf8" }
).trim();
const receipt = {
	dirty,
	schemaVersion: 1,
	repository: "https://github.com/Bl4ut0/PortfoliOS-Browser.JS",
	revision,
	source: process.env.PORTFOLIOS_SOURCE_URL,
	build: "node scripts/build-portfolios.mjs --install",
	node: process.version,
	inputs: provenance,
	files: artifacts,
};
fs.writeFileSync(
	path.join(output, "release.json"),
	JSON.stringify(receipt, null, 2) + "\n"
);
console.log(
	"PortfoliOS browser build ready in packages/chrome/dist at source revision " +
		revision
);
