# OS integration plan

Status: source fork and workspace setup. No new browser protocol, deployment, or OS provider switch is implemented by this initial commit.

## Boundaries

| Owner                   | Contents                                                                                                                             |
| ----------------------- | ------------------------------------------------------------------------------------------------------------------------------------ |
| OS repository           | App registration, desktop/mobile host, lazy loader, window lifecycle, current user profile, SystemFS, cloud authorization and backup |
| Browser fork            | Tabs, address bar, history/bookmarks, rendering/rewriting, browser settings, build pipeline                                          |
| Separate content origin | Rewritten destination documents and the upstream isolation controller                                                                |
| External relay operator | Website HTTP/TLS/WebSocket egress; capacity, access terms, quotas and traffic policy                                                 |

The production design loads browser code only when the Browser app opens. OS boot and login must not import the engine or start relay connections. Serve browser assets on an isolated origin rather than installing its service worker under the privileged OS origin. Serve rewritten content on its own isolation origin. Keep browser asset hosting and destination traffic relay independent.

## Planned host interface

Implement and version a narrow message interface only when integrating the fork. Validate the sender's origin, source window, message shape, and allowed action; never send unrestricted commands or use a wildcard target origin. Useful initial actions are ready, open URL, focus, theme/UI mode, download request, and disposal. These are proposed capabilities, not currently supported messages. Upstream currently reads openUrl from the page URL; that is not a complete authenticated host bridge or profile boundary.

Do not send OS Google tokens, Drive credentials, profile emails, SystemFS handles, or private files into a browsing frame. File import/export must follow an explicit OS-owned user action and controlled transfer. Browser UI defaults and bookmarks can later use a reviewed adapter; cookies, passwords, and session tokens must not silently enter Drive backup. Apps never own Google authentication or call Drive sync directly.

Credentialless storage is partitioned by the top-level document and embedded origin, not by individual iframe. A stable origin must not silently share browsing state across OS profiles. Until a verified stronger isolation strategy exists, retain the OS partition ownership/reload gate. A new Browser.js internal profile alone does not prove separation of cookies, service-worker caches, or destination storage. Closing the iframe alone does not prove those have been erased.

## Delivery sequence

1. **Repository setup (this change):** independent fork, preserved history/license/submodules, provenance, workspace tooling and documentation.
2. **PortfoliOS build profile:** fork identity/source link, no upstream telemetry by default, explicit external relay selection, UI-only development launcher, documented multi-origin static hosting. Rebuild the WASM engine and record release provenance.
3. **Browser host adapter:** implement the narrow interface and align desktop/mobile layout, theme, keyboard/touch controls, navigation, downloads, errors, and close/reopen. Keep expensive work outside boot/login. Review any in-progress OS vendored changes before porting them here.
4. **Profile/storage validation:** verify public reset, private-to-public switching, partition ownership, local browser data handling, and explicit file export. Demonstrate with two different workspace accounts.
5. **Pinned production integration:** publish reviewed assets and corresponding source, configure the OS to that immutable release, run OS/browser checks, deploy assets before HTML, verify real destinations on desktop/mobile, and retain rollback. Use the OS repository's deployment policy for that runtime change.

A free public relay is not an entitlement or an uptime guarantee. Provider availability and use terms need verification before a release. ProxySite/hide.me are external proxy websites, not interchangeable Wisp endpoints. Hyperbeam remains an independently configured remote-browser provider with its existing quota controls.
