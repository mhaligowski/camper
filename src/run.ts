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

	const runId = v4();
	const runOutDir = path.join(params.outDir, runId);

	logger.debug("Creating run directory %s.", runOutDir);
	try {
		await fs.mkdir(runOutDir);
		logger.debug("Directory %s created.", runOutDir);
	} catch (e) {
		logger.warn(e);
		if (e.code === "EEXIST") {
			logger.warn("Directory %s already exists. Skipping.", runOutDir);
		} else {
			logger.error(e);
			if (browser.isConnected()) {
				logger.info(
					"Creating output dir %s failed. Closing the browser.",
					runOutDir
				);
				await browser.close();
			}
			throw e;
		}
	}

	const pageCrawler = new Crawler(runId, page);

	try {
		return await async.mapSeries(params.jobs, async (jobParams) => {
			const crawlId = v4();
			const jobDir = path.join(runOutDir, crawlId);
			await fs.mkdir(jobDir);

			const result = await pageCrawler.crawl(jobParams, jobDir, crawlId);
			return result;
		});
	} catch (e) {
		logger.error("Error caught.", e);
		throw e;
	} finally {
		if (browser.isConnected()) {
			logger.info("Everything is finished. Closing the browser.");
			await browser.close();
		}
	}
}

export { run };
