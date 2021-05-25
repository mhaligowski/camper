import { getLogger } from "./log";
import { run } from "./run";
import { PageCrawlRequest } from "./crawler";

require("dotenv").config();
const logger = getLogger();

async function main() {
  const jobSpec1: PageCrawlRequest = {
    arrivalDate: new Date("May 28, 2021"),
    departureDate: new Date("May 31, 2021"),
    parkName: "Lake Chelan State Park",
    equipment: "1 Tent",
  };

  const params = {
    outDir: "out",
    jobs: [jobSpec1],
    headless: false
  };

  const result = await run(params);
  logger.info("Result %j", result);
}

main().catch(logger.error);
