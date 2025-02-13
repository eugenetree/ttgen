const { chromium } = require("patchright");
const fs = require("fs/promises");
const path = require("path");

const translations = {
  de: {
    titles: [
      "Wie gut ist dein Englisch? Finde es heraus! 🇩🇪🇬🇧",
      "Kannst du alle übersetzen? Beweise es! 🎯",
      "Deutsch-Englisch Challenge: Schaffst du 100%? 🧠🔥",
      "Teste dein Wissen: Deutsche Wörter auf Englisch! 📚✨",
      "Wie gut kennst du diese Übersetzungen? 🤔",
      "Englisch-Quiz für Profis – schaffst du es? 💪🌟",
      "Kannst du alles richtig übersetzen? Probiere es aus! 🎉",
      "Deutsch vs. Englisch: Wer gewinnt? 😎⚡",
      "Weißt du die richtige Übersetzung? Mach mit! 🔥",
      "Herausforderung: Übersetze alle Wörter richtig! 🏆",
    ],
    tags: [
      "#lernenmittiktok",
      "#englischlernen",
      "#learnenglish",
      "#englishquiz",
      "#englischfüranfänger",
      "#fyp",
      "#fürdich",
      "#viral",
      "#germanforbeginners",
      "#learngerman",
      "#learnwithtiktok",
      "#germanquiz",
    ],
  },
};

const getTranslations = () => {
  const lang = process.env.TARGET_LANGUAGE;

  const title = "123";
  const tags = [
    "#lernenmittiktok",
    "#englischlernen",
    "#learnenglish",
    "#englishquiz",
    "#englischfüranfänger",
    "#fyp",
    "#fürdich",
    "#germanforbeginners",
    "#learngerman",
    "#learnwithtiktok",
    "#germanquiz",
  ]

  return {
    title,
    tags,
  };
};

class TiktokUploader {
  async upload({ videoPath, previewPath, videoId }) {
    const rawCookies = JSON.parse(
      await fs
        .readFile(
          path.resolve(process.cwd(), `../_storage/ru-cookies.json`),
          "utf-8",
        )
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
      // based on patchright version
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

      await page.goto("https://www.tiktok.com/tiktokstudio/upload");
      console.log("tiktokstudio/upload page opened");

      const fileInput = page.locator('input[type="file"]');
      await fileInput.waitFor({ state: "attached" });
      await fileInput.setInputFiles(videoPath);

      await page.waitForFunction(
        () => {
          const element = document.querySelector(".info-progress");
          return element && element.style.width === "100%";
        },
        { timeout: 120000 },
      );

      console.log("video file is set to input");

      const titleField = page.locator(".caption-editor");
      await titleField.click();
      await titleField.press("Backspace");
      await titleField.press("Backspace");
      await titleField.press("Backspace");

      console.log("title field is cleared");

      const { title, tags } = getTranslations();

      await titleField.pressSequentially(title, {
        delay: 100,
      });

      await page.keyboard.press("Enter");
      console.log("start setting tags");

      for (const tag of tags) {
        await titleField.pressSequentially(tag, { delay: 100 });
        const firstOption = page
          .locator('.mention-list-popover [role="option"]')
          .nth(0);

        await firstOption
          .waitFor({ state: "visible", timeout: 5000 })
          .then(async () => {
            await firstOption.click();
            console.log(`tag ${tag} is set`);
          })
          .catch(async () => {
            for (const _ of tag) {
              await page.keyboard.press("Backspace");
            }
            console.log(`tag ${tag} is not found`);
          });
      }

      console.log("tags are set");
      console.log("opening preview upload container");

      await page.locator(".edit-container").click();
      await page.waitForTimeout(2000);
      await page.locator(".cover-edit-header > :nth-child(2)").click();
      await page.waitForTimeout(2000);

      const previewInput = page.locator(
        '.upload-image-container input[type="file"]',
      );
      await previewInput.waitFor({ state: "attached" });
      await page.waitForTimeout(1000);
      await previewInput.setInputFiles(previewPath);

      await page.waitForTimeout(10000);
      await page.locator('button:has-text("Confirm")').last().click();
      console.log("preview is uploaded");

      await page.waitForTimeout(5000);

      const footerButton = page.locator('.footer button:has-text("Post")');
      const tuxButton = page.locator('[class*="TUXButton-label"]:has-text("Post")');
      
      if (await footerButton.count() > 0) {
        await footerButton.click();
        console.log("footer post button is clicked");
      } else {
        await tuxButton.click();
        console.log("tux post button is clicked");
      }

      await page.waitForTimeout(20000);

      console.log("video uploaded");
    } catch (e) {
      throw e;
    } finally {
      await context.close();
      await browser.close();
    }
  }
}

const tiktokUploader = new TiktokUploader();
tiktokUploader.upload({
  videoPath: "./debug.mp4",
  previewPath: "./debug.png",
  videoId: 1,
});
