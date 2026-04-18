
REPO_ROOT := $(shell git rev-parse --show-toplevel)
BUILD_DIR := ${REPO_ROOT}/docs


.PHONY: clean
clean:
	rm -fr ${BUILD_DIR}


.PHONY: cname
cname:
	mkdir ${BUILD_DIR}
	echo "marc.helbling.fr" >${BUILD_DIR}/CNAME

.PHONY: theme
theme:
	git submodule update --init

.PHONY: generate
generate: clean cname theme build-words build-phonemes
	cd ${REPO_ROOT}
	hugo --theme malt --destination ${BUILD_DIR}


.PHONY: local
local: theme build-words build-phonemes
	cd ${REPO_ROOT}
	hugo server --disableFastRender -D watch


.PHONY: build-words
build-words:
	cd ${REPO_ROOT}/apps/words && npm install && npm run build-all

.PHONY: test-words
test-words:
	cd ${REPO_ROOT}/apps/words && npm install && npm test

.PHONY: words-audio
words-audio:
	${REPO_ROOT}/apps/words/scripts/generate_audio.py

.PHONY: build-phonemes
build-phonemes:
	cd ${REPO_ROOT}/apps/phonemes && npm install && npm run build-all

.PHONY: test-phonemes
test-phonemes:
	cd ${REPO_ROOT}/apps/phonemes && npm install && npm test

.PHONY: phonemes-audio
phonemes-audio:
	${REPO_ROOT}/apps/phonemes/scripts/generate_audio.py

.PHONY: deploy
deploy: generate
	git add ${BUILD_DIR} && git commit -m "make generate"
	git push origin master
