PROJECT=camper
NPX=npx
GCLOUD_BIN=gcloud
GCLOUD_FLAGS=--project=$(PROJECT) --format=json
GCLOUD=$(GCLOUD_BIN) $(GCLOUD_FLAGS)
JQ=jq -r

run: out
	$(NPX) node -r ts-node/register -r dotenv/config ./src/cli.ts

out:
	mkdir $@

clean:
	rm -rf {out,dist}

dist: ./config/webpack.config.js
	npx webpack --mode=development --config=$^

deploy: dist
	$(GCLOUD) functions deploy crawl \
		--source=$^ \
		--runtime=nodejs10 \
		--trigger-topic=trigger

SCHEDULER_JOB=every-1-hour
show.scheduler:
	$(GCLOUD) scheduler jobs describe $(SCHEDULER_JOB)

show.config:
	$(GCLOUD) scheduler jobs describe $(SCHEDULER_JOB) \
		| $(JQ) '.pubsubTarget.data' \
		| base64 -d

test:
	$(NPX) jest



PHONY: clean run deploy test
