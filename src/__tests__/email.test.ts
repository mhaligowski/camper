import { buildEmail } from "../email";

jest.mock("../email.mjml", () => {
    const fs = require("fs");
    const path = require("path");

    const templatePath = path.resolve("src", "email.mjml").normalize();
    return fs.readFileSync(templatePath);
});

test("can generate an empty email", async () => {
    expect(buildEmail()).not.toBeFalsy();
});