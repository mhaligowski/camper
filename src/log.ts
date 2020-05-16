import winston from "winston";

class LoggerFactory {
    private static _instance: winston.Logger;

    public static getInstance(): winston.Logger {
        if (!LoggerFactory._instance) {
            LoggerFactory._instance = winston.createLogger({
                level: 'debug',
                transports: [
                    new winston.transports.Console({ format: winston.format.simple() }),
                ]
            });
        }

        return LoggerFactory._instance;
    }
}

export function getLogger() {
    return LoggerFactory.getInstance();
};