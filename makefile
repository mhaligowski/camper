run: out
	npx node -r ts-node/register -r dotenv/config ./src/run.ts

out:
	mkdir $@

clean:
	rm -rf {out,dist}

dist: ./config/webpack.config.js
	npx webpack --mode=development --config=$^

deploy: dist
	gcloud functions deploy crawl \
		--source=$^ \
		--runtime=nodejs10 \
		--trigger-topic=trigger

PHONY: clean run