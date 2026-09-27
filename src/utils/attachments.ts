import { test } from '@playwright/test';

// Attaches a JSON payload to the current test so it shows up in the HTML report.
export async function attachJson(name: string, data: unknown): Promise<void> {
  await test.info().attach(name, {
    body: JSON.stringify(data, null, 2),
    contentType: 'application/json',
  });
}
