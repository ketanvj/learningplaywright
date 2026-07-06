# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
# Run all tests (all browsers)
npx playwright test

# Run a single test file
npx playwright test tests/12-Jun-26/frame.spec.js

# Run tests on a specific browser
npx playwright test --project=chromium
npx playwright test --project=firefox
npx playwright test --project=webkit

# Run only API tests (no browser needed)
npx playwright test --project=api

# Run in headed mode (see the browser)
npx playwright test --headed

# Run a single test by name
npx playwright test -g "test name substring"

# View HTML report after a run
npx playwright show-report

# Generate and view the Allure report (after a run produces allure-results/)
npx allure generate allure-results --clean -o allure-report
npx allure open allure-report

# Install browsers
npx playwright install
```

### Sub-projects with their own config

`tests/02-Jul-26/auth-best-practices/` and `tests/03-Jul-26/auth-best-practices/` are self-contained
mini-projects with a dedicated Playwright config (`playwright.config.auth-bp.js`), not the root
`playwright.config.js`. Run them explicitly:

```bash
npx playwright test --config=tests/03-Jul-26/auth-best-practices/playwright.config.auth-bp.js
```

This config uses Playwright's **setup project** pattern: `*.setup.js` projects log in and save
`storageState` to `.auth/*.json`, and dependent test projects load that state so tests start
already authenticated. It also declares a `webServer` array expecting a sibling HealthHub app at
`../../../backend` (port 3001) and `../../../frontend` (port 5173) — see below.

## The HealthHub app dependency

A large and growing share of tests (everything using `data-testid` locators, `/login`, `/dashboard`,
`/appointments`, and anything against `localhost:5173` / `localhost:3001/api/v1`) exercises an
external "HealthHub Patient Portal" app that is **not part of this repository**. These tests require:

- Frontend dev server at `http://localhost:5173`
- Backend API at `http://localhost:3001/api/v1`
- Login credentials `patient@healthhub.test` / `Test123!`

If that app isn't running locally, any test touching those hosts will fail/timeout — that's an
environment issue, not a bug in the test.

The root `playwright.config.js` has no `baseURL` and no `webServer`, so most files targeting the
HealthHub app hardcode `http://localhost:5173/...` in full. Exceptions: files under
`tests/06-Jul-26/` import a shared fixtures file (`steps-fixtures.fixed.js`) that sets a default
`baseURL` so they can use relative paths like `page.goto('/login')`.

## Project structure

This is a learning/practice repository for Playwright test automation. Tests are organized into
dated subdirectories under `tests/`, each representing a class/session. Newer dates = more advanced
topics. Folders past `12-Jun-26` shift from the public practice sites to the HealthHub app.

| Date folder | Topics covered |
|---|---|
| `22-May-26` | Browser context, raw Playwright API (no test runner) |
| `03-Jun-26` | Locators, describe blocks |
| `04-Jun-26` | Locators deep dive, new tab handling |
| `05-Jun-26` | Describe blocks, NichethySelf Tourism login |
| `08-Jun-26` | Actions: clear, checkboxes, dropdowns |
| `09-Jun-26` | File upload, timeouts |
| `10-Jun-26` | Alerts (dialog event listener) |
| `11-Jun-26` | Alerts, double-click, drag-and-drop, file download |
| `12-Jun-26` | iframes (`frameLocator`), hover |
| `15-Jun-26` | New tab / popup windows |
| `16-Jun-26` | Popups, screenshot snapshots (`toHaveScreenshot`) |
| `17-Jun-26` | ARIA snapshots (`toMatchAriaSnapshot`), built-in fixtures |
| `18-Jun-26` | Custom fixtures via `test.extend()` |
| `19-Jun-26` | Fixture options, `expect()` assertion catalogue (page/locator assertions) |
| `22-Jun-26` | Annotations (`test.skip`, `test.fixme`, conditional skips) |
| `23-Jun-26` | `testInfo` metadata, tagging (`{ tag: [...] }`) |
| `24-Jun-26` | API testing (`request` fixture, `*.api.spec.js`) |
| `25-Jun-26` | API mocking (`page.route()`), API-driven setup/teardown |
| `29-Jun-26` | Parameterized tests (data-driven from JSON/CSV in `test-data/`) |
| `30-Jun-26` | Page Object Model basics |
| `01-Jul-26` | Page Object Model with fixtures, page components (`page-object-model/`) |
| `02-Jul-26`, `03-Jul-26` | Auth best practices: `storageState`, setup projects, multi-role/worker-scoped auth (`auth-best-practices/`) |
| `06-Jul-26` | Allure reporting: metadata, steps/hierarchy, attachments/params, and a deliberately-uneven demo-failures suite for the Allure Categories widget |

The two root-level spec files (`example.spec.js`, `tourismlogin.spec.js`) are earlier exercises from
before the dated folder structure was adopted.

## Key conventions

- **ESM only** — `package.json` sets `"type": "module"`, so all files use `import`/`export`.
- **Locator strategy has evolved across the course**: early files (public practice sites) prefer
  `getByRole()`/`getByPlaceholder()`; files from `22-Jun-26` onward that target the HealthHub app
  prefer `getByTestId()` against `data-testid` attributes (no custom `testIdAttribute` is configured,
  so this is Playwright's default).
- **Test sites used**: `https://the-internet.herokuapp.com` (most early exercises),
  `https://nichethyself.com/tourism/` (login/form exercises), `https://healthybites.nichethyself.com/`
  (assertion exercises), and the external HealthHub app at `localhost:5173`/`localhost:3001` (most
  exercises from `16-Jun-26` onward — see above).
- **Allure reporting** (`allure-playwright` + `allure-js-commons`) is wired into the root config
  alongside the HTML reporter, writing to `allure-results/`. Files that use `allure.*` calls guard the
  import (`try { await import('allure-js-commons') } catch { allure = null }`) and call `allure?.foo()`
  so tests still work if allure isn't installed.
- `downloads/` — file download tests save here; `screenshots/` — screenshot tests save here. Both are
  gitignored via the Playwright `.gitignore` entries.
- `.auth/*.json` storage-state files under `auth-best-practices/` are checked in as recorded demo
  output for the training material, not live secrets.

## Config highlights (`playwright.config.js`)

- Global timeout: 60 min, per-test timeout: 30s, expect timeout: 7s, navigation timeout: 8s
- Runs on chromium, firefox, and webkit in parallel by default; a separate `api` project matches
  `**/*.api.spec.js` and runs without a browser
- Reporters: HTML (`npx playwright show-report`) and `allure-playwright` (writes to `allure-results/`)
- No `baseURL` configured — tests specify full URLs inline (except `tests/06-Jul-26/`, see above)
- CI runs via `.github/workflows/playwright.yml` on push/PR to `main`/`master`: `npm ci` →
  `playwright install --with-deps` → `npx playwright test`, uploading `playwright-report/` as an
  artifact
