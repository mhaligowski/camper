import { getLogger } from "./log";
import { run } from "./run";

require("dotenv").config();
const logger = getLogger();

async function main() {
  const params = {
    outDir: "out",
    jobs: []
  };
  const result = await run(params);
  logger.info("Result %j", result);
}

main().catch(logger.error);
