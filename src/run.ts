import { getLogger } from "./log";
import { run } from "./index";

const logger = getLogger();

run().catch(logger.info);
