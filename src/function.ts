import { promises as fs } from "fs";
import { sep } from "path";
import { tmpdir } from "os";

import { run } from "./index";
import { getLogger } from "./log";
import { send } from "./sender";

require('dotenv').config();

const logger = getLogger();

async function crawl() {
    logger.info("Function started");

    const outDir = await fs.mkdtemp(`${tmpdir()}${sep}crawl`);
    logger.info(`Target directory: $(outDir}`);


    await run({ outDir: outDir });

    const sendmail_api_key = process.env.SENDGRID_API_KEY as string;
    await send(sendmail_api_key);
    
    return;
}

export { crawl };