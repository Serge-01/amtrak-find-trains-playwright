import { test as base } from '@playwright/test';
import type { SearchForm } from '../components/search-form';
import { env } from '../config/env';
import { HomePage } from '../pages/home-page';

interface Fixtures {
  homePage: HomePage;
  searchForm: SearchForm;
}

export const test = base.extend<Fixtures>({
  page: async ({ page }, use) => {
    // The cookie consent banner isn't under test, and when it appears it takes keyboard
    // focus, which breaks typing. So start every test as a visitor who has already
    // declined non-essential cookies: these are the cookies the banner itself saves.
    await page.context().addCookies([
      { name: 'OptanonAlertBoxClosed', value: new Date().toISOString(), url: env.baseUrl },
      { name: 'OptanonConsent', value: 'groups=C0001%3A1%2CC0002%3A0%2CC0003%3A0%2CC0004%3A0', url: env.baseUrl },
    ]);
    // Safety net: if the banner shows up anyway, decline and carry on.
    await page.addLocatorHandler(page.locator('#onetrust-banner-sdk'), async () => {
      await page.locator('#onetrust-reject-all-handler').click();
    });
    await use(page);
  },

  homePage: async ({ page }, use) => {
    const homePage = new HomePage(page);
    await homePage.open();
    await use(homePage);
  },

  searchForm: async ({ homePage }, use) => {
    await use(homePage.searchForm);
  },
});

export { expect } from '@playwright/test';
