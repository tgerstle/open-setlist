import { chromium } from "playwright";

async function testUrl() {
    const url = process.argv[2];
    const browser = await chromium.launch({ headless: true });
    const page = await browser.newPage();
    await page.goto(url, { waitUntil: "domcontentloaded" });

    // Evaluate inside browser
    const data = await page.evaluate(() => {
        // Try to find the section matching "DOORS OPEN"
        const eventInfoBlocks = Array.from(document.querySelectorAll('.info-block, .event-info, li, div'));

        let doors = null;
        let show = null;
        let price = null;
        let ages = null;

        for (const el of eventInfoBlocks) {
            const text = el.textContent?.toUpperCase() || '';
            if (text.includes("DOORS OPEN") && text.length < 50) doors = el.textContent?.trim();
            if (text.includes("EVENT STARTS") && text.length < 50) show = el.textContent?.trim();
            if (text.includes("$") && text.lengthimport { chromium } from "playwright";

.t
    async function testUrl() {
        const"AL    const url = process.s("    const browser = await chromL     const page = await browser.newPage();
        await page.gototi    await page.goto(url, {
            waitUntil: "dil    
    // Evaluate inside browser
    const data = await nt?.con || null;

            return        // Try to find the section matching          const eventInfoBlocks = Array.from(document.que:         
        let doors = null;
            let show = null;
            let price = null;
            let ages = n: "       ;
    await browser.close(); let price = nulsole.error);
