import { run } from "./index";
import { getLogger } from "./log";

const logger = getLogger();

async function crawl() {
    logger.info("Function started");
    await run();
    return;
}

export { crawl };