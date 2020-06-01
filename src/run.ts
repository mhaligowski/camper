import puppeteer from "puppeteer";

import { getLogger } from "./log";
import { Crawler, PageCrawlResult, PageCrawlRequest } from "./crawler";

const logger = getLogger();

export type RunParams = {
  headless?: boolean;
  outDir: string;
  jobs: PageCrawlRequest[];
};

async function run(params: RunParams): Promise<PageCrawlResult> {
  logger.info("Starting new run with params %j.", params);
  const browser = await puppeteer.launch({
    headless: !!params.headless,
    defaultViewport: { width: 1200, height: 800 },
    args: ["--no-sandbox"],
  });
  const version = await browser.version();
  logger.info(`Browser version: ${version}`);

  const page = await browser.newPage();
  logger.info(`Opened new page`);

  try {
    const pageCrawler = new Crawler(page, params.outDir);
    return await pageCrawler.crawl(params.jobs[0]);
  } catch (e) {
    logger.error("Error caught.");
    logger.error(e);
    throw e;
  } finally {
    if (browser.isConnected()) {
      logger.info("Closing the browser.");
      await browser.close();
    }
  }
}

export { run };
