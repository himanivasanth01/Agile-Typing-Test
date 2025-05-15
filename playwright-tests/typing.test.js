const { test, expect } = require('@playwright/test');

test('Typing updates stats on the live site', async ({ page }) => {
  await page.goto('https://himanivasanth01.github.io/Agile-Typing-Test/');

  const input = page.locator('#userInput');
  await input.fill('hello');
  await input.press(' ');

  const submitted = await page.locator('#wordsSubmitted').textContent();
  expect(parseInt(submitted)).toBeGreaterThan(0);
});
