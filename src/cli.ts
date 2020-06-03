import { getLogger } from "./log";
import { run } from "./run";
import { PageCrawlRequest } from "./crawler";

require("dotenv").config();
const logger = getLogger();

async function main() {
  const jobSpec1: PageCrawlRequest = {
    arrivalDate: new Date("Sep 1, 2020"),
    departureDate: new Date("Sep 5, 2020"),
    parkName: "Lake Chelan State Park",
    equipment: "1 Tent",
  };

  const jobSpec2: PageCrawlRequest = {
    arrivalDate: new Date("Sep 10, 2020"),
    departureDate: new Date("Sep 12, 2020"),
    parkName: "Lake Chelan State Park",
    equipment: "1 Tent",
  };

  const params = {
    outDir: "out",
    jobs: [jobSpec1, jobSpec2],
    headless: false
  };

  const result = await run(params);
  logger.info("Result %j", result);
}

main().catch(logger.error);
