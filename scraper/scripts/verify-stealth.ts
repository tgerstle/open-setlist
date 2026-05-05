import { launchStealthBrowser } from '../core/stealth';

(async () => {
  console.log('🧪 Running Stealth Verification...');
  const browser = await launchStealthBrowser(true);
  const page = await browser.newPage();
  
  try {
    await page.goto('https://bot.sannysoft.com/', { waitUntil: 'networkidle' });
    const screenshotPath = `logs/screenshots/stealth-test-${Date.now()}.png`;
    await page.screenshot({ path: screenshotPath, fullPage: true });
    console.log(`📸 Stealth check screenshot saved to: ${screenshotPath}`);
    
    // Quick console check for WebDriver
    const isStealthy = await page.evaluate(() => {
      return !navigator.webdriver;
    });
    
    console.log(`🕵️ WebDriver hidden: ${isStealthy ? '✅ PASS' : '❌ FAIL'}`);
    
  } catch (err) {
    console.error('💥 Stealth check failed:', err.message);
  } finally {
    await browser.close();
  }
})();
