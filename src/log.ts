import { Logger, format, transports, createLogger } from "winston";
import { LoggingWinston } from "@google-cloud/logging-winston";
import crypto from "crypto";

function createLocalLogger(): Logger {
  return createLogger({
    level: "debug",
    transports: [new transports.Console()],
    format: format.combine(
      format.splat(),
      format.colorize(),
      format.simple(),
    ),
  });
}

function createStackdriverLogger(): Logger {
  const transport = new LoggingWinston({
    labels: {
      crawl_run_id: crypto.randomBytes(8).toString("hex"),
    },
    logName: "cloudfunctions.googleapis.com/cloud-functions",
    // This has to be supplied so that the region is overwritten.
    resource: {
      type: "cloud_function",
      labels: {
        projectId: "camper",
        function_name: "crawl",
        region: "us-central1", // TODO: Provide region name in a different way.
      },
    },
    serviceContext: {
      service: process.env.K_SERVICE,
      version: process.env.K_REVISION,
    },
  });

  return createLogger({
    level: "info",
    format: format.splat(),
    transports: [transport],
  });
}

class LoggerFactory {
  private static _instance: Logger;

  public static getInstance(): Logger {
    if (!LoggerFactory._instance) {
      LoggerFactory._instance =
        process.env.K_REVISION == "local"
          ? createLocalLogger()
          : createStackdriverLogger();
    }

    return LoggerFactory._instance;
  }
}

export function getLogger() {
  return LoggerFactory.getInstance();
}
