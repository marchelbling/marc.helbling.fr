.PHONY: build clean serve

mkfile_path := $(abspath $(lastword $(MAKEFILE_LIST)))
mkfile_dir := $(dir $(mkfile_path))
src_dir := $(mkfile_dir)
build_dir := $(mkfile_dir)public/
theme_dir=$(src_dir)themes/malt

clone-theme:
	if [ ! -d $(theme_dir) ]; then git clone git@github.com:marchelbling/malt $(theme_dir); fi

update-theme: clone-theme
	cd $(theme_dir) && git diff-index --quiet --exit-code HEAD && git fetch origin && git reset --hard @{u}

clone-content:
	if [ ! -d $(build_dir) ]; then git clone git@github.com:marchelbling/marchelbling.github.io $(build_dir); fi

update-content: clone-content
	cd $(build_dir) && git fetch origin && git reset --hard @{u}

clean:
	rm -fr $(build_dir)*

generate: update-theme update-content
	cd $(src_dir)
	hugo -t malt
	cp $(src_dir)CNAME $(build_dir)

local: update-theme
	cd $(src_dir)
	hugo server --disableFastRender -D watch

push:
	cd $(build_dir) && git add . && git commit -m "Update site build" && git push origin master

deploy: clean build generate push
