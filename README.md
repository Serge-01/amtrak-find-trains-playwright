# Amtrak "Find Trains" — Playwright test suite

Automated tests for the **Find Trains** search form on [amtrak.com/home](https://www.amtrak.com/home),
written in Playwright + TypeScript. The scope ends at the **Find Trains** click: the suite checks
how the form behaves and that the click sends exactly the search that was entered.
Results pages and booking are out of scope.

The approach, assumptions, coverage and "with more time" list are in the
**[test plan](docs/test-plan.md)**.

## Setup

**Prerequisites:** Node.js 20.12 or later, npm, git.

```
git clone https://github.com/Serge-01/amtrak-find-trains-playwright.git
cd amtrak-find-trains-playwright
npm ci
npx playwright install chromium
```

- `npm ci` installs the exact versions in `package-lock.json` (Playwright 1.63.0, TypeScript 7.0.2).
- `npx playwright install chromium` downloads the browser Playwright drives. On Linux, add
  `--with-deps` to install the system libraries it needs.

No accounts, credentials or `.env` file are needed. The defaults run against the live site.

## Running the tests

| Command                                   | What it does                                            |
| ----------------------------------------- | ------------------------------------------------------- |
| `npm test`                                | All tests, headless                                     |
| `npm run test:smoke`                      | The one-way search end to end: the quickest health check |
| `npm run test:headed`                     | All tests with the browser visible                      |
| `npx playwright test --grep @travelers`   | One area by tag: `@submission`, `@stations`, `@dates`, `@travelers`, `@validation` |
| `npm run report`                          | Opens the HTML report of the last run                   |
| `npm run typecheck`                       | TypeScript check without running tests                  |

Expected result: **13 passed, 1 skipped**, in about 40 seconds with 2 workers. The skipped test
is a known issue, marked `test.fixme` (see [Known issues](docs/test-plan.md#known-issues)).

On failure, the HTML report keeps a trace, a screenshot and a video of the failing test. The
submission tests also attach the search request they captured (`search-request.json`).

## Environment

Everything is optional. To override a default, copy `.env.example` to `.env` or set the
variable in the shell.

| Variable          | Default                  | Purpose                                                                 |
| ----------------- | ------------------------ | ----------------------------------------------------------------------- |
| `BASE_URL`        | `https://www.amtrak.com` | Site under test                                                         |
| `WORKERS`         | `2`                      | Parallel browsers, kept low for a live site with bot protection          |
| `TIMEZONE`        | `America/New_York`       | Browser timezone. The date picker uses the browser clock, so it's pinned |
| `BROWSER_CHANNEL` | *(bundled Chromium)*     | Use an installed browser instead, e.g. `chrome`                          |

Settings are read in one place: `src/config/env.ts`.

## Project structure

```
src/
  pages/        Page objects: one class per page (URL). BasePage opens a page and waits until it's ready.
  components/   Component objects: parts of a page, reusable on other pages.
                SearchForm is built from StationField (From and To), DatePicker and TravelersPanel.
  models/       Types for our test data: Station, TripSearch, Party, TripType, TravelerType.
  data/         Test data values: stations, business rules and UI messages, and the TripSearchBuilder.
  api/          Amtrak's search request: its shape, trip type codes and URL pattern.
  assertions/   Domain checks: "the request carries exactly what was entered".
  fixtures/     Custom Playwright fixtures: cookie consent, homePage, searchForm, today.
  config/       Environment settings with defaults.
  utils/        Date helpers and report attachments.
tests/
  find-trains/  One spec per area: search-submission, stations, dates, travelers, validation.
docs/
  test-plan.md  Scope, approach, assumptions, coverage, known issues, with more time.
```

**The layers:** a test asks for a fixture, such as `searchForm`. The fixture opens the home
page through its page object. The test drives the form through component objects, using
data from the Builder, and checks the result with web-first assertions.

## Test design

- **Page and component objects.** A page is a URL; a component is a piece of UI that can
  appear on more than one page. For example, the same station search is used by other forms
  on the site. Tests never use raw selectors.
- **Builder for test data.** `TripSearchBuilder.validSearch(today)` starts from a valid
  one-way search. A test changes only what it's testing, e.g. `.roundTrip()`,
  `.withParty({ adult: 2, child: 1 })` or `.withoutOrigin()`.
- **Data-driven where cases differ only by data.** The required-field tests are one table
  with three rows.
- **Locators, in order of preference:**
  1. the site's own test IDs (`amt-auto-test-id`, set as Playwright's `testIdAttribute`)
  2. roles and accessible names
  3. the site's `data-julie` hooks
  4. CSS only where nothing else exists

  The page renders a hidden mobile copy of some controls, so those locators keep only the
  visible one.
- **No fixed waits.** Web-first assertions wait for the UI. The one network wait is for the
  specific search request. Timeouts are ceilings, not delays.
- **The search stops at the network boundary.** The Find Trains click sends a search
  request. The test captures it and checks its body, then aborts it. No search reaches
  Amtrak, and the test doesn't depend on search results.
- **Dates come from the browser's clock**, the one the date picker uses. They are stored as
  days from today, so the suite runs on any day.
- **Isolation.** Every test gets a fresh browser context and starts as a visitor who has
  declined non-essential cookies, so the consent banner never interrupts.
- **Every test was seen to fail.** After a test passed, its condition was broken on purpose
  to confirm it fails, then restored. A test that can't fail proves nothing.

## Troubleshooting

- **"The site returned 403: its bot protection blocked this browser."** Amtrak's bot
  protection rejected the page load. Try `BROWSER_CHANNEL=chrome npm test`, which uses your
  installed Chrome, or `npm run test:headed`. CI runners and cloud machines are more likely
  to be blocked than a home or office network.
- **A locator times out.** The live site may have changed its markup. Open the trace in
  `npm run report` to see the page at the moment of failure.
- **A test fails on a changed message.** The expected UI texts live in
  `src/data/booking-rules.ts`; the live site may have changed them.

## Use of AI

This suite was built with the help of an AI assistant (Claude).

- **How it was used.** Claude explored the live form and built a throwaway prototype against
  it, to learn the site's behavior (bot protection, locators, the request format).
- **Expected values come from the application, not the model.** Every message, limit and
  request field was observed on the live site. They are listed as assumptions in the test plan.
- **Claims were verified, and several were corrected:**
  - The AI guessed the format of the search request. The captured request showed a
    different shape (`journeyRequest`, trip type codes `OW` / `RT`), and the test caught it.
  - The AI claimed Playwright's `fill()` didn't work on the station autocomplete and added
    typing workarounds. A one-minute experiment proved `fill()` works, and the workarounds
    were removed.
  - A suggested timeout increase was rejected. Where the UI waits on the network, the test
    waits for that specific request.
  - A draft test restated the Builder's defaults. Rule adopted: a test states only what it's
    testing.
- **Every test was seen to fail** before it was trusted.
