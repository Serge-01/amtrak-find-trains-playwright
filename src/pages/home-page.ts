import type { Page } from '@playwright/test';
import { SearchForm } from '../components/search-form';
import { BasePage } from './base-page';

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
}
