NPX=npx

run: out
	$(NPX) node -r ts-node/register -r dotenv/config ./src/cli.ts

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

test:
	$(NPX) jest

PHONY: clean run deploy test