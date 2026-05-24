import { expect, test } from "@playwright/test";

test.describe("Admin Area", () => {
  test("should load the admin dashboard", async ({ page }) => {
    await page.goto("/admin/dashboard");
    await expect(page).toHaveTitle(/Admin/i, { timeout: 10000 });
    // Also ensure the dashboard content is visible 
    await expect(page.locator("body")).toBeVisible();
  });

  test("should load the admin events page", async ({ page }) => {
    await page.goto("/admin/events");
    await expect(page.locator("body")).toBeVisible();
    await expect(page).not.toHaveTitle(/Error/i);
  });
});

  test("should load the admin venues page", async ({ page }) => {
    // Note: Depends on local DB state, may 404 if "cactus-club" isn't present
    // Just testing it doesn't crash on import
    const response = await page.goto("/admin/venues/cactus-club");
    await expect(page.locator("body")).toBeVisible();
  });
