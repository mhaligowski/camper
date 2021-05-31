import { Page } from "puppeteer";
import path from "path";
import { format } from "util";

import { getLogger } from "./log";
import { getCoords } from "./datepick";

const logger = getLogger();

export type PageCrawlRequest = {
	arrivalDate: Date;
	departureDate: Date;
	parkName: string;
	equipment: string;
};

type ResultLine = {
	id: string; // value of HTML id attribute
	name: string;
};

export type PageCrawlResult = {
	runId: string; // run UUID
	runTimestamp: Date;
	crawlId: string; // id of a single crawl
	url: string; // final URL
	screenshot: string; // path of the resulting image
	results: ResultLine[];
} & PageCrawlRequest;

class PageCrawler {
	i = 0;

	runId: string;
	page: Page; // Google Chrome reference
	runTimestamp: Date;

	constructor(runId: string, runTimestamp: Date, page: Page) {
		this.runId = runId;
		this.page = page;
		this.runTimestamp = runTimestamp;
	}

	async crawl(
		jobSpec: PageCrawlRequest,
		outDir: string,
		crawlId: string
	): Promise<PageCrawlResult> {
		/**
		 * GO TO WASHINGTON CAMPING RESERVATION.
		 */
		try {
			logger.debug("Going to the website...");
			await this.page.goto("https://washington.goingtocamp.com", {
				timeout: 0,
				waitUntil: "load",
			});
		} catch (e) {
			logger.error("Cannot go to the page", e);
			throw e;
		}

		/**
		 * PARK SELECTION
		 */
		await this.waitAndClick("mat-select[formcontrolname=park]", outDir);
		await this.waitAndClickWithText("mat-option", jobSpec.parkName, outDir);

		/**
		 * ARRIVAL DATE
		 */
		const arrivalCoords = getCoords(new Date(jobSpec.arrivalDate));
		logger.debug("Picking for coords: %j", arrivalCoords);

		await this.waitAndClick("input[formcontrolname=arrivalDate]", outDir);
		await this.waitAndClick("button#monthDropdownPicker", outDir);
		await this.waitAndClick(
			format(
				"mat-year-view tr:nth-child(%d) :nth-child(%d)",
				arrivalCoords.month.row + 1,
				arrivalCoords.month.col + 1
			),
			outDir
		);
		await this.waitAndClick(
			format(
				"mat-month-view tbody tr:nth-child(%d) :nth-child(%d)",
				arrivalCoords.day.row + 1,
				arrivalCoords.day.col + 1
			),
			outDir
		);

		/**
		 * DEPARTURE DATE
		 */
		const departureCoords = getCoords(new Date(jobSpec.departureDate));
		logger.debug("Picking for coords: %j", departureCoords);

		await this.waitAndClick("input[formcontrolname=departureDate]", outDir);
		await this.waitAndClick("button#monthDropdownPicker", outDir);
		await this.waitAndClick(
			format(
				"mat-year-view tr:nth-child(%d) :nth-child(%d)",
				departureCoords.month.row + 1,
				departureCoords.month.col + 1
			),
			outDir
		);
		await this.waitAndClick(
			format(
				"mat-month-view tbody tr:nth-child(%d) :nth-child(%d)",
				departureCoords.day.row + 1,
				departureCoords.day.col + 1
			),
			outDir
		);

		/**
		 * COVID-19
		 */
		try {
			await this.waitAndClick(
				"mat-checkbox#acknowledgement .mat-checkbox-inner-container",
				outDir
			);
		} catch (e) {
			logger.info("Couldn't find the COVID-19 agreement, skipping.");
		}

		/**
		 * EQUIPMENT SELECTION
		 */
		await this.waitAndClick("mat-select[formcontrolname=equipment]", outDir);
		await this.waitAndClickWithText("mat-option", jobSpec.equipment, outDir);

		/**
		 * PARTY SIZE
		 */
		await this.waitAndEnter("input[formcontrolname=partySize]", "4", outDir); // 4 people

		/**
		 * CLICK BUTTON
		 */
		await this.waitAndClick("button#actionSearch", outDir);

		/**
		 * LIST VIEW
		 */
		await this.waitAndClick("[aria-label='List View']", outDir);

		/**
		 * FIND AVAILABLE SPOTS
		 */
		logger.debug(`Waiting for availability to load: "app-list-view"`);
		await this.page.waitForSelector("app-list-view");

		// Wait for 3 seconds before all the availability spots are shown. Better idea may be to wait for all the elements to have the opacity of 1.
		await this.page.waitForTimeout(3000);
		const availabilitySelector = "mat-panel-description fa-icon.icon-available";
		const availableIds = await this.page.$$eval(availabilitySelector, (avs) =>
			avs.map((a) => {
				return {
					id: a.parentElement?.id as string,
					name: a.parentElement?.previousSibling?.textContent?.trim() as string,
				};
			})
		);

		logger.info(`Found ${availableIds.length}`);

		const screenshot = path.join(outDir, "result.png");

		await this.page.screenshot({ path: screenshot, fullPage: true });

		return {
			runId: this.runId,
			crawlId: crawlId,
			url: this.page.url(),
			screenshot: screenshot,
			results: availableIds,
			runTimestamp: this.runTimestamp,
			...jobSpec,
		};
	}

	private async waitAndClickWithText(
		selector: string,
		text: string,
		outDir: string
	): Promise<void> {
		await this.page.screenshot({
			path: path.join(
				outDir,
				`${this.i.toString().padStart(4, "0")}.${selector}.pre.png`
			),
			fullPage: true,
		});

		try {
			logger.debug('Waiting for %s with text "%s"', selector, text);

			const elem = await this.page.waitForFunction(
				(sel: string, txt: string) => {
					return Array.from(document.querySelectorAll(sel)).filter(
						(el) => el.textContent?.trim() === txt
					)[0];
				},
				{ timeout: 60000 },
				selector,
				text
			);

			logger.debug("Clicking %s with text %s", selector, text);
			await elem.asElement()?.click();

			await this.page.screenshot({
				path: path.join(
					outDir,
					`${this.i.toString().padStart(4, "0")}.${selector}.post.png`
				),
				fullPage: true,
			});
		} catch (e) {
			await this.page.screenshot({
				path: path.join(outDir, "error.png"),
				fullPage: true,
			});
			logger.error(`Error reading selector ${selector}: `, e);
			throw e;
		} finally {
			this.i++;
		}
	}

	private async waitAndClick(selector: string, outDir: string): Promise<void> {
		await this.page.screenshot({
			path: path.join(
				outDir,
				`${this.i.toString().padStart(4, "0")}.${selector}.pre.png`
			),
			fullPage: true,
		});

		try {
			logger.debug(`Waiting for %s`, selector);
			await this.page.waitForSelector(selector, {
				visible: true,
				timeout: 900000,
			});

			logger.debug(`Picking ${selector}`);
			await this.page.click(selector);
			await this.page.screenshot({
				path: path.join(
					outDir,
					`${this.i.toString().padStart(4, "0")}.${selector}.post.png`
				),
				fullPage: true,
			});
		} catch (e) {
			await this.page.screenshot({
				path: path.join(outDir, "error.png"),
				fullPage: true,
			});
			logger.error(`Error reading selector ${selector}: `, e);
			throw e;
		} finally {
			this.i++;
		}
	}

	private async waitAndEnter(
		selector: string,
		value: string,
		outDir: string
	): Promise<void> {
		await this.waitAndClick(selector, outDir);
		await this.page.keyboard.type(value);
	}
}

export { PageCrawler as Crawler };
