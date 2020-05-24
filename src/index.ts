import path from "path";
import { getLogger } from './log';
import puppeteer from 'puppeteer';
import { Crawler } from "./crawler";

const logger = getLogger();

type RunParams = {
    outDir: string
};

type CrawlResult = {
    resultsSize: number;
};

async function run(params?: RunParams): Promise<CrawlResult> {
    const browser = await puppeteer.launch({
        headless: true,
        defaultViewport: { width: 1200, height: 800 },
        args: ["--no-sandbox"],
    });
    const version = await browser.version();
    logger.info(`Browser version: ${version}`);

    const page = await browser.newPage();
    logger.info(`Opened new page `)

    try {
        logger.info("Going to the website...");
        await page.goto('https://washington.goingtocamp.com', { timeout: 0, waitUntil: 'load' });
    } catch (e) {
        logger.error("Cannot go to the page");
        logger.error(e);
        throw e;
    }

    try {
        const pageCrawler = new Crawler(page, params?.outDir);
        const result = await pageCrawler.crawl();
        return {
            resultsSize: result
        };
    } catch (e) {
        logger.error(`Error caught`);
        logger.error(e);
        throw e;
    } finally {
        if (browser.isConnected()) {
            logger.info("Closing the browser.");
            await browser.close();
        }
    }
};

export { run };