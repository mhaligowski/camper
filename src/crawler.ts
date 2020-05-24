import { Page } from "puppeteer"
import { getLogger } from "./log";

import path from "path";

const logger = getLogger();

class PageCrawler {
    i = 0;

    page: Page;
    outDir: string;

    constructor(page: Page, outDir = "out") {
        this.page = page;
        this.outDir = outDir;
    }

    async crawl(): Promise<number> {
        /**
         * PARK SELECTION
         */
        await this.waitAndClick("mat-select[formcontrolname=park]");
        await this.waitAndClick("mat-option#mat-option-33");

        /**
         * ARRIVAL DATE
         */
        // JULY 1: 3 3 1 2
        // SEP 7: 4 1 3 2
        await this.waitAndClick("input[formcontrolname=arrivalDate]"); // picker
        await this.waitAndClick("button#monthDropdownPicker"); // month
        await this.waitAndClick("mat-year-view tr:nth-child(3) :nth-child(3)"); // pick July
        await this.waitAndClick("mat-month-view tbody tr:nth-child(1) :nth-child(2)"); // pick 1

        /**
         * DEPARTURE DATE
         */
        // JULY 5  3 3 2 1
        // SEP 9: 4 1 3 4

        // DOES NOT WORK IN HEAD
        await this.waitAndClick("input[formcontrolname=departureDate]"); // picker
        await this.waitAndClick("button#monthDropdownPicker"); // month
        await this.waitAndClick("mat-year-view tr:nth-child(3) :nth-child(3)"); // pick July
        await this.waitAndClick("mat-month-view tbody tr:nth-child(2) :nth-child(1)"); // pick 5

        /**
         * COVID-19
         */
        try {
            await this.waitAndClick("mat-checkbox#acknowledgement .mat-checkbox-inner-container");
        } catch (e) {
            logger.info("Couldn't find the COVID-19 agreement, skipping.");
        }

        /**
         * EQUIPMENT SELECTION
         */
        await this.waitAndClick("mat-select[formcontrolname=equipment]");
        await this.waitAndClick("mat-option#mat-option-75"); // 1 Tent

        /**
         * PARTY SIZE
         */
        await this.waitAndEnter("input[formcontrolname=partySize]", "4"); // 4 people

        /**
         * CLICK BUTTON
         */
        await this.waitAndClick("button#actionSearch");

        /**
         * LIST VIEW
         */
        await this.waitAndClick("mat-button-toggle-group.btn-search-results-toggle mat-button-toggle:nth-child(2)");

        /**
         * FIND AVAILABLE SPOTS
         */
        logger.info(`Waiting for availability to load: "div.availability-panel"`);
        await this.page.waitFor("app-list-view");

        /**
         * MAKE SURE ONLY THE AVAILABLE ONES ARE VISIBLE.
         */
        logger.info("Limit only to the interesting ones.");
        await this.waitAndClick("mat-checkbox[formcontrolname=compareEnabled]");

        // Wait for 3 seconds before all the availability spots are shown. Better idea may be to wait for all the elements to have the opacity of 1.
        await this.page.waitFor(3000);
        const availabilitySelector = "div.resource-availability fa-icon.icon-available";
        const availableIds = await this.page.$$eval(availabilitySelector, avs => avs.map(a => a.parentElement?.id as string));
        logger.info(`Found ${availableIds.length}: ${availableIds}`);

        await this.page.screenshot({ path: `${this.outDir}/result.png`, fullPage: true });

        return availableIds.length;
    }

    private async  waitAndClick(selector: string): Promise<void> {
        await this.page.screenshot({
            path: path.join(this.outDir, `${this.i.toString().padStart(4, '0')}.${selector}.pre.png`),
            fullPage: true
        });

        try {
            logger.info(`Waiting for %s`, selector);
            await this.page.waitFor(selector, { visible: true, timeout: 60000 });

            logger.info(`Picking ${selector}`);
            await this.page.click(selector);
            await this.page.screenshot({
                path: path.join(this.outDir, `${this.i.toString().padStart(4, '0')}.${selector}.post.png`),
                fullPage: true
            });
        } catch (e) {
            await this.page.screenshot({ path: path.join(this.outDir, 'error.png'), fullPage: true });
            logger.error(`Error reading selector ${selector}: `, e);
            throw e;
        } finally {
            this.i++;
        }
    }

    private async waitAndEnter(selector: string, value: string): Promise<void> {
        await this.waitAndClick(selector);
        await this.page.keyboard.type(value);
    }

};

export { PageCrawler as Crawler }