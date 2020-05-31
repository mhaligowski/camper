import { getLogger } from "./log";
import { run } from "./index";

require("dotenv").config();
const logger = getLogger();

async function main() {
  const params = {
    outDir: "out",
  };
  const result = await run(params);
  logger.info("Result %j", result);
}

main().catch(logger.error);
