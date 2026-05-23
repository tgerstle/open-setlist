import "@testing-library/jest-dom";

import { vi } from "vitest";

global.fetch = vi.fn().mockImplementation((url) => {
	if (url === "/data/search-index.json")
		return Promise.resolve({ json: () => Promise.resolve([]) });
	return Promise.resolve({ json: () => Promise.resolve({}) });
});
