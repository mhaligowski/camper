import { getLogger } from "./log";
import { run } from "./index";
import { send } from "./sender";

require('dotenv').config();
const logger = getLogger();

const apiKey = process.env.SENDGRID_API_KEY as string;

async function main() {
    const params = {
        outDir: 'out'
    }
    await run(params);
    await send(apiKey);
}

main().catch(logger.error);
