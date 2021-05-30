import { getLogger } from "../../log";

const logger = getLogger();

export const command = "config";
export const builder = (yargs: any) => {
	return yargs
		.commandDir("./config_cmds", { extensions: ["js", "ts"]})
		.demandCommand()
		.help();
};
export const handler = () => {
	console
};
