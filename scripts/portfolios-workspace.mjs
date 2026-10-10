import {
	existsSync,
	readdirSync,
	readFileSync,
	realpathSync,
	writeFileSync,
} from "node:fs";
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
const moduleInfo = JSON.parse(
	readFileSync(join(forkRoot, "portfolios/module.json"), "utf8")
);
const hostRepository = moduleInfo.host.repository;

function repositoryKey(remote) {
	try {
		const url = new URL(
			remote.trim().replace(/^git@github\.com:/i, "https://github.com/")
		);
		if (
			url.hostname.toLowerCase() !== "github.com" ||
			!["https:", "ssh:"].includes(url.protocol)
		)
			return null;
		return (
			url.hostname + url.pathname.replace(/\/+$/, "").replace(/\.git$/i, "")
		).toLowerCase();
	} catch {
		return null;
	}
}

const expectedOrigin = repositoryKey(hostRepository);
if (!expectedOrigin) throw new Error("Invalid host repository in module.json.");
const osCandidates = readdirSync(workspaceRoot, { withFileTypes: true })
	.filter((entry) => entry.isDirectory() || entry.isSymbolicLink())
	.map((entry) => join(workspaceRoot, entry.name));

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
	if (!isRepoRoot(directory)) return false;
	const origin = spawnSync(
		"git",
		["-C", directory, "remote", "get-url", "origin"],
		{
			encoding: "utf8",
			windowsHide: true,
		}
	);
	return origin.status === 0 && repositoryKey(origin.stdout) === expectedOrigin;
});
if (osFolders.length !== 1) {
	throw new Error(
		"Expected exactly one sibling checkout of " +
			hostRepository +
			". Found " +
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
