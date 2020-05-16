run: out
	npx ts-node ./src/run.ts

out:
	mkdir $@

clean:
	rm -rf out

PHONY: clean run