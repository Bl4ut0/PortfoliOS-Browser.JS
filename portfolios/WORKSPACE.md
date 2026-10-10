# PortfoliOS multi-repository workspace

The parent is the [PortfoliOS-Orchestration documentation repository](https://github.com/Bl4ut0/PortfoliOS-Orchestration), with [shared agent instructions](https://github.com/Bl4ut0/PortfoliOS-Orchestration/blob/main/AGENTS.md) and [core standards](https://github.com/Bl4ut0/PortfoliOS-Orchestration/tree/main/docs/core). Each child project retains its own Git history, dependencies, checks and release process. Repository URLs are the canonical identities.

## Repositories and references

| Repository | Responsibility | Documentation |
| --- | --- | --- |
| [Bl4ut0/PortfoliOS](https://github.com/Bl4ut0/PortfoliOS) | Boot/login, Desktop/Mobile shells, app catalog, lifecycle, SystemFS, Google/Drive, and production deployment | [OS README](https://github.com/Bl4ut0/PortfoliOS/blob/main/README.md), [browser adapter and release import](https://github.com/Bl4ut0/PortfoliOS/blob/main/docs/BROWSER_PROVIDERS.md) |
| [Bl4ut0/PortfoliOS-Browser.JS](https://github.com/Bl4ut0/PortfoliOS-Browser.JS) | Browser UI, navigation/tabs, rewriting engine, browser-owned settings, and release artifacts | [Fork guide](README.md), [build](DEVELOPMENT.md), [host protocol](INTEGRATION.md) |

Use repository-relative links within a repository and full GitHub URLs across repositories. Use commit or tag URLs for release provenance and historical evidence; use the default branch for current guides. Do not publish drive letters, user-home paths, absolute checkout locations, or file URLs as project references.

## Create a portable workspace

Clone [PortfoliOS-Orchestration](https://github.com/Bl4ut0/PortfoliOS-Orchestration) into a directory of your choice, then clone both project repositories from its root:

```sh
git clone https://github.com/Bl4ut0/PortfoliOS.git
git clone https://github.com/Bl4ut0/PortfoliOS-Browser.JS.git
```

The default clone names give this relative layout:

```text
workspace/
  PortfoliOS.code-workspace
  PortfoliOS/
  PortfoliOS-Browser.JS/
```

The parent directory and checkout names can differ. The workspace generator discovers the OS among sibling Git roots using the origin repository URL from [module.json](module.json), accepting HTTPS and SSH remotes. It does not infer repository identity from a folder name or an npm package name. Keep exactly one sibling checkout of the OS repository.

From the Browser fork root:

```sh
node scripts/portfolios-workspace.mjs
node scripts/portfolios-workspace.mjs --write
```

The first command previews the detected paths. The second creates or updates `PortfoliOS.code-workspace` in the parent directory. Open that file in a workspace-aware editor. Its folder entries are relative; other editor settings and additional folder entries are preserved. The generator refuses an unmanaged workspace file or ambiguous OS checkouts.

The parent tracks shared documentation and workspace configuration while its `.gitignore` excludes project checkouts. Do not stage child repositories as submodules, copy Git metadata between projects, or move their source into parent history. The generator updates only editor configuration; it does not move projects, install dependencies or configure deployment.

## After moving or renaming a checkout

1. Stop tools using the checkout, then move the complete repository with its `.git`, ignored configuration, and working changes.
2. Reopen the project and update any external editor, terminal, or development-server settings.
3. Keep the repositories as siblings and run the workspace generator with `--write`.
4. In each repository, check `git status`, `git remote -v`, and `git rev-parse --show-toplevel`. Run relevant checks before the next release.

Moving a checkout does not require a runtime release. Keep ignored configuration private and preserve unrelated working changes.

## Browser source and delivery

Editable browser source belongs in [PortfoliOS-Browser.JS](https://github.com/Bl4ut0/PortfoliOS-Browser.JS). The OS adapter imports checked, generated release assets with the exact fork revision and checksums. See [the fork delivery guide](INTEGRATION.md#release-delivery) and [the OS importer](https://github.com/Bl4ut0/PortfoliOS/blob/main/scripts/import-browserjs.mjs). There is no second editable engine copy in the OS.

## Adding another app repository

Select an upstream project and check its license/build requirements before creating a separate fork. Preserve its history and notices, record its canonical Git repository URL and upstream revision, and provide repository-hosted build, integration, and release documentation.

Keep the lightweight app adapter and catalog entry in [PortfoliOS](https://github.com/Bl4ut0/PortfoliOS). Keep shared OS authentication and file APIs there. Define the app repository's own artifact and verification process, then add its relative checkout entry to the editor workspace. Cross-project documentation must link back to the Git repository, independent of where a contributor clones it.
