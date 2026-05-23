import { runStealthAudit } from "../core/audit";
import { launchStealthBrowser } from "../core/stealth";

(async () => {
	console.log("🧪 Running Pre-flight Audit Simulation...");

	const browser = await launchStealthBrowser(true);
	const page = await browser.newPage();

	try {
		const audit = await runStealthAudit(page);
		console.log(`🛡️ Audit Results:`, audit);

		if (audit.status === "PASS") {
			console.log("✅ PASS: Stealth posture is solid.");
		} else {
			console.log("❌ FAIL: High bot score detected.");
		}
	} catch (err) {
		console.error("💥 Audit check failed:", err.message);
	} finally {
		await browser.close();
	}
})();
