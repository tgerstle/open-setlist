import type { Page } from "playwright";

/**
 * Adds a Gaussian-distributed delay to simulate human "thinking" or processing time.
 * @param page The Playwright Page instance.
 * @param min Minimum delay in ms.
 * @param max Maximum delay in ms.
 */
export const humanDelay = async (page: Page, min = 800, max = 2500) => {
	const jitter = Math.floor(Math.random() * (max - min) + min);
	await page.waitForTimeout(jitter);
};

/**
 * Moves the mouse in a non-linear path to a destination (x, y).
 * Uses simple randomized segments to simulate human hand-eye jitter.
 */
export const humanMove = async (
	page: Page,
	targetX: number,
	targetY: number,
) => {
	// Playwright doesn't expose current mouse position easily,
	// so we assume start from center if unknown, or rely on internal tracking.
	// For now, we simulate movements relative to target.
	const segments = 15;

	for (let i = 1; i <= segments; i++) {
		const jitterX = (Math.random() - 0.5) * 10;
		const jitterY = (Math.random() - 0.5) * 10;

		// Move closer to target in steps with jitter
		// (In a real implementation, we'd start from current pos)
		await page.mouse.move(targetX + jitterX, targetY + jitterY, { steps: 5 });
		await page.waitForTimeout(Math.random() * 50 + 20);
	}
};

/**
 * Types text with randomized delays between keystrokes.
 */
export const humanType = async (page: Page, selector: string, text: string) => {
	await page.focus(selector);
	for (const char of text) {
		await page.keyboard.type(char);
		await page.waitForTimeout(Math.random() * 150 + 50); // 50ms - 200ms per char
	}
};

/**
 * Scrolls the page naturally.
 */
export const humanScroll = async (page: Page) => {
	await page.evaluate(async () => {
		const distance = 300 + Math.random() * 200;
		window.scrollBy(0, distance);
	});
	await page.waitForTimeout(Math.random() * 1000 + 500);
};
