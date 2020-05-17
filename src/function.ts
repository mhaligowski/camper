import fs from "fs";
import { run } from "./index";
import { getLogger } from "./log";

const logger = getLogger();

async function crawl() {
    logger.info("Function started");
    const outDir = await fs.promises.mkdtemp("crawl");
    await run({ outDir: outDir});
    return;
}

export { crawl };