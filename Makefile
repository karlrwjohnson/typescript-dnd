.RECIPEPREFIX=' '

.PHONY: build clean
build:
	browserify src/index.ts --plugin=tsify --debug > bundle.js

clean:
	rm -f bundle.js
	find src -name '*.js' -exec rm '{}' ';'
	find src -name '*.js.map' -exec rm '{}' ';'
