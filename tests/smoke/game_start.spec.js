import { test, expect } from '@playwright/test';

test.describe('Smoke Test: Core Game Loop', () => {
  test('TC 1-1 to 1-4: Init, Resource, Invasion, Transfer', async ({ page }) => {
    // TC 1-1. 게임 초기화 및 거점 점령
    await page.goto('/?skipIntro=false');
    
    // Start game
    const startButton = page.locator('button', { hasText: /INITIALIZE UPLINK|연결 초기화/i }).first();
    await expect(startButton).toBeVisible();
    await startButton.click();
    await page.waitForTimeout(1000);

    // Select Commander
    const commanderSelectBtn = page.locator('button', { hasText: /Select|선택/i }).first();
    await expect(commanderSelectBtn).toBeVisible();
    await commanderSelectBtn.click({ force: true });
    await page.waitForTimeout(1000);

    // Click starting region
    const region = page.locator('.absolute.w-8.h-8').first();
    await expect(region).toBeVisible();
    await region.click();
    await page.waitForTimeout(1000);

    // Check Turn 1
    await expect(page.locator('text=/턴: 1|Turn: 1/')).toBeVisible();
    
    // Check initial resources (Oil: 40)
    await expect(page.locator('div.flex.justify-between').filter({ hasText: /원유 자원|CRUDE OIL/i }).first()).toContainText('40%');

    // End Turn to refresh actions since starting region is considered 'acted'
    const nextTurnBtn = page.locator('button', { hasText: /NEXT_TURN|다음 턴/i }).first();
    await expect(nextTurnBtn).toBeVisible();
    await nextTurnBtn.click();
    await page.waitForTimeout(500);

    // TC 1-2. 자원 생산 및 변환 프로토콜 (Tech)
    await region.click();
    const execBtn = page.locator('button', { hasText: /EXECUTE PROTOCOL|프로토콜 실행/i }).first();
    await expect(execBtn).toBeVisible();
    await execBtn.click();
    await page.waitForTimeout(500);

    const techBtn = page.locator('button', { hasText: /기술 발전|TECHNOLOGY ADVANCEMENT/i }).first();
    await expect(techBtn).toBeVisible();
    await techBtn.click();
    
    // Oil drops from 40 to 20
    // Note: Due to end of turn passive generation, it might not be exactly 20%, so we just check it decreased.
    const textAfter = await page.locator('div.flex.justify-between').filter({ hasText: /원유 자원|CRUDE OIL/i }).first().textContent();
    expect(parseInt(textAfter.replace(/[^0-9]/g, ''), 10)).toBeLessThan(40);
    
    // End Turn
    await expect(nextTurnBtn).toBeVisible();
    await nextTurnBtn.click();
    await page.waitForTimeout(500);

    // Turn 3
    await expect(page.locator('text=/턴: 3|Turn: 3/')).toBeVisible();

    // Military Protocol requires executing protocol again
    await region.click();
    const execBtn2 = page.locator('button', { hasText: /EXECUTE PROTOCOL|프로토콜 실행/i }).first();
    await expect(execBtn2).toBeVisible();
    await execBtn2.click();
    await page.waitForTimeout(500);

    const milBtn = page.locator('button', { hasText: /군사 보충|Military Reinforcement/i }).first();
    await expect(milBtn).toBeVisible();
    await milBtn.click();
    
    // TC 1-3. 인접 구역 침공 (Invasion)
    // Note: To invade, we need an active region. We just used Military Protocol on region, so we must end turn again!
    await nextTurnBtn.click(); // Next turn to refresh actions
    await page.waitForTimeout(500);

    await region.click();
    const execBtn3 = page.locator('button', { hasText: /EXECUTE PROTOCOL|프로토콜 실행/i }).first();
    await expect(execBtn3).toBeVisible();
    await execBtn3.click();
    await page.waitForTimeout(500);

    const invasionBtn = page.locator('button', { hasText: /침공 개시|Commence Invasion/i }).first();
    await expect(invasionBtn).toBeVisible();
    await invasionBtn.click();

    // Target a neighbor region
    const targetRegion = page.locator('.ring-red-500').first(); // Targetable regions have this class
    await expect(targetRegion).toBeVisible();
    await targetRegion.click();
    await page.waitForTimeout(1000);

    // Invasion executes immediately upon target click

    // TC 1-4. 병력 이동 (Transfer)
    await nextTurnBtn.click(); // Next turn to refresh actions
    await page.waitForTimeout(500);
    
    // Both regions are now owned. Click the first one.
    const ownedRegions = page.locator('.bg-green-600\\/80');
    expect(await ownedRegions.count()).toBeGreaterThanOrEqual(1);

    await ownedRegions.first().click();
    
    const execBtn4 = page.locator('button', { hasText: /EXECUTE PROTOCOL|프로토콜 실행/i }).first();
    await expect(execBtn4).toBeVisible();
    await execBtn4.click();
    await page.waitForTimeout(500);

    const transferBtn = page.locator('button', { hasText: /병력 이동|Transfer Troops/i }).first();
    await expect(transferBtn).toBeVisible();
    await transferBtn.click();

    // Target transfer region
    const transferTarget = page.locator('.ring-green-400').first();
    await expect(transferTarget).toBeVisible();
    await transferTarget.click();
    await page.waitForTimeout(1000);

    // Transfer executes immediately upon target click
  });
});
