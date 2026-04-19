REPO_ROOT := $(shell git rev-parse --show-toplevel)
BUILD_DIR := ${REPO_ROOT}/docs


.PHONY: clean
clean:
	rm -fr ${BUILD_DIR}


.PHONY: cname
cname:
	mkdir -p ${BUILD_DIR}
	echo "marc.helbling.fr" >${BUILD_DIR}/CNAME

.PHONY: theme
theme:
	git submodule update --init

.PHONY: generate
generate: clean cname theme
	cd ${REPO_ROOT}
	hugo --theme malt --destination ${BUILD_DIR}


.PHONY: local
local: theme
	cd ${REPO_ROOT}
	hugo server --disableFastRender -D watch
