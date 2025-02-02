const { chromium } = require("patchright");
const fs = require("fs/promises");
const path = require("path");

const { Logger } = require("../system/logger");

const logger = new Logger("tiktok-uploader");

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
      "#germanforbeginners",
      "#learngerman",
      "#learnwithtiktok",
      "#germanquiz",
    ],
  },
  ru: {
    titles: [
      "Как хорошо ты знаешь английский? Узнай! 🇬🇧",
      "Сможешь перевести все слова? Проверь! 🎯",
      "Челлендж: переведи все слова правильно! 🧠🔥",
      "Тест: переведи слова с русского на английский! 📚✨",
      "Сможешь перевести все слова правильно? 🤔",
      "Тест на знание английского – справишься? 💪🌟",
      "Сможешь перевести все слова правильно? Попробуй! 🎉",
      "Знаешь правильный перевод? Прими участие! 🔥",
      "Челлендж: переведи все слова правильно! 🏆",
    ],
    tags: [
      "#учиманглийский",
      "#английский",
      "#английскийязык",
      "#тест",
      "#викторина",
      "#переводслов",
      "#english",
      "#quiz",
      "#learnenglish",
      "#englishquiz",
      "#английскийдляначинающих",
    ],
  },
};

const getTranslations = () => {
  const lang = process.env.TARGET_LANGUAGE;

  const title =
    translations[lang].titles[
      Math.floor(Math.random() * translations[lang].titles.length)
    ];

  const tags = translations[lang].tags
    .sort(() => Math.random() - 0.5)
    .slice(0, 5);

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
          path.resolve(process.cwd(), `../_storage/cookies.json`),
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

    const pathForScreenshots = path.resolve(
      process.cwd(),
      "../_storage/debug-screenshots",
    );

    await fs.mkdir(pathForScreenshots, { recursive: true });

    const browser = await chromium.launch({
      // based on patchright version
      executablePath:
        "/root/.cache/ms-playwright/chromium_headless_shell-1148/chrome-linux/headless_shell",
      headless: true,
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

      logger.info(`ip: ${ip}`);
      if (ip !== "91.108.197.217") {
        throw new Error("wrong ip");
      }

      await page.goto("https://www.tiktok.com/tiktokstudio/upload");
      await page.screenshot({
        path: path.resolve(pathForScreenshots, `${videoId}-initial.png`),
      });

      logger.info("tiktokstudio/upload page opened");

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

      logger.info("video file is set to input");

      const titleField = page.locator(".caption-editor");
      await titleField.click();
      await titleField.press("Backspace");
      await titleField.press("Backspace");
      await titleField.press("Backspace");

      logger.info("title field is cleared");

      const { title, tags } = getTranslations();

      await titleField.pressSequentially(title, {
        delay: 100,
      });

      await page.keyboard.press("Enter");
      logger.info("start setting tags");

      for (const tag of tags) {
        await titleField.pressSequentially(tag, { delay: 100 });
        const firstOption = page
          .locator('.mention-list-popover [role="option"]')
          .nth(0);

        await firstOption
          .waitFor({ state: "visible", timeout: 5000 })
          .then(async () => {
            await firstOption.click();
            logger.info(`tag ${tag} is set`);
          })
          .catch(async () => {
            for (const _ of tag) {
              await page.keyboard.press("Backspace");
            }
            logger.info(`tag ${tag} is not found`);
          });
      }

      logger.info("tags are set");
      logger.info("opening preview upload container");

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
      logger.info("preview is uploaded");

      await page.waitForTimeout(5000);
      await page.locator('.footer button:has-text("Post")').click();
      logger.info("post button is clicked");

      await page.screenshot({
        path: path.resolve(pathForScreenshots, `${videoId}-final-1.png`),
      });

      await page.waitForTimeout(20000);

      await page.screenshot({
        path: path.resolve(pathForScreenshots, `${videoId}-final-2.png`),
      });

      logger.info("video uploaded");
    } catch (e) {
      throw e;
    } finally {
      await context.close();
      await browser.close();
    }
  }
}

exports.tiktokUploader = new TiktokUploader();
