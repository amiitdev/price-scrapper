import puppeteer, { type Browser, type Page } from "puppeteer-core";
import { randomUserAgent } from "./user-agents";

let browserInstance: Browser | null = null;
let browserLock: Promise<void> = Promise.resolve();

function sanitizedEnv(): Record<string, string> {
  const env = { ...process.env } as Record<string, string>;
  for (const key of Object.keys(env)) {
    if (key === "LD_PRELOAD" || key === "NODE_OPTIONS" || key === "NODE_PATH") {
      delete env[key];
    }
  }
  return env;
}

async function launchBrowser(): Promise<Browser> {
  const wsEndpoint = process.env.PLAYWRIGHT_WS_ENDPOINT;
  if (wsEndpoint) {
    return await puppeteer.connect({
      browserWSEndpoint: wsEndpoint,
      defaultViewport: { width: 1920, height: 1080 },
    });
  }
  return await puppeteer.launch({
    headless: true,
    timeout: 15000,
    args: [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--disable-dev-shm-usage",
      "--disable-gpu",
    ],
    env: sanitizedEnv(),
  });
}

function withLock<T>(fn: () => Promise<T>): Promise<T> {
  const prev = browserLock;
  let release: () => void;
  browserLock = new Promise((resolve) => { release = resolve; });
  return prev.then(fn).finally(release!);
}

export async function getBrowser(): Promise<Browser> {
  return withLock(async () => {
    if (browserInstance) {
      try {
        if (browserInstance.connected) {
          return browserInstance;
        }
      } catch {
        // dead
      }
      try { await browserInstance.close(); } catch {}
    }
    browserInstance = await launchBrowser();
    return browserInstance;
  });
}

export async function createPage(options?: {
  locale?: string;
  viewport?: { width: number; height: number };
}): Promise<Page> {
  let browser = await getBrowser();
  for (let i = 0; i < 2; i++) {
    try {
      const context = await browser.createBrowserContext();
      const page = await context.newPage();
      await page.setUserAgent(randomUserAgent());
      await page.setViewport(options?.viewport ?? { width: 1920, height: 1080 });
      await page.setExtraHTTPHeaders({
        "Accept-Language": "en-IN,en;q=0.9,hi;q=0.8",
        Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
      });
      page.setDefaultTimeout(Number(process.env.BROWSER_TIMEOUT) || 30000);
      return page;
    } catch {
      await resetBrowser();
      browser = await launchBrowser();
      browserInstance = browser;
    }
  }
  throw new Error("Failed to create page after retry");
}

export async function resetBrowser(): Promise<void> {
  return withLock(async () => {
    if (browserInstance) {
      try { await browserInstance.close(); } catch {}
      browserInstance = null;
    }
  });
}

export async function closeBrowser(): Promise<void> {
  await resetBrowser();
}
