# joggle-action

Run [joggle](https://github.com/autotelic/joggle) in GitHub Actions. Findings arrive
as workflow annotations, and a pull request is checked for its own work only.

joggle is the layer above the linter and the typechecker. `tsc` checks one program,
`oxlint` checks one file, and joggle checks the codebase: it indexes the project into
facts, generates candidates deterministically, and asks a judgement model the narrow
questions a single file cannot answer.

## Quick start

```yaml
name: joggle
on: [push, pull_request]

jobs:
  joggle:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0

      - uses: actions/setup-node@v4
        with:
          node-version: 24

      - uses: autotelic/joggle-action@v1
```

On a pull request this checks the pull request's own work. On every other event it
checks the whole project.

`fetch-depth: 0` gives the run a merge base. A shallow checkout works too: the action
unshallows before a scoped run.

## No key, no tokens

Judgements are cached per question in `.joggle/answers.json`. Commit that file, and CI
replays every verdict with no key and no tokens:

```yaml
      - uses: autotelic/joggle-action@v1
```

Without the cache, the judged rules report as skipped and the deterministic rules still
run. To judge new candidates, pass a key:

```yaml
      - uses: autotelic/joggle-action@v1
        with:
          api-key: ${{ secrets.TYPESAFE_API_KEY }}
```

Only the evidence panel of a candidate, with its source excerpts, goes to
`api.typesafe.ai`. `offline: "true"` sends nothing at all.

## Inputs

| Input | Default | Description |
| --- | --- | --- |
| `version` | `latest` | The `@autotelic/joggle` version to run. Pin it for a reproducible run. |
| `api-key` | | TypeSafe API key. Omit to run the deterministic rules only. |
| `scope` | `auto` | `auto`, `pr`, `changed`, `since`, or `all`. |
| `since` | `origin/main` | Git revision to scope against when `scope` is `since`. |
| `paths` | | Files or directories to analyse. The default is whatever `tsgo` lists. |
| `rules` | | Only run these rule ids, comma-separated. |
| `baseline` | | Report only findings that are not already accepted in this baseline file. |
| `typecheck` | `false` | Carry tsgo's own diagnostics as `joggle/typecheck` findings. |
| `types` | `false` | Resolve declaration types through tsgo's trace. Enables the type-aware rules. |
| `no-tsgo` | `false` | Never invoke tsgo; walk the paths on disk instead. |
| `max-warnings` | `-1` | Fail when warnings exceed this number. `-1` disables the check. |
| `offline` | `false` | Answer only from the committed verdict cache; never call the model. |
| `working-directory` | `.` | Directory to run in. Use it for a monorepo. |

## Scope

| Value | What it checks |
| --- | --- |
| `auto` | The pull request's own work on `pull_request`; the whole project otherwise. |
| `pr` | The pull request for the current branch, or the pull request number of the event. |
| `changed` | Files changed since the last stored run. Machine-local, so CI has no memory of it. |
| `since` | Files changed since the `since` revision, from git. |
| `all` | The whole project. |

`pr` and `since` need the fork point, so the checkout must not be shallow. Use
`fetch-depth: 0`, or let the action unshallow for you.

## Requirements

1. **Node.js 24 or later.** Add `actions/setup-node` before this action.
2. **The TypeScript native preview compiler, `tsgo`.** joggle looks in
   `node_modules/.bin/tsgo` first, then on `PATH`. Install
   `@typescript/native-preview`, or set `no-tsgo: "true"` to analyse the files on
   disk without the compiler's view.
3. **A git checkout.** joggle builds its report from the files on disk.

## Example: a monorepo package

```yaml
      - uses: autotelic/joggle-action@v1
        with:
          working-directory: packages/api
          scope: all
          baseline: .joggle/baseline.json
          max-warnings: 0
```

## A note on the pin

Pin a full version tag for a reproducible run (`autotelic/joggle-action@v1.2.3`), or
the moving major tag (`@v1`) to follow fixes.
