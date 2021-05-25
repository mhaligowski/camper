import { promises as fs } from "fs";
import { sep } from "path";
import { tmpdir } from "os";
import { Context } from "@google-cloud/functions-framework";

import { run, RunParams } from "./run";
import { getLogger } from "./log";
import { send } from "./sender";
import { PageCrawlRequest, PageCrawlResult } from "./crawler";

require("dotenv").config();
const logger = getLogger();

async function crawl(data: {}, context: Context) {
	// @ts-ignore
	const jobSpecsRaw = Buffer.from(data.data, "base64").toString();

	logger.info(
		"Function started. Service: %s, name: %s, data: %s",
		process.env.K_SERVICE,
		process.env.K_REVISION,
		JSON.stringify(jobSpecsRaw)
	);

	let jobSpecs: PageCrawlRequest[];
	try {
		jobSpecs = JSON.parse(jobSpecsRaw);
	} catch (e) {
		logger.warning("Problem parsing the jobs, using fallback");

		const jobSpec: PageCrawlRequest = {
			arrivalDate: new Date("July 1, 2020"),
			departureDate: new Date("July 5, 2020"),
			parkName: "Lake Chelan State Park",
			equipment: "1 Tent",
		};

		const jobSpec2: PageCrawlRequest = {
			arrivalDate: new Date("Sep 4, 2020"),
			departureDate: new Date("Sep 7, 2020"),
			parkName: "Lake Chelan State Park",
			equipment: "1 Tent",
		};

		jobSpecs = [jobSpec, jobSpec2];
	}

	const outDir = await fs.mkdtemp(`${tmpdir()}${sep}crawl`);
	logger.info(`Target directory: ${outDir}`);

	const runParams: RunParams = {
		outDir: outDir,
		headless: true,
		jobs: jobSpecs,
	};

	const results = await run(runParams);
	logger.info("Results: %j", results);

	const relevant = results.filter((r) => r.results.length > 0);
	if (relevant.length == 0) {
		logger.info("No relevant results found");
		return;
	}

	try {
		const sendmail_api_key = process.env.SENDGRID_API_KEY as string;
		await send(sendmail_api_key, relevant);
	} catch (e) {
		logger.error(e);
		throw e;
	}

	return;
}

export { crawl };
