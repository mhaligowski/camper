import template from "./email.mjml";

import mjml2html from "mjml";

import Mustache from "mustache";
import { PageCrawlResult } from "./crawler";

export function buildEmail(results: PageCrawlResult[] = []): string {
  const emailTemplate = Mustache.render(template, { results: results });
  return mjml2html(emailTemplate).html;
}
