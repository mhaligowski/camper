run: out
	npx ts-node ./src/index.ts

out:
	mkdir $@

clean:
	rm -rf out

PHONY: clean run