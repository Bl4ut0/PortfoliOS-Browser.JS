# PortfoliOS fork changes

## 2026-10-10 - Portable documentation and workspace references

- Made Git repository URLs the canonical cross-project references and kept intra-repository links relative.
- Removed machine-specific checkout locations and outdated migration instructions; corrected the build metadata link.
- Changed workspace discovery to use the OS origin URL from module metadata instead of checkout or npm package names.
- Updated the sibling-checkout release import examples and removed the prescribed host checkout name.

## 2026-10-10 - Native proxy settings and OS release build

- Moved the in-progress browser source modifications from the OS into this independent fork.
- Added Settings → Proxy with automatic/custom secure Wisp configuration, per-workspace opt-in persistence, status, and closable OS connection options.
- Adapted Settings and touch defaults for phones and scoped browser UI storage by workspace identifier.
- Added a validated parent bridge without exchanging Google credentials or SystemFS access.
- Kept rewritten content and its workers on external isolation origins; fixed delayed transport setup and relay changes for existing contexts.
- Added pinned precompiled engine/injection inputs, a standalone frontend build, temporary Windows Dreamland build compatibility, fingerprinted assets, release checksums, and exact-revision source links.
- Updated icons to the OS mount path and disabled upstream branding/authentication and telemetry for the production profile.
- Runtime changes are in packages/chrome/src/pages/{ProxySettings,SettingsPage,NewTabPage}.tsx, portfolios.ts, consts.ts, index.ts, proxy/{Controller,scramjet,wisp}.ts, services/{KVWrapper,SettingsService}.ts, Tab/Tab.tsx, assets/favicon.ts, and vite.config.ts.

## 2026-10-10 - Repository and workspace setup

- Forked HeyPuter/browser.js at 4bc4f86b226027f25cdce076c7124d1e0e6b36a3 into Bl4ut0/PortfoliOS-Browser.JS, preserving upstream Git history and license notices.
- Recorded the upstream baseline, pinned dependencies, module ownership, and integration status.
- Added workspace generation for the current OS checkout and its future sibling location under PortfoliOS.
- Added build/toolchain, external-relay, license/source publication, and integration documentation.
- Added a fork introduction above the original README. Upstream browser runtime code and deployment workflows remain unchanged.

No browser runtime release, public relay deployment, OS folder move, or live provider switch is included. Record future modified files/features and dates here, and link published releases to their exact source revisions.
