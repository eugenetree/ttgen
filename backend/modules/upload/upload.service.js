const { chromium } = require("patchright");
const fs = require("fs/promises");

const uploadService = {
  upload: async () => {
    const rawCookies = JSON.parse(await fs.readFile("cookies.json", "utf-8"));
    const formattedCookies = rawCookies.map((cookie) => ({
      ...cookie,
      sameSite: undefined, // Can be 'Strict', 'Lax', or 'None'
    }));

    const browser = await chromium.launch({
      args: ["--no-sandbox"],
      headless: false,
      executablePath:
        "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome", // Path to Chrome on macOS
    });

    const context = await browser.newContext();
    await context.addCookies(formattedCookies);

    try {
      const page = await context.newPage();

      // await page.goto("https://www.stackoverflow.com/");
      // await page.waitForTimeout(3000);
      // await page.screenshot({ path: "stack.png" });

      await page.goto("https://www.tiktok.com/tiktokstudio/upload");
      await page.waitForTimeout(3000);

      const fileInput = await page.locator('input[type="file"]');
      await fileInput.setInputFiles("video.mp4");

      await page.locator(".info-progress.success").waitFor({
        state: "attached",
        timeout: 10000,
      });

      // Wait for the element's width style to be '100%'
      await page.waitForFunction(
        () => {
          const element = document.querySelector(".info-progress.success");
          return element && element.style.width === "100%";
        },
        { timeout: 120000 },
      );

      console.log("Video uploaded");

      await context.close();
      await browser.close();

      return;

      // await page.waitForTimeout(30000);

      // await frameHandle.locator(".btn-post button:not(disabled)").waitFor();
      // await frameHandle.evaluate(() => {
      //   return new Promise((resolve) => {
      //     const interval = setInterval(() => {
      //       if (
      //         document.querySelector(".btn-post button")?.disabled === false
      //       ) {
      //         resolve(true);
      //         clearInterval(interval);
      //       }
      //     }, 100);
      //   });
      // });

      // const titleInput = frameHandle.locator(".public-DraftEditor-content");
      // await titleInput.click({ clickCount: 3 });
      // await titleInput.type(video.title);

      // await frameHandle.locator(".btn-post button").click();

      // await frameHandle.locator(".upload-progress").waitFor();
      // await frameHandle
      //   .locator(".upload-progress")
      //   .waitFor({ state: "hidden" });
    } finally {
      await browser.close();
    }
  },
};

exports.uploadService = uploadService;
