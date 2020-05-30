import { Page } from "puppeteer";
import path from "path";
import { format } from "util";

import { getLogger } from "./log";
import { getCoords } from "./datepick";

const logger = getLogger();

type ResultLine = {
  id: string; // value of HTML id attribute
  name: string;
};
export type PageCrawlResult = {
  url: string; // final URL
  screenshot: string; // path of the resulting image
  results: ResultLine[];
};

class PageCrawler {
  i = 0;

  page: Page;
  outDir: string;

  constructor(page: Page, outDir = "out") {
    this.page = page;
    this.outDir = outDir;
  }

  async crawl(): Promise<PageCrawlResult> {
    const jobSpec = {
      arrivalDate: new Date("July 1, 2020"),
      departureDate: new Date("Juli 5, 2020"),
      parkName: "Lake Chelan State Park",
    };

    /**
     * PARK SELECTION
     */
    await this.waitAndClick("mat-select[formcontrolname=park]");
    await this.waitAndClickWithText("mat-option", jobSpec.parkName);

    /**
     * ARRIVAL DATE
     */
    const arrivalCoords = getCoords(jobSpec.arrivalDate);
    logger.info("Picking for coords: %j", arrivalCoords);

    await this.waitAndClick("input[formcontrolname=arrivalDate]");
    await this.waitAndClick("button#monthDropdownPicker");
    await this.waitAndClick(
      format(
        "mat-year-view tr:nth-child(%d) :nth-child(%d)",
        arrivalCoords.month.row + 1,
        arrivalCoords.month.col + 1
      )
    );
    await this.waitAndClick(
      format(
        "mat-month-view tbody tr:nth-child(%d) :nth-child(%d)",
        arrivalCoords.day.row + 1,
        arrivalCoords.day.col + 1
      )
    );

    /**
     * DEPARTURE DATE
     */
    const departureCoords = getCoords(new Date(jobSpec.departureDate));
    logger.info("Picking for coords: %j", departureCoords);

    await this.waitAndClick("input[formcontrolname=departureDate]");
    await this.waitAndClick("button#monthDropdownPicker");
    await this.waitAndClick(
      format(
        "mat-year-view tr:nth-child(%d) :nth-child(%d)",
        departureCoords.month.row + 1,
        departureCoords.month.col + 1
      )
    );
    await this.waitAndClick(
      format(
        "mat-month-view tbody tr:nth-child(%d) :nth-child(%d)",
        departureCoords.day.row + 1,
        departureCoords.day.col + 1
      )
    );

    /**
     * COVID-19
     */
    try {
      await this.waitAndClick(
        "mat-checkbox#acknowledgement .mat-checkbox-inner-container"
      );
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
    await this.waitAndClick(
      "mat-button-toggle-group.btn-search-results-toggle mat-button-toggle:nth-child(2)"
    );

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
    const availabilitySelector =
      "div.resource-availability fa-icon.icon-available";
    const availableIds: ResultLine[] = await this.page.$$eval(
      availabilitySelector,
      (avs) =>
        avs.map((a) => {
          return {
            id: a.parentElement?.id as string,
            name: a.previousSibling?.textContent?.trim() as string,
          };
        })
    );
    logger.info(`Found ${availableIds.length}: ${availableIds}`);

    const screenshot = path.join(this.outDir, "result.png");

    await this.page.screenshot({ path: screenshot, fullPage: true });

    const result: PageCrawlResult = {
      url: this.page.url(),
      screenshot: screenshot,
      results: availableIds,
    };

    return result;
  }

  private async waitAndClickWithText(
    selector: string,
    text: string
  ): Promise<void> {
    await this.page.screenshot({
      path: path.join(
        this.outDir,
        `${this.i.toString().padStart(4, "0")}.${selector}.pre.png`
      ),
      fullPage: true,
    });

    try {
      logger.info("Waiting for %s with text %s", selector, text);
      const element = await this.page.waitForFunction(
        (sel) =>
          Array.from(document.querySelectorAll(sel)).filter(
            (el) => el.textContent?.trim() == text
          ),
        { timeout: 60000 },
        selector
      );

      logger.info(`Clicking ${selector} with text`);

      await element.asElement()?.click();
      await this.page.screenshot({
        path: path.join(
          this.outDir,
          `${this.i.toString().padStart(4, "0")}.${selector}.post.png`
        ),
        fullPage: true,
      });
    } catch (e) {
      await this.page.screenshot({
        path: path.join(this.outDir, "error.png"),
        fullPage: true,
      });
      logger.error(`Error reading selector ${selector}: `, e);
      throw e;
    } finally {
      this.i++;
    }
  }

  private async waitAndClick(selector: string): Promise<void> {
    await this.page.screenshot({
      path: path.join(
        this.outDir,
        `${this.i.toString().padStart(4, "0")}.${selector}.pre.png`
      ),
      fullPage: true,
    });

    try {
      logger.info(`Waiting for %s`, selector);
      await this.page.waitFor(selector, { visible: true, timeout: 60000 });

      logger.info(`Picking ${selector}`);
      await this.page.click(selector);
      await this.page.screenshot({
        path: path.join(
          this.outDir,
          `${this.i.toString().padStart(4, "0")}.${selector}.post.png`
        ),
        fullPage: true,
      });
    } catch (e) {
      await this.page.screenshot({
        path: path.join(this.outDir, "error.png"),
        fullPage: true,
      });
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
}

export { PageCrawler as Crawler };
