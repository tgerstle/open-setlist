import { test, expect } from "@playwright/test";

test.describe("Local Live Music Tracker Navigation", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("should display the daily feed by default", async ({ page }) => {
    await expect(page).toHaveTitle(/Local Live Music Tracker/);
    await expect(page.locator("main")).toBeVisible();
  });

  test("should switch between feed and calendar views", async ({ page }) => {
    // Select the link in the header/banner specifically
    const calendarLink = page
      .getByRole("banner")
      .getByRole("link", { name: "Calendar" });
    const feedLink = page
      .getByRole("banner")
      .getByRole("link", { name: "Feed" });

    await expect(calendarLink).toBeVisible();
    await calendarLink.click();

    await expect(page).toHaveURL(/\/calendar/);

    await feedLink.click();
    await expect(page).toHaveURL(/\//);
  });
});
