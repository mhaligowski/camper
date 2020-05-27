import template from "./email.mjml";
import mjml2html from "mjml";

export function buildEmail(): string {
    return mjml2html(template).html;
};
