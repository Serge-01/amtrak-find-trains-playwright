import { expect, type Locator, type Page } from '@playwright/test';

// The "Find trains" search form on the home page (the site's <amt-md-farefinder> element).
export class SearchForm {
  readonly root: Locator;
  readonly findTrainsButton: Locator;

  constructor(page: Page) {
    this.root = page.locator('amt-md-farefinder');
    // The page has a second, hidden copy of the button for the mobile layout.
    this.findTrainsButton = this.root.getByTestId('fare-finder-findtrains-button').filter({ visible: true });
  }

  async waitUntilReady(): Promise<void> {
    // The home page is heavy, so this one check gets a longer timeout than the 5s default.
    await expect(this.findTrainsButton).toBeVisible({ timeout: 15_000 });
  }
}
