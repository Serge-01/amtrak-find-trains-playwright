# Amtrak "Find Trains" — Playwright test suite

Automated tests for the **Find Trains** search form on [amtrak.com/home](https://www.amtrak.com/home),
written in Playwright + TypeScript. The scope ends at the **Find Trains** click: the suite checks
how the form behaves and that the click sends exactly the search that was entered.

The approach, assumptions, coverage and next steps are in the **[test plan](docs/test-plan.md)**.

## Setup

**Prerequisites:** Node.js 20.12 or later, npm, git.

```
git clone https://github.com/Serge-01/amtrak-find-trains-playwright.git
cd amtrak-find-trains-playwright
npm ci
npx playwright install chromium
```

`npm ci` installs the exact versions in `package-lock.json`. On Linux, add `--with-deps` to the
browser install. No accounts, credentials or `.env` file are needed.

## Running the tests

| Command                                   | What it does                                            |
| ----------------------------------------- | ------------------------------------------------------- |
| `npm test`                                | All tests, headless                                     |
| `npm run test:smoke`                      | The one-way search, up to the captured request          |
| `npm run test:headed`                     | All tests with the browser visible                      |
| `npx playwright test --grep @travelers`   | One area by tag: `@submission`, `@stations`, `@dates`, `@travelers`, `@validation` |
| `npm run report`                          | Opens the HTML report of the last run                   |
| `npm run typecheck`                       | TypeScript check without running tests                  |

Expected result: **13 passed, 1 skipped** (the [known issue](docs/test-plan.md#known-issues)), in
about 40 seconds. On the 1st of a month the past-days test also skips itself: 12 passed, 2 skipped.

On failure, the HTML report keeps a trace, a screenshot and a video. The submission tests attach
the search request they captured (`search-request.json`) on every run.

## Environment

All optional: copy `.env.example` to `.env` or set the variable in the shell. Settings are read in
one place, `src/config/env.ts`.

| Variable          | Default                  | Purpose                                                                 |
| ----------------- | ------------------------ | ----------------------------------------------------------------------- |
| `BASE_URL`        | `https://www.amtrak.com` | Site under test                                                         |
| `WORKERS`         | `2`                      | Parallel browsers, kept low for a live site with bot protection          |
| `TIMEZONE`        | `America/New_York`       | Browser timezone. The date picker uses the browser clock, so it's pinned |
| `BROWSER_CHANNEL` | *(bundled Chromium)*     | Use an installed browser instead, e.g. `chrome`                          |

## Project structure

```
src/
  pages/        Page objects: one class per page (URL). BasePage opens a page and waits until it's ready.
  components/   Component objects: parts of a page, each in its own class.
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
  test-plan.md  Scope, approach, assumptions, coverage, known issues, next steps.
```

A test asks for a fixture such as `searchForm`, which opens the home page through its page object.
The test then drives the form through component objects, with data from the Builder.

## Test design

- **Page and component objects.** A page is a URL; a component is a part of a page with its own
  class. `StationField` takes the element it lives in, so one class serves both From and To.
  `DatePicker` and `TravelersPanel` look up their elements on the whole page, which works while
  the home page has one of each. Tests never use raw selectors.
- **Builder for test data.** `TripSearchBuilder.validSearch(today)` starts from a valid one-way
  search, and a test changes only what it's testing, e.g. `.roundTrip()` or `.withoutOrigin()`.
- **Data-driven** where cases differ only by data: the required-field tests are one table.
- **Locators, in order of preference:** the site's own test IDs (`amt-auto-test-id`, set as
  Playwright's `testIdAttribute`), then roles and accessible names, then the site's `data-julie`
  hooks, and CSS only where nothing else exists. Hidden mobile copies of some controls are
  filtered out.
- **No fixed waits.** Web-first assertions wait for the UI; the one network wait is for the
  search request. Timeouts are ceilings, not delays.
- **The search stops at the network boundary.** The test captures the request the click sends,
  checks it, then aborts it, so no search reaches Amtrak.
- **Dates come from the browser's clock**, the one the date picker uses, stored as days from
  today, so the suite runs on any day.
- **Isolation.** Every test gets a fresh browser context and starts with non-essential cookies
  declined, so the consent banner never interrupts.
- **Every test was seen to fail.** Its condition was broken on purpose to confirm it fails, then
  restored. A test that can't fail proves nothing.

## Troubleshooting

- **"The site returned 403: its bot protection blocked this browser."** Try
  `BROWSER_CHANNEL=chrome npm test` (your installed Chrome) or `npm run test:headed`. CI runners
  and cloud machines are more likely to be blocked than a home or office network.
- **A locator times out.** The site may have changed its markup. The trace in `npm run report`
  shows the page at the moment of failure.
- **A message check fails.** The expected texts live in `src/data/booking-rules.ts`; the site may
  have changed them.

## Use of AI

This suite was built with the help of an AI assistant (Claude).

- **How it was used.** Claude explored the live form to learn the site's behavior: bot protection,
  locators, the request format. I then built this repository step by step: project setup, page
  objects, Builder and validations, docs. After that I had a separate AI session review it for
  coverage gaps and inconsistencies, and fixed what it found.
- **Expected values come from the application, not the model.** Every message, limit and request
  field was observed on the live site; they're listed as assumptions in the test plan.
- **Claims were verified, and several were corrected:**
  - The AI guessed the search request's format. The captured request had a different shape
    (`journeyRequest`, trip type codes `OW` / `RT`), and the test caught it.
  - The AI claimed `fill()` didn't work on the station autocomplete and added typing workarounds.
    A one-minute experiment proved it works, and the workarounds were removed.
  - A suggested timeout increase was rejected in favor of waiting for the specific request.
  - A draft test restated the Builder's defaults. Rule adopted: a test states only what it's
    testing.
