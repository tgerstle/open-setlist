/**
 * Utility for generating randomized fingerprints (User-Agents, viewports)
 * and managing proxy configurations.
 */

export interface Fingerprint {
	userAgent: string;
	viewport: { width: number; height: number };
	deviceScaleFactor: number;
}

const MODERN_CHROME_VARIANTS = [
	{
		ua: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
		platform: "Windows",
	},
	{
		ua: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
		platform: "macOS",
	},
	{
		ua: "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
		platform: "Linux",
	},
	{
		ua: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36",
		platform: "Windows",
	},
	{
		ua: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36",
		platform: "macOS",
	},
];

export const generateFingerprint = (): Fingerprint => {
	const variant =
		MODERN_CHROME_VARIANTS[
			Math.floor(Math.random() * MODERN_CHROME_VARIANTS.length)
		];

	// Viewport Jitter: slightly vary standard 1920x1080
	const width = 1920 + Math.floor(Math.random() * 11) - 5; // 1915-1925
	const height = 1080 + Math.floor(Math.random() * 11) - 5; // 1075-1085

	return {
		userAgent: variant.ua,
		viewport: { width, height },
		deviceScaleFactor: 1,
	};
};

/**
 * Returns proxy configuration if environment variables are set.
 * Supports residential proxy rotation via provider-specific logic if needed.
 */
export const getProxyConfig = () => {
	const server = process.env.PROXY_SERVER;
	const username = process.env.PROXY_USERNAME;
	const password = process.env.PROXY_PASSWORD;

	if (!server) return undefined;

	return {
		server,
		username,
		password,
	};
};
