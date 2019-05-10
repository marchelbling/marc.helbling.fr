
REPO_ROOT := $(shell git rev-parse --show-toplevel)
BUILD_DIR := ${REPO_ROOT}/docs


.PHONY: clean
clean:
	rm -fr ${BUILD_DIR}


.PHONY: cname
cname:
	mkdir ${BUILD_DIR}
	echo "marc.helbling.fr" >${BUILD_DIR}/CNAME


.PHONY: generate
generate: clean cname
	cd ${REPO_ROOT}
	hugo --theme malt --destination ${BUILD_DIR}


.PHONY: local
local:
	cd ${REPO_ROOT}
	hugo server --disableFastRender -D watch


.PHONY: deploy
deploy: generate
	git add ${BUILD_DIR} && git commit -m "make generate"
	git push origin master
