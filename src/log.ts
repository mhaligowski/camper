import { Logger, format, transports, createLogger } from "winston";
import { LoggingWinston } from "@google-cloud/logging-winston";

class LoggerFactory {
    private static _instance: Logger;

    public static getInstance(): Logger {

        const t = process.env.K_REVISION == "crawl.local" ?
            new transports.Console() :
            new LoggingWinston();
        if (!LoggerFactory._instance) {
            LoggerFactory._instance = createLogger({
                level: 'debug',
                format: format.combine(
                    format.splat(),
                    format.simple()
                ), transports: [
                    new transports.Console(),
                ]
            });
        }

        return LoggerFactory._instance;
    }
}

export function getLogger() {
    return LoggerFactory.getInstance();
};