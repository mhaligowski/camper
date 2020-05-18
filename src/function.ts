import fs from "fs";
import { sep } from "path";

import { run } from "./index";
import { getLogger } from "./log";
import { tmpdir } from "os";

const logger = getLogger();

async function crawl() {
    logger.info("Function started");
    const outDir = await fs.promises.mkdtemp(`${tmpdir()}${sep}crawl`);
    await run({ outDir: outDir });
    return;
}

export { crawl };