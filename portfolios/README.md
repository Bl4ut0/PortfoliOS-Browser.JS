# PortfoliOS-Browser.JS

This is the independently maintained PortfoliOS fork of [HeyPuter/browser.js](https://github.com/HeyPuter/browser.js). Fork: [Bl4ut0/PortfoliOS-Browser.JS](https://github.com/Bl4ut0/PortfoliOS-Browser.JS).

The fork preserves upstream history, licenses, and pinned submodules. It now owns native proxy settings, responsive Desktop/Mobile settings, the scoped OS host bridge, and a checked frontend build. PortfoliOS imports the build with its exact source revision and asset checksums; the OS repository owns deployment.

- [Workspace layout and OS migration](WORKSPACE.md)
- [Build prerequisites and upstream updates](DEVELOPMENT.md)
- [OS integration boundaries and delivery roadmap](INTEGRATION.md)
- [Fork change log](CHANGELOG.md)
- [Machine-readable module information](module.json)
- [Upstream contribution instructions](../CONTRIBUTING.md)
- [License](../LICENSE)

## Ownership

Keep browser engine/UI changes in this repository. Keep the OS launcher, app lifecycle, profile selection, Google authentication, SystemFS, and Drive sync in [PortfoliOS](https://github.com/Bl4ut0/PortfoliOS). Exchange reviewed release artifacts and a narrowly defined interface; avoid a second editable copy of the engine in the OS repository.

The browser runs on the client and obtains destination traffic from an external relay. Serving its static assets is separate from operating that relay. A production release must explicitly select an authorized external Wisp service; the OS server must not become the browsing traffic relay.

## License and attribution

Upstream declares AGPL-3.0-only. Keep the original license, copyright notices, and third-party licenses, and record dated modifications in the change log. When a modified network-interactive build is deployed, provide a prominent link to its corresponding source, including the actual release revision and build instructions. A fork does not grant permission or capacity to use an upstream relay service. Repository separation is an engineering boundary and does not by itself determine the license treatment of a combined work.

The upstream automatic discovery endpoint returned an authorization error for the fork origin during integration on 2026-10-10. The UI reports this and opens Proxy settings when navigation cannot connect. Production browsing requires a Wisp endpoint that authorizes PortfoliOS, or the explicit Hosted Browser.js option in OS connection settings. Hosted Browser.js opens its own New Tab page without forwarding the attempted destination. Demo-only public relay services are not configured as production fallbacks.
