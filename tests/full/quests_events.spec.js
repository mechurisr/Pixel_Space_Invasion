import { test, expect } from '@playwright/test';

test.describe('Full Test: Quests and Events', () => {

  test('TC 2-2-a: Frostbite Quest', async ({ page }) => {
    await page.goto('/?forceQuest=frostbite&forceTarget=24&forceCommander=skyfall');
    
    // Start game
    const startButton = page.locator('button', { hasText: /INITIALIZE UPLINK|연결 초기화/i }).first();
    await startButton.click();
    await page.waitForTimeout(1000);

    // Click starting region
    const region = page.locator('.absolute.w-8.h-8').first();
    await region.click();
    await page.waitForTimeout(1000);

    // Verify quest popup appears
    const questAcceptBtn = page.locator('button', { hasText: /ACCEPT DIRECTIVE|수락/i }).first();
    await expect(questAcceptBtn).toBeVisible();
    await questAcceptBtn.click();
    await page.waitForTimeout(500);
  });

  test('TC 2-2-b: The Black Gold Convoy Quest', async ({ page }) => {
    await page.goto('/?forceQuest=convoy&forceTarget=24&forceCommander=skyfall');
    const startButton = page.locator('button', { hasText: /INITIALIZE UPLINK|연결 초기화/i }).first();
    await startButton.click();
    await page.waitForTimeout(1000);

    const region = page.locator('.absolute.w-8.h-8').first();
    await region.click();
    await page.waitForTimeout(1000);

    const questAcceptBtn = page.locator('button', { hasText: /ACCEPT DIRECTIVE|수락/i }).first();
    await expect(questAcceptBtn).toBeVisible();
    await questAcceptBtn.click();
    await page.waitForTimeout(500);
  });

  test('TC 2-2-c: Silicon Rescue Quest', async ({ page }) => {
    await page.goto('/?forceQuest=silicon&forceTarget=24&forceCommander=skyfall');
    const startButton = page.locator('button', { hasText: /INITIALIZE UPLINK|연결 초기화/i }).first();
    await startButton.click();
    await page.waitForTimeout(1000);

    const region = page.locator('.absolute.w-8.h-8').first();
    await region.click();
    await page.waitForTimeout(1000);

    const questAcceptBtn = page.locator('button', { hasText: /ACCEPT DIRECTIVE|수락/i }).first();
    await expect(questAcceptBtn).toBeVisible();
    await questAcceptBtn.click();
    await page.waitForTimeout(500);
  });

  test('TC 2-2-d: Last Stand at the Pentagon Quest', async ({ page }) => {
    await page.goto('/?forceQuest=last_stand&forceTarget=24&forceCommander=skyfall');
    const startButton = page.locator('button', { hasText: /INITIALIZE UPLINK|연결 초기화/i }).first();
    await startButton.click();
    await page.waitForTimeout(1000);

    const region = page.locator('.absolute.w-8.h-8').first();
    await region.click();
    await page.waitForTimeout(1000);

    const questAcceptBtn = page.locator('button', { hasText: /ACCEPT DIRECTIVE|수락/i }).first();
    await expect(questAcceptBtn).toBeVisible();
    await questAcceptBtn.click();
    await page.waitForTimeout(500);
  });

  test('TC 2-2-e: Eurasian Link Quest', async ({ page }) => {
    await page.goto('/?forceQuest=eurasian&forceTarget=24&forceCommander=skyfall');
    const startButton = page.locator('button', { hasText: /INITIALIZE UPLINK|연결 초기화/i }).first();
    await startButton.click();
    await page.waitForTimeout(1000);

    const region = page.locator('.absolute.w-8.h-8').first();
    await region.click();
    await page.waitForTimeout(1000);

    const questAcceptBtn = page.locator('button', { hasText: /ACCEPT DIRECTIVE|수락/i }).first();
    await expect(questAcceptBtn).toBeVisible();
    await questAcceptBtn.click();
    await page.waitForTimeout(500);
  });

  test('TC 2-3-a: Mothership and Nuke', async ({ page }) => {
    await page.goto('/?forceMothership=20&forceFreeNukes=1&forceCommander=skyfall');
    const startButton = page.locator('button', { hasText: /INITIALIZE UPLINK|연결 초기화/i }).first();
    await startButton.click();
    await page.waitForTimeout(1000);

    const region = page.locator('.absolute.w-8.h-8').first();
    await region.click();
    await page.waitForTimeout(1000);

    // End turn to refresh actions
    const nextTurnBtn = page.locator('button', { hasText: /NEXT_TURN|다음 턴/i }).first();
    await nextTurnBtn.click();
    await page.waitForTimeout(500);

    // Nuke
    const execBtn = page.locator('button', { hasText: /EXECUTE PROTOCOL|프로토콜 실행/i }).first();
    await expect(execBtn).toBeVisible();
    await execBtn.click();
    await page.waitForTimeout(500);

    const nukeBtn = page.locator('button', { hasText: /전술 핵|Tactical Nuke/i }).first();
    await expect(nukeBtn).toBeVisible();
    await nukeBtn.click();
    await page.waitForTimeout(500);
    
    // Target mothership (Mothership has text 🛸 모선)
    const msNode = page.locator('text=🛸 모선').first();
    await expect(msNode).toBeVisible();
    await msNode.click();
    await page.waitForTimeout(500);

    // Confirm
    const confirmBtn = page.locator('button.bg-red-700').first();
    await expect(confirmBtn).toBeVisible();
    await confirmBtn.click();
    await page.waitForTimeout(1000);
  });

  test('TC 2-3-b: Solar Flare Event', async ({ page }) => {
    await page.goto('/?forceEvent=solar_flare&forceTarget=24&forceCommander=skyfall');
    const startButton = page.locator('button', { hasText: /INITIALIZE UPLINK|연결 초기화/i }).first();
    await startButton.click();
    await page.waitForTimeout(1000);

    const region = page.locator('.absolute.w-8.h-8').first();
    await region.click();
    await page.waitForTimeout(1000);

    // Verify Solar Flare screen effect is present
    const flareOverlay = page.locator('.animate-pulse.mix-blend-overlay').first();
    await expect(flareOverlay).toBeVisible();
  });

  test('TC 2-3-c: Mutant Hive Event', async ({ page }) => {
    await page.goto('/?forceEvent=mutant_hive&forceTarget=24&forceCommander=skyfall');
    const startButton = page.locator('button', { hasText: /INITIALIZE UPLINK|연결 초기화/i }).first();
    await startButton.click();
    await page.waitForTimeout(1000);

    const region = page.locator('.absolute.w-8.h-8').first();
    await region.click();
    await page.waitForTimeout(1000);

    // Verify Mutant Hive text
    const hiveNode = page.locator('text=/☣ 3/').first();
    await expect(hiveNode).toBeVisible();
  });
});
