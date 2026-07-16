import { chromium } from 'playwright';
import path from 'path';

(async () => {
  const artifactDir = 'C:\\Users\\Administrator\\.gemini\\antigravity-ide\\brain\\21a58268-f3bb-476c-ab0a-c79f54c08930';
  
  const browser = await chromium.launch({
    channel: 'msedge',
    headless: true
  });
  const context = await browser.newContext({
    viewport: { width: 1280, height: 720 }
  });
  const page = await context.newPage();
  
  console.log('Navigating to login page...');
  await page.goto('http://192.168.42.70/login', { waitUntil: 'commit' });
  
  console.log('Filling in credentials...');
  await page.fill('input[name="username"], input[type="text"], input[name="email"], input[name="bioid"]', '5467');
  await page.fill('input[name="password"], input[type="password"]', '5467');
  
  const submitButton = await page.$('button[type="submit"], input[type="submit"], button:has-text("Login")');
  if (submitButton) {
      await Promise.all([
          page.waitForNavigation({ waitUntil: 'commit' }).catch(() => {}),
          submitButton.click()
      ]);
  }
  
  console.log('Waiting for dashboard to load...');
  await page.waitForTimeout(2000);
  
  console.log('Clicking on IMISS link...');
  try {
      await page.click('a[href="/imiss"]', { timeout: 5000 });
      await page.waitForTimeout(3000);
      
      console.log('Taking imiss_dashboard.png screenshot...');
      await page.screenshot({ path: path.join(artifactDir, `imiss_dashboard.png`), timeout: 10000, animations: "disabled" });
      
      console.log('Attempting to highlight IMISS ticket submission...');
      // Click the submit ticket button
      const buttons = await page.$$('button');
      for (const btn of buttons) {
          const text = await btn.textContent();
          if (text && text.includes('Submit a New Ticket')) {
              await btn.click();
              console.log('Clicked "Submit a New Ticket"');
              break;
          }
      }
      
      await page.waitForTimeout(1500); // Wait for modal
      await page.screenshot({ path: path.join(artifactDir, `imiss_submit_ticket.png`), timeout: 10000, animations: "disabled" });
      console.log(`Saved imiss_submit_ticket.png`);
      
  } catch (e) {
      console.log(`Failed IMISS snapshot: ${e.message}`);
  }
  
  await browser.close();
})();
