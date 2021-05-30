import { promises as fs } from "fs";
import { PageCrawlRequest } from "../../crawler";
import { run } from "../../run";

import { getLogger } from "../../log";
const logger = getLogger();

const jobSpec1: PageCrawlRequest = {
	arrivalDate: new Date("September 28, 2021"),
	departureDate: new Date("September 30, 2021"),
	parkName: "Lake Chelan State Park",
	equipment: "1 Tent",
};

export const command = "run";
export const desc = "runs the local crawl with current pre-configured params.";
export const builder = () => {};
export const handler = async () => {
	try {
		await fs.mkdir("out");
	} catch (e) {
		if (e.code === "EEXIST") {
			logger.warn("Directory already exists");
		} else {
			logger.error(e);
			throw e;
		}
	}

	const params = {
		outDir: "out",
		jobs: [jobSpec1],
		headless: false,
	};

	const result = await run(params);
	logger.info("Result %j", result);
};
