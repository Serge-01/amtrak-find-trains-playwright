import type { Page } from '@playwright/test';
import { SearchForm } from '../components/search-form';
import { BasePage } from './base-page';
import type { CalendarDate } from '../utils/dates';

export class HomePage extends BasePage {
  protected readonly path = '/home';
  readonly searchForm: SearchForm;

  constructor(page: Page) {
    super(page);
    this.searchForm = new SearchForm(page);
  }

  protected async waitUntilLoaded(): Promise<void> {
    await this.searchForm.waitUntilReady();
  }

  // Today's date according to the browser clock, which is what the date picker uses.
  async today(): Promise<CalendarDate> {
    return this.page.evaluate(() => {
      const now = new Date();
      return { year: now.getFullYear(), month: now.getMonth() + 1, day: now.getDate() };
    });
  }
}
