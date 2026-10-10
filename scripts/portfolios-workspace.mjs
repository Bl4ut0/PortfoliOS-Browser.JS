import { existsSync, readFileSync, realpathSync, writeFileSync } from "node:fs";
import { dirname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";

const args = process.argv.slice(2);
if (args.some((arg) => arg !== "--write") || args.length > 1) {
	throw new Error("Usage: node scripts/portfolios-workspace.mjs [--write]");
}

const forkRoot = realpathSync(fileURLToPath(new URL("..", import.meta.url)));
const workspaceRoot = dirname(forkRoot);
const workspaceFile = join(workspaceRoot, "PortfoliOS.code-workspace");
const generatorId = "PortfoliOS-Browser.JS/workspace-v1";
const osCandidates = [
	join(workspaceRoot, "bl4ut0-portfolio-os"),
	join(dirname(workspaceRoot), "bl4ut0-portfolio-os"),
];

function isRepoRoot(directory) {
	if (!existsSync(directory)) return false;
	const result = spawnSync(
		"git",
		["-C", directory, "rev-parse", "--show-toplevel"],
		{
			encoding: "utf8",
			windowsHide: true,
		}
	);
	return (
		result.status === 0 &&
		realpathSync(result.stdout.trim()) === realpathSync(directory)
	);
}

if (!isRepoRoot(forkRoot))
	throw new Error("Run from a complete Browser fork checkout.");
const osFolders = osCandidates.filter((directory) => {
	const packageFile = join(directory, "package.json");
	return (
		isRepoRoot(directory) &&
		existsSync(packageFile) &&
		JSON.parse(readFileSync(packageFile, "utf8")).name === "bl4ut0-portfolio-os"
	);
});
if (osFolders.length !== 1) {
	throw new Error(
		"Expected exactly one OS checkout beside the Browser fork or beside the parent workspace. Found " +
			osFolders.length +
			". No files changed."
	);
}

const managedFolders = [
	{
		name: "PortfoliOS",
		path: relative(workspaceRoot, osFolders[0]).replaceAll("\\", "/"),
	},
	{
		name: "PortfoliOS-Browser.JS",
		path: relative(workspaceRoot, forkRoot).replaceAll("\\", "/"),
	},
];
let workspace = { folders: [], portfoliosWorkspace: generatorId };
if (existsSync(workspaceFile)) {
	workspace = JSON.parse(readFileSync(workspaceFile, "utf8"));
	if (
		workspace.portfoliosWorkspace !== generatorId ||
		!Array.isArray(workspace.folders)
	) {
		throw new Error(
			"Existing workspace is not managed by this generator. No files changed."
		);
	}
}
const managedNames = new Set(managedFolders.map((folder) => folder.name));
workspace.folders = [
	...managedFolders,
	...workspace.folders.filter((folder) => !managedNames.has(folder.name)),
];
const output = JSON.stringify(workspace, null, 2) + "\n";
console.log("Workspace: " + workspaceFile);
for (const folder of managedFolders)
	console.log(folder.name + ": " + resolve(workspaceRoot, folder.path));
if (args.includes("--write")) {
	if (
		!existsSync(workspaceFile) ||
		readFileSync(workspaceFile, "utf8") !== output
	) {
		writeFileSync(workspaceFile, output, {
			encoding: "utf8",
			flag: existsSync(workspaceFile) ? "w" : "wx",
		});
		console.log("Workspace written. No repositories moved or changed.");
	} else {
		console.log("Workspace is already current.");
	}
} else {
	console.log("Preview only. Add --write to create/update the workspace file.");
}
