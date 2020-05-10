import winston from 'winston';
import puppeteer from 'puppeteer';

const logger = winston.createLogger({
    level: 'debug',
    transports: [
        new winston.transports.Console({ format: winston.format.simple() }),
    ]
});

async function waitAndClick(page: any, selector: string): Promise<void> {
    logger.info(`Clicking ${selector}`);
    try {
        await page.waitFor(selector, { visible: true });
        await page.click(selector);
    } catch (e) {
        logger.error(`Error reading selector ${selector}: `, e);
    }
}

async function waitAndEnter(page: any, selector: string, value: string): Promise<void> {
    await waitAndClick(page, selector);
    await page.keyboard.type(value);
}

(async () => {
    const browser = await puppeteer.launch({ headless: false, defaultViewport: null });
    const page = await browser.newPage();
    try {
        await page.goto('https://washington.goingtocamp.com', { timeout: 0, waitUntil: 'load' });
    } catch (e) {
        logger.error(e);
    }
    /**
     * PARK SELECTION
     */
    await waitAndClick(page, "mat-select[formcontrolname=park]");
    await waitAndClick(page, "mat-option#mat-option-33");

    /**
     * ARRIVAL DATE
     */
    await waitAndClick(page, "input[formcontrolname=arrivalDate]"); // picker
    await waitAndClick(page, "button#monthDropdownPicker"); // month
    await waitAndClick(page, "mat-year-view tr:nth-child(3) :nth-child(3)"); // pick July
    await waitAndClick(page, "mat-month-view tbody tr:nth-child(1) :nth-child(2)"); // pick 1

    /**
     * DEPARTURE DATE
     */
    await waitAndClick(page, "input[formcontrolname=departureDate]"); // picker
    await waitAndClick(page, "button#monthDropdownPicker"); // month
    await waitAndClick(page, "mat-year-view tr:nth-child(3) :nth-child(3)"); // pick July
    await waitAndClick(page, "mat-month-view tbody tr:nth-child(2) :nth-child(1)"); // pick 5

    /**
     * COVID-19
     */
    await waitAndClick(page, "mat-checkbox#acknowledgement .mat-checkbox-inner-container");

    /**
     * EQUIPMENT SELECTION
     */
    await waitAndClick(page, "mat-select[formcontrolname=equipment]");
    await waitAndClick(page, "mat-option#mat-option-75"); // 1 Tent

    /**
     * PARTY SIZE
     */
    await waitAndEnter(page, "input[formcontrolname=partySize]", "4");

    /**
     * CLICK BUTTON
     */
    await waitAndClick(page, "button#actionSearch");

    /**
     * MAP VIEW
     */
    await waitAndClick(page, "button#mat-button-toggle-2-button");

    await page.screenshot({ path: 'example.png', fullPage: true });
    await browser.close();
})();