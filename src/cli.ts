import { promises as fs } from "fs";

import { getLogger } from "./log";
import { run } from "./run";
import { PageCrawlRequest } from "./crawler";

require("dotenv").config();
const logger = getLogger();

import yargs from "yargs";
import { hideBin } from "yargs/helpers";

const jobSpec1: PageCrawlRequest = {
	arrivalDate: new Date("September 28, 2021"),
	departureDate: new Date("September 30, 2021"),
	parkName: "Lake Chelan State Park",
	equipment: "1 Tent",
};

yargs(hideBin(process.argv))
	.command(
		"run",
		"runs the local crawl with current pre-configured params.",
		() => {},
		async () => {
			await fs.mkdir("out");

			const params = {
				outDir: "out",
				jobs: [jobSpec1],
				headless: false,
			};

			const result = await run(params);
			logger.info("Result %j", result);
		}
	)
	.demandCommand()
	.parseAsync()
	.catch(logger.error);
