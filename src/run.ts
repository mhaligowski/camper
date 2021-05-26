import async from "async";
import { promises as fs } from "fs";
import puppeteer from "puppeteer";
import path from "path";

import { getLogger } from "./log";
import { Crawler, PageCrawlResult, PageCrawlRequest } from "./crawler";
import { v4 } from "uuid";

const logger = getLogger();

export type RunParams = {
	headless?: boolean;
	outDir: string;
	jobs: PageCrawlRequest[];
};

async function run(params: RunParams): Promise<PageCrawlResult[]> {
	logger.info("Starting new run with params %j.", params);
	const browser = await puppeteer.launch({
		headless: !!params.headless,
		defaultViewport: { width: 1920, height: 1080 },
		args: ["--no-sandbox"],
	});
	const version = await browser.version();
	logger.info(`Browser version: ${version}`);

	const page = await browser.newPage();
	logger.info(`Opened new page`);

	try {
		const id = v4();
		const outDir = path.join(params.outDir, id);
		await fs.mkdir(outDir);

		const pageCrawler = new Crawler(id, page, outDir);

		const result: PageCrawlResult[] = await async.mapSeries(
			params.jobs,
			async (jobParams) => pageCrawler.crawl(jobParams)
		);
		return result;
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
