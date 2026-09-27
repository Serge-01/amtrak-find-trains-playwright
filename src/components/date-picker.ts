import { expect, type Locator, type Page } from '@playwright/test';
import { toAriaLabel, type CalendarDate } from '../utils/dates';

// The calendar that opens from the Depart and Return inputs. On desktop it shows two
// months at a time; the tests keep their dates within that range, so no paging is needed.
export class DatePicker {
  readonly root: Locator;
  readonly doneButton: Locator;

  constructor(page: Page) {
    this.root = page.locator('am-farefinder-dates .calendar-modal').filter({ visible: true });
    this.doneButton = this.root.getByRole('button', { name: 'Done' });
  }

  // Each month grid is padded with a few days of the neighbouring months. Those padding
  // cells have the same aria-label plus a "hidden" class, so they are excluded.
  day(date: CalendarDate): Locator {
    return this.root.locator(`[role="gridcell"]:not(.hidden)[aria-label="${toAriaLabel(date)}"]`);
  }

  async select(date: CalendarDate): Promise<void> {
    await this.day(date).click();
  }

  async confirm(): Promise<void> {
    await this.doneButton.click();
    await expect(this.root).toBeHidden();
  }
}
