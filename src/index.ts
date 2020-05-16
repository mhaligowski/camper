import winston from 'winston';
import puppeteer from 'puppeteer';

const logger = winston.createLogger({
    level: 'debug',
    transports: [
        new winston.transports.Console({ format: winston.format.simple() }),
    ]
});

let i = 0;
async function waitAndClick(page: any, selector: string): Promise<void> {
    await page.screenshot({
        path: `out/${i.toString().padStart(4, '0')}.${selector}.pre.png`,
        fullPage: true
    });
    try {
        logger.info(`Waiting for ${selector}`);
        await page.waitFor(selector, { visible: true });

        logger.info(`Picking ${selector}`);
        await page.click(selector);
        await page.screenshot({
            path: `out/${i.toString().padStart(4, '0')}.${selector}.post.png`,
            fullPage: true
        });
        i++;
    } catch (e) {
        await page.screenshot({ path: 'error.png', fullPage: true });
        logger.error(`Error reading selector ${selector}: `, e);
    }
}

async function waitAndEnter(page: any, selector: string, value: string): Promise<void> {
    await waitAndClick(page, selector);
    await page.keyboard.type(value);
}

(async () => {
    const browser = await puppeteer.launch({ headless: true, defaultViewport: { width: 1200, height: 800 } });
    const version = await browser.version();
    logger.info(`Browser version: ${version}`);
    const page = await browser.newPage();
    try {
        logger.info("Going to the website...");
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
    // JULY 1: 3 3 1 2
    // SEP 7: 4 1 3 2
    await waitAndClick(page, "input[formcontrolname=arrivalDate]"); // picker
    await waitAndClick(page, "button#monthDropdownPicker"); // month
    await waitAndClick(page, "mat-year-view tr:nth-child(4) :nth-child(1)"); // pick July
    await waitAndClick(page, "mat-month-view tbody tr:nth-child(3) :nth-child(2)"); // pick 1

    /**
     * DEPARTURE DATE
     */
    // JULY 5  3 3 2 1
    // SEP 9: 4 1 3 4

    // DOES NOT WORK IN HEADLESS!
    await waitAndClick(page, "input[formcontrolname=departureDate]"); // picker
    await waitAndClick(page, "button#monthDropdownPicker"); // month
    await waitAndClick(page, "mat-year-view tr:nth-child(4) :nth-child(1)"); // pick July
    await waitAndClick(page, "mat-month-view tbody tr:nth-child(3) :nth-child(4)"); // pick 5

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
     * LIST VIEW
     */
    await waitAndClick(page, "mat-button-toggle-group.btn-search-results-toggle mat-button-toggle:nth-child(2)");

    /**
     * FIND AVAILABLE SPOTS
     */
    logger.info(`Waiting for availability to load: "div.availability-panel"`);
    await page.waitFor("app-list-view");

    // Wait for 3 seconds before all the availability spots are shown.
    await page.waitFor(3000);
    const availabilitySelector = "div.resource-availability fa-icon.icon-available";
    const availableIds = await page.$$eval(availabilitySelector, avs => avs.map(a => a.parentElement?.id));
    logger.info(`Found ${availableIds.length}: ${availableIds}`);

    await page.screenshot({ path: 'example.png', fullPage: true });
    await browser.close();
})();