import puppeteer from 'puppeteer';

(async () => {
  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();
  
  page.on('console', msg => {
    console.log(`[BROWSER LOG] ${msg.type().toUpperCase()}: ${msg.text()}`);
  });
  
  page.on('pageerror', err => {
    console.log(`[BROWSER PAGE_ERROR] ${err.message}`);
  });

  await page.goto('http://localhost:5173');
  await page.waitForSelector('button');
  
  // Start a new game
  console.log("Starting a new game...");
  let buttons = await page.$$('button');
  for (let btn of buttons) {
    const text = await page.evaluate(el => el.textContent, btn);
    if (text.includes('건너뛰기') || text.includes('START') || text.includes('시작')) {
      await btn.click();
      break;
    }
  }
  
  await new Promise(r => setTimeout(r, 1000));

  console.log("Selecting commander...");
  const cmdBtns = await page.$$('button');
  for (let cb of cmdBtns) {
    const cText = await page.evaluate(el => el.textContent, cb);
    if (cText.includes('선택')) {
      await cb.click();
      break;
    }
  }

  await new Promise(r => setTimeout(r, 1000));

  console.log("Clicking map region...");
  await page.evaluate(() => {
    const regions = document.querySelectorAll('.absolute.w-12.h-12');
    const valid = Array.from(regions).find(r => !r.className.includes('bg-') && !r.className.includes('border-red'));
    if (valid) valid.click();
  });

  await new Promise(r => setTimeout(r, 1000));

  console.log("Clicking Next Turn...");
  await page.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const nextBtn = btns.find(b => (b.textContent.includes('Next Turn') || b.textContent.includes('다음 턴')) && !b.disabled);
    if (nextBtn) nextBtn.click();
  });
  await new Promise(r => setTimeout(r, 1000));

  console.log("Taking screenshot and checking logs...");
  const logs = await page.evaluate(() => {
    const elements = Array.from(document.querySelectorAll('.flex.flex-col.gap-2.overflow-y-auto div'));
    return elements.map(l => l.innerText);
  });
  console.log("React UI Event Logs:\n", logs.join('\n'));

  const turnText = await page.evaluate(() => document.body.innerText.match(/턴\s*:\s*\d+/)?.[0] || 'Turn not found');
  console.log("Current Turn:", turnText);
  
  await browser.close();
})();
