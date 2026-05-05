import { launchStealthBrowser } from '../core/stealth';
import { generateFingerprint, getProxyConfig } from '../core/identity';

(async () => {
  console.log('🧪 Running Identity & Fingerprint Verification...');
  
  const results: any[] = [];
  
  for (let i = 0; i < 3; i++) {
    console.log(`📡 Run ${i + 1}...`);
    const { userAgent, viewport } = generateFingerprint();
    const proxy = getProxyConfig();
    const browser = await launchStealthBrowser(true, proxy);
    const context = await browser.newContext({ userAgent, viewport });
    const page = await context.newPage();
    
    try {
      await page.goto('https://httpbin.org/headers', { waitUntil: 'networkidle' });
      const headers = JSON.parse(await page.textContent('pre') || '{}');
      
      await page.goto('https://api.ipify.org?format=json', { waitUntil: 'networkidle' });
      const ipData = JSON.parse(await page.textContent('pre') || '{}');
      
      results.push({
        run: i + 1,
        userAgent: headers.headers['User-Agent'],
        ip: ipData.ip,
        viewport: await page.evaluate(() => ({ width: window.innerWidth, height: window.innerHeight }))
      });
      
    } catch (err) {
      console.error(`💥 Run ${i + 1} failed:`, err.message);
    } finally {
      await browser.close();
    }
  }
  
  console.table(results);
  
  const uniqueUAs = new Set(results.map(r => r.userAgent)).size;
  const uniqueIPs = new Set(results.map(r => r.ip)).size;
  const uniqueViewports = new Set(results.map(r => JSON.stringify(r.viewport))).size;
  
  console.log(`🕵️ Unique User-Agents: ${uniqueUAs}/${results.length} ${uniqueUAs > 1 ? '✅' : '⚠️'}`);
  console.log(`🌐 Unique IPs: ${uniqueIPs}/${results.length} ${uniqueIPs > 1 || !process.env.PROXY_SERVER ? '✅' : '❌'}`);
  console.log(`📐 Unique Viewports: ${uniqueViewports}/${results.length} ${uniqueViewports > 1 ? '✅' : '⚠️'}`);
  
})();
