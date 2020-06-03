import { promises as fs } from "fs";
import { buildEmail } from "../email";
import { PageCrawlRequest, PageCrawlResult } from "../crawler";
import path from "path";

jest.mock("../email.mjml", () => {
  const fs = require("fs");
  const path = require("path");

  const templatePath = path.resolve("src", "email.mjml").normalize();
  return fs.readFileSync(templatePath).toString();
});

test("can generate an empty email", async () => {
  expect(buildEmail()).not.toBeFalsy();
});

test("can generate email from result list", async () => {
  const sampleContent = await fs.readFile(path.join(__dirname, "email.sample.json"));
  const sampleResult: PageCrawlResult[] = JSON.parse(sampleContent.toString());


  const result = buildEmail(sampleResult);
  expect(result).toContain("Lake Chelan State Park");
});
