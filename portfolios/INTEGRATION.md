# PortfoliOS browser integration

The fork supplies the trusted Browser.js interface and rewriting runtime. PortfoliOS imports its checked build and loads it only when Browser opens. Desktop and Mobile share the OS host adapter.

## Runtime boundary

- The trusted interface loads through `/apps/browser/browserjs.php` in a credentialless, sandboxed iframe. This maintained code has the same origin as PortfoliOS and must be reviewed with that trust in mind; credentialless storage does not prevent same-origin DOM access.
- Rewritten websites and their service workers remain on external `*.puter.zone` origins. No proxy service worker is installed under the OS origin.
- The OS parent retains COOP/COEP isolation. Only the trusted browser document opts out of COEP.
- Website traffic uses the external upstream Wisp discovery service by default, or a user-selected secure Wisp endpoint. The OS server serves static browser assets and does not relay destination traffic. External service availability is outside this fork.
- Credentialless storage belongs to the top-level document and child origin. PortfoliOS retains its provider ownership/reload guard when changing workspace accounts. Browser UI storage keys also include the workspace identifier.

## Host protocol, version 1

Messages use explicit same-origin target origins. The parent accepts only the active browser frame; the browser accepts only its parent. Request IDs pair requests and responses.

| Direction    | Source                    | Type        | Payload                                     |
| ------------ | ------------------------- | ----------- | ------------------------------------------- |
| Browser → OS | `portfolios-browser`      | `ready`     | requestId                                   |
| Browser → OS | `portfolios-browser`      | `configure` | requestId, config: mode, endpoint, remember |
| Browser → OS | `portfolios-browser`      | `options`   | requestId                                   |
| OS → Browser | `portfolios-browser-host` | response    | requestId, config, optional error           |

The URL supplies `workspace` (opaque profile identifier), `mobile=1` (touch defaults), and optional `openUrl`. It never supplies Google credentials, profile email, Drive tokens, SystemFS access, or private files.

Settings → Proxy owns relay configuration. Custom endpoints require `wss:` and reject credentials, query parameters, and fragments. Only an explicitly remembered endpoint enters OS profile preferences and Drive backup. Upstream discovered access URLs remain in memory. Browser cookies/history are temporary credentialless browser state and are not backed up.

The native settings page can open OS connection options for Scramjet, external proxy sites, or optional Hyperbeam. Back to browser and Escape close those options while retaining the existing browser frame. Choosing a different provider explicitly replaces it. Hyperbeam keeps the OS's existing quota, authorization, and lifecycle limits.

## Release delivery

Run the build in this fork and commit its source changes. Build again from that clean commit so `release.json` and the UI's source links identify the corresponding revision. In PortfoliOS:

```sh
node scripts/import-browserjs.mjs /path/to/PortfoliOS-Browser.JS
npm test
node scripts/check-browserjs-browser.js
node scripts/check-browser-providers.js
```

The importer checks checkout identity, a clean working tree, required files, safe paths, and every SHA-256 checksum. PortfoliOS commits the release receipt and generated assets, bumps its cache version, deploys assets before entry points, and verifies the live build. This fork has no independent production hosting command. Roll back by importing a previously validated fork revision and deploying it with a fresh OS release version.
