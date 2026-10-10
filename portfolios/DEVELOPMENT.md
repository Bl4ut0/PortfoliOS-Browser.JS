# Build and maintain the PortfoliOS browser

The upstream source baseline and pinned submodules are recorded in [moduleInfo.json](moduleInfo.json). Use Node.js 22+ and pnpm 10.12.1. The PortfoliOS frontend build does not require a local Rust installation.

```sh
git submodule update --init external/dreamlandjs
node scripts/build-portfolios.mjs --install
```

This installs the selected frontend workspace dependencies with lifecycle scripts disabled, builds Dreamland, and builds Browser.js into `packages/chrome/dist`. A temporary Windows absolute-path fix is applied to Dreamland's Rollup configuration during its build and restored afterward. The pinned submodule stays clean.

[build-inputs.json](build-inputs.json) pins the official Scramjet 2.0.67-alpha.2 precompiled package by SHA-512 and the upstream injection bundle by SHA-256. The build downloads these inputs when absent and verifies them before use. It rebuilds the modified browser interface; it does **not** rebuild these engine binaries from Rust source. Changes to rewriting/injection source require replacing this precompiled input profile with a validated source build.

The output contains fingerprinted JS/CSS, the engine WASM, injection runtime, icons, AGPL license, and a `release.json` receipt with the fork revision, Node version, input pins, and artifact checksums. Generated output, dependencies, and scratch files stay ignored. Source links in the interface point to the exact fork commit used to build it.

Production settings disable Puter branding/authentication and upstream telemetry. Browser assets are mounted at `/apps/browser/browserjs/`; rewritten content uses the external `https://puter.zone` isolation service. Default Wisp discovery uses the same public upstream service as the existing PortfoliOS provider. Users can choose another secure Wisp service in Settings → Proxy. HTTP/SOCKS proxies are not Wisp endpoints.

## Validate and import

```sh
node --check scripts/build-portfolios.mjs
git diff --check
# Commit completed source changes, then build from the clean revision.
node scripts/build-portfolios.mjs
```

Import the artifact using PortfoliOS's `scripts/import-browserjs.mjs`. That script rejects a dirty source checkout and mismatched checksums. The OS repository owns Desktop/Mobile UI tests, public reset/private profile tests, provider lifecycle tests, production deployment, and live browsing checks.

The upstream full Rust/WASM workflow remains in [CONTRIBUTING.md](../CONTRIBUTING.md) and `packages/scramjet/packages/core/rewriter/wasm/build.sh`. It requires the Rust nightly toolchain, Bash/GNU tools, wasm-bindgen, Binaryen, and wasm-snip. Initialize `external/playwright` only when developing automation paths that need it. Do not expose the upstream development relay on the PortfoliOS server.

## Upstream updates

`origin` is this fork; `upstream` is HeyPuter/browser.js. Use a `codex/` feature branch for upstream updates, preserve PortfoliOS settings/bridge modifications, update source and binary pins together, and run the integration checks before publishing a new runtime. Never force-push shared main. The independent checkout and workspace generator remain described in [WORKSPACE.md](WORKSPACE.md).

The upstream automatic discovery endpoint returned an authorization error for the fork origin during integration on 2026-10-10. The UI reports this and opens Proxy settings when navigation cannot connect. Production browsing requires a Wisp endpoint that authorizes PortfoliOS, or the explicit Hosted Browser.js option in OS connection settings. Hosted Browser.js opens its own New Tab page without forwarding the attempted destination. Demo-only public relay services are not configured as production fallbacks.
