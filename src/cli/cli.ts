import { getLogger } from "../log";

require("dotenv").config();

import yargs from "yargs";
import { hideBin } from "yargs/helpers";

const logger = getLogger();
yargs(hideBin(process.argv))
	.commandDir("./cmds", { extensions: ["js", "ts"]})
	.demandCommand()
	.help()
	.parseAsync()
	.catch(logger.error);
