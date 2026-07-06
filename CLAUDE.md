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

# Run in headed mode (see the browser)
npx playwright test --headed

# Run only tests tagged with test.only
npx playwright test tests/08-Jun-26/action.spec.js

# View HTML report after a run
npx playwright show-report

# Install browsers
npx playwright install
```

## Project structure

This is a learning/practice repository for Playwright test automation. Tests are organized into dated subdirectories under `tests/`, each representing a class/session. Newer dates = more advanced topics.

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

The two root-level spec files (`example.spec.js`, `tourismlogin.spec.js`) are earlier exercises from before the dated folder structure was adopted.

## Key conventions

- **ESM only** — `package.json` sets `"type": "module"`, so all files use `import`/`export`.
- **Preferred locator strategy**: `getByRole()` over CSS/XPath. Comments in the files explicitly note this preference.
- **Test sites used**: `https://the-internet.herokuapp.com` (most exercises), `https://nichethyself.com/tourism/` (login/form exercises), `https://healthybites.nichethyself.com/` (more advanced scenarios including alerts and frames).
- **Frame tests** (`12-Jun-26/frame.spec.js`) expect a local dev server at `http://localhost:5173` with login credentials `patient@healthhub.test` / `Test123!`.
- `downloads/` — file download tests save here; `screenshots/` — screenshot tests save here. Both are gitignored via the Playwright `.gitignore` entries.

## Config highlights (`playwright.config.js`)

- Global timeout: 60 min, per-test timeout: 30s, expect timeout: 7s, navigation timeout: 8s
- Runs on chromium, firefox, and webkit in parallel by default
- HTML reporter — open with `npx playwright show-report` after a run
- No `baseURL` configured — tests specify full URLs inline
