import { test, expect } from '@playwright/test';

test.describe('Full Test: Commander Skills', () => {
  
  test('TC 2-1-a: Skyfall (Drop Zone)', async ({ page }) => {
    // forceCommander=skyfall, forceSupplies=100
    await page.goto('/?forceCommander=skyfall&forceSupplies=100');
    
    // Start game, bypass commander selection
    const startButton = page.locator('button', { hasText: /INITIALIZE UPLINK|연결 초기화/i }).first();
    await expect(startButton).toBeVisible();
    await startButton.click();
    await page.waitForTimeout(1000);

    // Click starting region
    const region = page.locator('.absolute.w-8.h-8').first();
    await expect(region).toBeVisible();
    await region.click();
    await page.waitForTimeout(1000);

    // Initial supplies should be 100
    await expect(page.locator('.text-yellow-300').first()).toHaveText('100');

    // End turn to get action points back just in case
    const nextTurnBtn = page.locator('button', { hasText: /NEXT_TURN|다음 턴/i }).first();
    await nextTurnBtn.click();
    await page.waitForTimeout(500);

    // Activate Skill
    const skillBtn = page.locator('button', { hasText: /USE SKILL|스킬 사용/i }).first();
    await expect(skillBtn).toBeVisible();
    await skillBtn.click();

    // Target enemy region (nth(5) to avoid adjacency)
    const enemyRegion = page.locator('.cursor-crosshair').nth(5);
    await expect(enemyRegion).toBeVisible();
    await enemyRegion.click({ force: true });
    await page.waitForTimeout(500);

    // Supplies should drop by 20 -> roughly 80 (allow 81, 82 due to passive generation)
    const suppliesText1 = await page.locator('.text-yellow-300').first().textContent();
    expect(parseInt(suppliesText1, 10)).toBeLessThan(90);
  });

  test('TC 2-1-b: Dr. Boom (Orbital Strike)', async ({ page }) => {
    await page.goto('/?forceCommander=boom&forceSupplies=100');
    const startButton = page.locator('button', { hasText: /INITIALIZE UPLINK|연결 초기화/i }).first();
    await expect(startButton).toBeVisible();
    await startButton.click();
    await page.waitForTimeout(1000);

    const region = page.locator('.absolute.w-8.h-8').first();
    await region.click();
    await page.waitForTimeout(1000);

    const nextTurnBtn = page.locator('button', { hasText: /NEXT_TURN|다음 턴/i }).first();
    await nextTurnBtn.click();
    await page.waitForTimeout(500);

    // Activate Skill
    const skillBtn = page.locator('button', { hasText: /USE SKILL|스킬 사용/i }).first();
    await expect(skillBtn).toBeVisible();
    await skillBtn.click();

    // Target enemy region
    const enemyRegion = page.locator('.cursor-crosshair').first();
    await expect(enemyRegion).toBeVisible();
    await enemyRegion.click({ force: true });
    await page.waitForTimeout(500);

    // Supplies should drop by 30 -> roughly 70
    const suppliesText2 = await page.locator('.text-yellow-300').first().textContent();
    expect(parseInt(suppliesText2, 10)).toBeLessThan(80);
  });

  test('TC 2-1-c: Iron Wall (Instant Shield)', async ({ page }) => {
    await page.goto('/?forceCommander=iron_wall&forceSupplies=100');
    const startButton = page.locator('button', { hasText: /INITIALIZE UPLINK|연결 초기화/i }).first();
    await expect(startButton).toBeVisible();
    await startButton.click();
    await page.waitForTimeout(1000);

    const region = page.locator('.absolute.w-8.h-8').first();
    await region.click();
    await page.waitForTimeout(1000);

    const nextTurnBtn = page.locator('button', { hasText: /NEXT_TURN|다음 턴/i }).first();
    await nextTurnBtn.click();
    await page.waitForTimeout(500);

    // Activate Skill
    const skillBtn = page.locator('button', { hasText: /USE SKILL|스킬 사용/i }).first();
    await expect(skillBtn).toBeVisible();
    await skillBtn.click();

    // Target friendly region
    const friendlyRegion = page.locator('.bg-green-600\\/80').first();
    await expect(friendlyRegion).toBeVisible();
    await friendlyRegion.click({ force: true });
    await page.waitForTimeout(500);

    // Supplies should drop by 15 -> roughly 85
    const suppliesText3 = await page.locator('.text-yellow-300').first().textContent();
    expect(parseInt(suppliesText3, 10)).toBeLessThan(90);
  });

});
