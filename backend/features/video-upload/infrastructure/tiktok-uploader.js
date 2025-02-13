const { chromium } = require("patchright");
const fs = require("fs").promises;
const path = require("path");
const Logger = require("../../../shared/utils/logger");
const configService = require("../../../shared/infrastructure/config.service");

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

class TiktokUploader {
  constructor() {
    this.logger = new Logger("TiktokUploaderService");
  }

  getTranslations() {
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
  }

  async upload({ videoPath, previewPath, videoId }) {
    this.logger.info(`Uploading video ${videoId} to TikTok`);

    try {
      const rawCookies = JSON.parse(
        await fs
          .readFile(
            path.resolve(process.cwd(), `_storage/cookies.json`),
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
        "_storage/debug-screenshots",
      );

      await fs.mkdir(pathForScreenshots, { recursive: true });

      const browser = await chromium.launch({
        headless: true,
        proxy: {
          server: configService.get("proxyServer"),
          username: configService.get("proxyUsername"),
          password: configService.get("proxyPassword"),
        },
      });

      const context = await browser.newContext();
      await context.addCookies(formattedCookies);

      try {
        const page = await context.newPage();

        await page.goto("https://ipinfo.io/ip");
        const ip = await page.textContent("pre");

        this.logger.info(`ip: ${ip}`);
        if (ip !== "91.108.197.217") {
          throw new Error("wrong ip");
        }

        await page.goto("https://www.tiktok.com/tiktokstudio/upload");
        await page.screenshot({
          path: path.resolve(pathForScreenshots, `${videoId}-initial.png`),
        });

        this.logger.info("tiktokstudio/upload page opened");

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

        this.logger.info("video file is set to input");

        const titleField = page.locator(".caption-editor");
        await titleField.click();
        await titleField.press("Backspace");
        await titleField.press("Backspace");
        await titleField.press("Backspace");

        this.logger.info("title field is cleared");

        const { title, tags } = this.getTranslations();

        await titleField.pressSequentially(title, {
          delay: 100,
        });

        await page.keyboard.press("Enter");
        this.logger.info("start setting tags");

        for (const tag of tags) {
          await titleField.pressSequentially(tag, { delay: 100 });
          const firstOption = page
            .locator('.mention-list-popover [role="option"]')
            .nth(0);

          await firstOption
            .waitFor({ state: "visible", timeout: 5000 })
            .then(async () => {
              await firstOption.click();
              this.logger.info(`tag ${tag} is set`);
            })
            .catch(async () => {
              for (const _ of tag) {
                await page.keyboard.press("Backspace");
              }
              this.logger.info(`tag ${tag} is not found`);
            });
        }

        this.logger.info("tags are set");
        this.logger.info("opening preview upload container");

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
        this.logger.info("preview is uploaded");

        await page.waitForTimeout(5000);

        const footerButton = page.locator('.footer button:has-text("Post")');
        const tuxButton = page.locator('[class*="TUXButton-label"]:has-text("Post")');
        
        if (await footerButton.count() > 0) {
          await footerButton.click();
          this.logger.info("footer post button is clicked");
        } else {
          await tuxButton.click();
          this.logger.info("tux post button is clicked");
        }

        await page.screenshot({
          path: path.resolve(pathForScreenshots, `${videoId}-final-1.png`),
        });

        await page.waitForTimeout(20000);

        await page.screenshot({
          path: path.resolve(pathForScreenshots, `${videoId}-final-2.png`),
        });

        this.logger.info("video uploaded");
      } catch (error) {
        throw error;
      } finally {
        await context.close();
        await browser.close();
      }
    } catch (error) {
      this.logger.error('Failed to upload video to TikTok', error);
      throw error;
    }
  }
}

// Export an instance instead of the class
module.exports = new TiktokUploader(); 