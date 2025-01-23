const { chromium } = require("patchright");
const fs = require("fs/promises");
const path = require("path");

class TiktokUploader {
  async upload({ englishLevel, videoPath, previewPath }) {
    const rawCookies = JSON.parse(await fs.readFile("cookies.json", "utf-8"));
    const formattedCookies = rawCookies.map((cookie) => ({
      ...cookie,
      sameSite: undefined,
    }));

    const browser = await chromium.launch({
      headless: false,
      // proxy: {
      //   server: "http://brd.superproxy.io:33335",
      //   username: "brd-customer-hl_ebede67c-zone-isp_proxy1",
      //   password: "far78v2e5gpi",
      // },
    });

    const context = await browser.newContext();
    await context.addCookies(formattedCookies);

    try {
      const page = await context.newPage();

      // await page.goto("https://ipinfo.io/ip");
      // const ip = await page.textContent("pre");

      // console.log("IP:", ip);
      // await page.waitForTimeout(300000000);

      // return;

      await page.goto("https://www.tiktok.com/tiktokstudio/upload");

      const fileInput = await page.locator('input[type="file"]');
      await fileInput.setInputFiles(videoPath);

      // await page.locator(".info-progress.success").waitFor({
      //   state: "attached",
      //   timeout: 10000,
      // });

      await page.waitForFunction(
        () => {
          const element = document.querySelector(".info-progress.success");
          return element && element.style.width === "100%";
        },
        { timeout: 120000 },
      );

      const titleField = await page.locator(".caption-editor");
      await titleField.click();
      await titleField.press("Backspace");
      await titleField.press("Backspace");
      await titleField.press("Backspace");

      await titleField.pressSequentially("master your english!", {
        delay: 100,
      });

      await page.keyboard.press("Enter");

      for (const tag of [
        "#english_test",
        "#english_b1",
        "#english_b2",
        "#english_c1",
        "#english_c2",
      ]) {
        await titleField.pressSequentially(tag, { delay: 100 });
        await page
          .locator('.mention-list-popover [role="option"]')
          .first()
          .click();
      }

      await page.locator(".edit-container").click();
      await page.waitForTimeout(1000);
      await page.locator(".cover-edit-header > :nth-child(2)").click();
      await page.waitForTimeout(1000);

      const previewInput = await page.locator(
        '.upload-image-container input[type="file"]',
      );
      await page.waitForTimeout(1000);
      await previewInput.setInputFiles(previewPath);

      await page.waitForTimeout(1000);
      await page.locator('button:has-text("Confirm")').last().click();

      await page.waitForTimeout(1000);
      // await page.locator('.footer button:has-text("Post")').click();

      await page.waitForTimeout(300000);

      console.log("Video uploaded");
    } finally {
      await context.close();
      await browser.close();
    }
  }
}

exports.tiktokUploader = new TiktokUploader();
