# Fork development and upstream maintenance

## Verified baseline

See [module.json](module.json) for the upstream commit and exact submodule revisions. The root package manager is pnpm@10.12.1; use the packageManager field rather than a different global pnpm version. Upstream requests Node.js 22+ and its current CI uses Node.js 24. The Git clone includes history, but submodules need initialization.

```sh
git submodule update --init external/dreamlandjs
corepack pnpm install --frozen-lockfile
corepack pnpm build:dreamland
```

external/playwright is a separate, large upstream fork. Initialize it only when working on the automation/test paths that require it. Do not replace pinned submodule revisions with their latest branches without a reviewed update.

## Full browser build

The Scramjet rewriter also requires Bash/GNU tools, Rust nightly with rust-src and wasm32-unknown-unknown, wasm-bindgen-cli 0.2.105, Binaryen wasm-opt, and r58playz/wasm-snip. The checked-in Rust toolchain follows nightly rather than an exact date; record the resolved nightly and remaining tool versions for each release. Use Linux/WSL or CI for the shell-based WASM pipeline. See [the toolchain action](../packages/scramjet/.github/actions/setup-rewriter-toolchain/action.yml) and [the rewriter script](../packages/scramjet/packages/core/rewriter/wasm/build.sh).

After preparing the toolchain and dependencies, the source build sequence is:

```sh
RELEASE=1 corepack pnpm rewriter:build
corepack pnpm build
corepack pnpm build
# Replace BOTH example endpoints with provisioned, authorized services.
VITE_WISP_URL=wss://relay.example.invalid/ VITE_ISOLATION_ORIGIN=https://sandbox.example.invalid corepack pnpm build:chrome
```

The repeated root build follows upstream CONTRIBUTING.md. Inspect build failures before proceeding; a successful frontend build alone does not prove a working rewriter or relay. The frontend artifact is packages/chrome/dist. The content isolation files are in packages/sandbox and require a separately configured origin. An ordinary static server pointed at the repository root is not a complete browser deployment.

For an independent production build, leave VITE_PUTER_BRANDING, VITE_PUTER_WISP_PROMOTION, VITE_SENTRY_URL, and VITE_PLAUSIBLE_URL unset. Upstream's CI frontend command uses Puter branding, telemetry, and its isolation origin; its artifact is not a configured PortfoliOS release. Public frontend configuration must never contain an API key or private relay credential.

## Development-server distinction

Upstream pnpm dev starts the UI, an isolation server, and a local Wisp relay. Its relay enables access to private/loopback destinations. Supplying VITE_WISP_URL selects a different client relay but does not disable the local relay listener. Do not expose or deploy that development server on the OS host. A later PortfoliOS development launcher should serve only the required static/UI services when using external egress.

## Checks for the current setup

The workspace generator requires only Node and Git, not the browser dependency/toolchain install:

```sh
node --check scripts/portfolios-workspace.mjs
node scripts/portfolios-workspace.mjs
git diff --check
```

The initial setup changes documentation and workspace tooling only; it does not establish a passing full WASM build or an operational hosted release. Full builds, real destination browsing, Desktop/Mobile sizing, profile isolation, close/reopen, and boot deferral are required for the first runtime integration release.

## Keep the fork current

origin is Bl4ut0/PortfoliOS-Browser.JS. upstream is HeyPuter/browser.js. Push your own changes only to origin.

```sh
git fetch upstream
git switch -c codex/update-browser-upstream
git merge upstream/main
```

Review changes, resolve conflicts without discarding PortfoliOS modifications, and update the baseline receipt and change log. Run the applicable build/verification steps, then merge into this fork's main branch. Use codex/ branches for feature work. Keep generated output and node_modules out of source commits. Never rebase or force-push shared main merely to match upstream.

Before publishing a runtime release, record the fork commit, upstream baseline, submodules, toolchain versions, build configuration, file checksums, and corresponding-source URL. The OS should pin that release and retain a known-working rollback. Publishing the source fork does not automatically publish or activate a runtime build.
