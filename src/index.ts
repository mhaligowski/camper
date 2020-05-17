import path from "path";
import { getLogger } from './log';
import puppeteer, { Page } from 'puppeteer';

const logger = getLogger();

let i = 0;
async function waitAndClick(page: any, selector: string, outDir = "out"): Promise<void> {
    await page.screenshot({
        path: path.join(outDir, `${i.toString().padStart(4, '0')}.${selector}.pre.png`),
        fullPage: true
    });

    try {
        logger.info(`Waiting for ${selector}`);
        await page.waitFor(selector, { visible: true, timeout: 60000 });

        logger.info(`Picking ${selector}`);
        await page.click(selector);
        await page.screenshot({
            path: path.join(outDir, `${i.toString().padStart(4, '0')}.${selector}.post.png`),
            fullPage: true
        });
    } catch (e) {
        await page.screenshot({ path: path.join(outDir, 'error.png'), fullPage: true });
        logger.error(`Error reading selector ${selector}: `, e);
        throw e;
    } finally {
        i++;
    }
}

async function waitAndEnter(page: any, selector: string, value: string): Promise<void> {
    await waitAndClick(page, selector);
    await page.keyboard.type(value);
}

async function crawl(page: Page, outDir?: string): Promise<void> {
    /**
     * PARK SELECTION
     */
    await waitAndClick(page, "mat-select[formcontrolname=park]", outDir);
    await waitAndClick(page, "mat-option#mat-option-33", outDir);

    /**
     * ARRIVAL DATE
     */
    // JULY 1: 3 3 1 2
    // SEP 7: 4 1 3 2
    await waitAndClick(page, "input[formcontrolname=arrivalDate]", outDir); // picker
    await waitAndClick(page, "button#monthDropdownPicker", outDir); // month
    await waitAndClick(page, "mat-year-view tr:nth-child(4) :nth-child(1)", outDir); // pick July
    await waitAndClick(page, "mat-month-view tbody tr:nth-child(3) :nth-child(2)", outDir); // pick 1

    /**
     * DEPARTURE DATE
     */
    // JULY 5  3 3 2 1
    // SEP 9: 4 1 3 4

    // DOES NOT WORK IN HEADLESS!
    await waitAndClick(page, "input[formcontrolname=departureDate]", outDir); // picker
    await waitAndClick(page, "button#monthDropdownPicker", outDir); // month
    await waitAndClick(page, "mat-year-view tr:nth-child(4) :nth-child(1)", outDir); // pick July
    await waitAndClick(page, "mat-month-view tbody tr:nth-child(3) :nth-child(4)", outDir); // pick 5

    /**
     * COVID-19
     */
    await waitAndClick(page, "mat-checkbox#acknowledgement .mat-checkbox-inner-container", outDir);

    /**
     * EQUIPMENT SELECTION
     */
    await waitAndClick(page, "mat-select[formcontrolname=equipment]", outDir);
    await waitAndClick(page, "mat-option#mat-option-75", outDir); // 1 Tent

    /**
     * PARTY SIZE
     */
    await waitAndEnter(page, "input[formcontrolname=partySize]", "4"); // 4 people

    /**
     * CLICK BUTTON
     */
    await waitAndClick(page, "button#actionSearch", outDir);

    /**
     * LIST VIEW
     */
    await waitAndClick(page, "mat-button-toggle-group.btn-search-results-toggle mat-button-toggle:nth-child(2)", outDir);

    /**
     * FIND AVAILABLE SPOTS
     */
    logger.info(`Waiting for availability to load: "div.availability-panel"`);
    await page.waitFor("app-list-view");

    /**
     * MAKE SURE ONLY THE AVAILABLE ONES ARE VISIBLE.
     */
    logger.info("Limit only to the interesting ones.");
    await waitAndClick(page, "mat-checkbox[formcontrolname=compareEnabled]", outDir);

    // Wait for 3 seconds before all the availability spots are shown. Better idea may be to wait for all the elements to have the opacity of 1.
    await page.waitFor(3000);
    const availabilitySelector = "div.resource-availability fa-icon.icon-available";
    const availableIds = await page.$$eval(availabilitySelector, avs => avs.map(a => a.parentElement?.id as string));
    logger.info(`Found ${availableIds.length}: ${availableIds}`);

    /**
     * GO LOOK FOR DETAILS.
     */
    /**
    logger.info('Going to the first page.');
    const first: string = availableIds[0];
    await waitAndClick(page, `#${first}`);
     */

    await page.screenshot({ path: 'example.png', fullPage: true });
}

type RunParams = {
    outDir: string
}

async function run(params?: RunParams) {
    const browser = await puppeteer.launch({
        headless: true,
        defaultViewport: { width: 1200, height: 800 },
        args: ["--no-sandbox"],
    });
    const version = await browser.version();
    logger.info(`Browser version: ${version}`);
    const page = await browser.newPage();
    try {
        logger.info("Going to the website...");
        await page.goto('https://washington.goingtocamp.com', { timeout: 0, waitUntil: 'load' });
    } catch (e) {
        logger.error(e);
    }

    try {
        await crawl(page, params?.outDir);
    } catch (e) {
        logger.error(e);
    } finally {
        logger.info("Closing the browser.");
        await browser.close();
    }
};

export { run };