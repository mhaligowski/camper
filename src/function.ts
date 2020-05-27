import { promises as fs } from "fs";
import { sep } from "path";
import { tmpdir } from "os";

import { run } from "./index";
import { getLogger } from "./log";
import { send } from "./sender";

require('dotenv').config();
const logger = getLogger();

async function crawl() {
    logger.info("Function started. Service: %s, name: %s.",
        process.env.K_SERVICE,
        process.env.K_REVISION);

    const outDir = await fs.mkdtemp(`${tmpdir()}${sep}crawl`);
    logger.info(`Target directory: ${outDir}`);
    const result = await run({ outDir: outDir });

    if (result.results.length == 0) {
        logger.info("No results found.");
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