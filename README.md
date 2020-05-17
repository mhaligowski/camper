# Camper 🏕️ function

## Remarks

* Runs on Puppeteer 2 instead of 3. Puppeteer 3 requieres libgbm, so the Chromium execution fails.

## Makefile

* run (default): run the crawl for Lake Chelan July 1 - July 5.
* dist: runs webpack on `function.ts` to generate a deployable package for Google Cloud Functions
* deploy: deploys the `dist` folder on Google Cloud Functions