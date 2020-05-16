run: out
	npx ts-node ./src/run.ts

out:
	mkdir $@

clean:
	rm -rf {out,dist}

build: ./config/webpack.config.js
	npx webpack --mode=development --config=$^

PHONY: clean run