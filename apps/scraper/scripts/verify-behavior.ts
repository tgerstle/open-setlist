import { humanDelay, humanMove, humanScroll } from "../core/behavior";
import { launchStealthBrowser } from "../core/stealth";

(async () => {
	console.log("🧪 Running Behavioral Simulation Verification...");

	const browser = await launchStealthBrowser(false); // Run headful for manual visual check
	const page = await browser.newPage();

	try {
		await page.goto("https://www.google.com", { waitUntil: "networkidle" });

		console.log("👀 Simulating human delay (1-3s)...");
		await humanDelay(page, 1000, 3000);

		console.log("🖱️ Simulating human mouse move to search box...");
		const searchBox = await page.waitForSelector('textarea[name="q"]');
		const boxRect = await searchBox.boundingBox();
		if (boxRect) {
			await humanMove(
				page,
				boxRect.x + boxRect.width / 2,
				boxRect.y + boxRect.height / 2,
			);
		}

		console.log("📜 Simulating human scroll...");
		await humanScroll(page);

		console.log(
			"🕵️ Behavioral simulation check: ✅ PASS (Visual verification suggested)",
		);
	} catch (err) {
		console.error("💥 Behavioral check failed:", err.message);
	} finally {
		console.log("⏳ Closing browser in 3 seconds...");
		await new Promise((r) => setTimeout(r, 3000));
		await browser.close();
	}
})();
