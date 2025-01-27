const { chromium } = require("patchright");
const fs = require("fs/promises");
const path = require("path");

class TiktokUploader {
  async upload() {
    const rawCookies = JSON.parse(
      await fs
        .readFile(path.resolve(process.cwd(), `./cookies.json`), "utf-8")
        .catch(() => "[]"),
    );

    if (rawCookies.length === 0) {
      throw new Error("cookies are not provided");
    }

    const formattedCookies = rawCookies.map((cookie) => ({
      ...cookie,
      sameSite: undefined,
    }));

    const browser = await chromium.launch({
      headless: false,
      proxy: {
        server: "http://brd.superproxy.io:33335",
        username: "brd-customer-hl_ebede67c-zone-isp_proxy1",
        password: "far78v2e5gpi",
      },
    });

    const context = await browser.newContext();
    await context.addCookies(formattedCookies);

    try {
      const page = await context.newPage();

      await page.goto("https://ipinfo.io/ip");
      const ip = await page.textContent("pre");

      console.log(`ip: ${ip}`);
      if (ip !== "91.108.197.217") {
        throw new Error("wrong ip");
      }

      await page.goto("https://www.tiktok.com/tiktokstudio/upload");
      const fileInput = await page.locator('input[type="file"]');
      await fileInput.setInputFiles(path.resolve(process.cwd(), "./1.mp4"));

      await page.waitForFunction(
        () => {
          const element = document.querySelector(".info-progress.success");
          return element && element.style.width === "100%";
        },
        { timeout: 120000 },
      );
      const titleField = await page.locator(".caption-editor");

      for (const tag of ["#english", "#deutsch"]) {
        await titleField.pressSequentially(tag, { delay: 100 });
        await page
          .locator('.mention-list-popover [role="option"]')
          .first()
          .click();

        await page.waitForTimeout(1000);
      }

      await page.waitForTimeout(500000);
    } finally {
      await context.close();
      await browser.close();
    }
  }
}

new TiktokUploader().upload();
