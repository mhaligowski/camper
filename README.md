# Camper 🏕️  function

## Remarks

## Makefile

* run (default): run the crawl for Lake Chelan July 1 - July 5.
* dist: runs webpack on `function.ts` to generate a deployable package for Google Cloud Functions
* deploy: deploys the `dist` folder on Google Cloud Functions
* `show.scheduler`:  shows the details of the Google Scheduler job
* `show.config`: shows the current configuration of the

## TODO
### Modify the configuration to add/remove emails
Define config object for receiving the configuration. Fields needed:
* target email
* job definition

### Writing to GCS
Write screenshot in GCS for preview

### Generate new configuration from CLI
Get questions from inquirer, generate JSON for sending
### Improve CLI to manage the configuration of the scheduler functions

