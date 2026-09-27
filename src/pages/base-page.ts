import type { Page } from '@playwright/test';

// Shared behaviour for every page: open it by path, fail clearly if the site
// blocks the browser, then wait until the page is ready to use.
export abstract class BasePage {
  protected abstract readonly path: string;

  constructor(protected readonly page: Page) { }

  // Each page defines what "ready" means for it.
  protected abstract waitUntilLoaded(): Promise<void>;

  async open(): Promise<void> {
    const response = await this.page.goto(this.path, { waitUntil: 'domcontentloaded' });
    if (response?.status() === 403) {
      throw new Error(
        'The site returned 403: its bot protection blocked this browser. ' +
        'Try BROWSER_CHANNEL=chrome or --headed (see README > Troubleshooting).',
      );
    }
    await this.waitUntilLoaded();
  }
}
