import { chromium } from "playwright-extra";

const stealth = require("puppeteer-extra-plugin-stealth")();
chromium.use(stealth);

/**
 * Launches a Chromium browser instance with stealth plugin applied.
 */
export const launchStealthBrowser = async (
	headless = true,
	proxy?: { server: string; username?: string; password?: string },
) => {
	return await chromium.launch({
		headless,
		proxy: proxy
			? {
					server: proxy.server,
					username: proxy.username,
					password: proxy.password,
				}
			: undefined,
		args: [
			"--disable-blink-features=AutomationControlled",
			"--no-sandbox",
			"--disable-setuid-sandbox",
			"--disable-infobars",
			"--window-position=0,0",
			"--ignore-certifcate-errors",
			"--ignore-certifcate-errors-spki-list",
		],
	});
};
