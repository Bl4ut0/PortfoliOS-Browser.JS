# PortfoliOS multi-repository workspace

The parent folder is an ordinary workspace folder. Each project has its own Git repository, history, dependencies, checks, and release process. Do not initialize Git in the parent folder or copy one project's .git directory into another.

## Intended layout

```text
C:/Dev Projects/PortfoliOS/
  PortfoliOS.code-workspace
  README.md
  bl4ut0-portfolio-os/       # existing OS checkout; owner moves it here
  PortfoliOS-Browser.JS/    # independent Browser.js fork
  ...                      # additional app repositories when selected
```

| Repository            | Responsibility                                                                         | GitHub                                                                          |
| --------------------- | -------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------- |
| bl4ut0-portfolio-os   | Boot/login, Desktop/Mobile shells, app catalog, lifecycle, SystemFS, Google/Drive      | [Bl4ut0/PortfoliOS](https://github.com/Bl4ut0/PortfoliOS)                       |
| PortfoliOS-Browser.JS | Browser UI, navigation/tabs, rewriting engine, browser-owned settings, build artifacts | [Bl4ut0/PortfoliOS-Browser.JS](https://github.com/Bl4ut0/PortfoliOS-Browser.JS) |

The existing OS checkout initially stays at C:/Dev Projects/bl4ut0-portfolio-os. The workspace generator supports that location until it is moved. It does not change either repository, move files, install dependencies, or configure deployment.

## Open the workspace now

From the Browser fork root:

```powershell
node scripts/portfolios-workspace.mjs
node scripts/portfolios-workspace.mjs --write
```

The first command previews the detected paths. The second creates PortfoliOS.code-workspace in the parent folder. Open that file in a workspace-aware editor. It uses relative paths and keeps both repositories independent. Codex projects may still need to be reopened at their new folder locations after a move.

## Move the OS checkout when ready

1. Finish or stop terminals, development servers, and tools using the old OS path.
2. Move the entire bl4ut0-portfolio-os folder into PortfoliOS, preserving its name, .git, ignored local configuration, and working changes. Do not create a new Git repository or upload ignored configuration.
3. Reopen the OS project at its new location. Check terminal working directories, editor tasks, shortcuts, local server commands, and any external tools configured with an absolute path. The existing OS README contains an old absolute development path and should be updated with that migration.
4. Run the workspace generator with --write again. It detects the moved checkout and updates only the managed OS/Browser folder entries; other workspace settings and folder entries are preserved. It refuses ambiguous layouts and an existing unmanaged workspace file.
5. In each repository, verify git status, git remote -v, and git rev-parse --show-toplevel. Run the OS checks and its deployment dry run from the new working directory before the next release. Moving a checkout does not require a production release by itself.

Do not move or remove third_party/browserjs as part of the folder relocation. Any in-progress vendored engine changes must first be reviewed and migrated into the independent fork in a separate integration change. Generated engine files can then be replaced by a pinned release artifact after validation.

## Adding another app repository

Start a separate fork only after selecting an upstream project and checking its license/build requirements. Preserve its history and notices, add a PortfoliOS integration/change log, and define its own artifact and verification process. Keep the lightweight app adapter and catalog entry in the OS. Update the workspace folder list to include the new sibling repository. Keep shared OS authentication and file APIs in the OS rather than cloning them into every app.
