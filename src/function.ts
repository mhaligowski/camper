import { promises as fs } from "fs";
import { sep } from "path";
import { tmpdir } from "os";

import { run, RunParams } from "./run";
import { getLogger } from "./log";
import { send } from "./sender";
import { PageCrawlRequest } from "./crawler";

require("dotenv").config();
const logger = getLogger();

async function crawl() {
  logger.info(
    "Function started. Service: %s, name: %s.",
    process.env.K_SERVICE,
    process.env.K_REVISION
  );

  const outDir = await fs.mkdtemp(`${tmpdir()}${sep}crawl`);
  logger.info(`Target directory: ${outDir}`);

  const jobSpec: PageCrawlRequest = {
    arrivalDate: new Date("July 1, 2020"),
    departureDate: new Date("July 5, 2020"),
    parkName: "Lake Chelan State Park",
    equipment: "1 Tent",
  };

  const jobSpec2: PageCrawlRequest = {
    arrivalDate: new Date("Sep 10, 2020"),
    departureDate: new Date("Sep 12, 2020"),
    parkName: "Lake Chelan State Park",
    equipment: "1 Tent",
  };

  const runParams: RunParams = {
    outDir: outDir,
    headless: true,
    jobs: [jobSpec, jobSpec2],
  };

  const result = await run(runParams);

  if (result[0].results.length == 0) {
    // TODO: Unignore all the results.
    // logger.info("No results found in the first search");
    return;
  }

  try {
    const sendmail_api_key = process.env.SENDGRID_API_KEY as string;
    await send(sendmail_api_key);
  } catch (e) {
    logger.error(e);
    throw e;
  }

  return;
}

export { crawl };
