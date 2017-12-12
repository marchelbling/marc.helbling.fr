.PHONY: build clean serve

mkfile_path := $(abspath $(lastword $(MAKEFILE_LIST)))
mkfile_dir := $(dir $(mkfile_path))
src_dir := $(mkfile_dir)
build_dir := $(mkfile_dir)/public

build:
	docker build -t marchelbling/hugo .
	if [ ! -d $(src_dir)/themes/malt ]; then git clone git@github.com:marchelbling/malt $(src_dir)/themes/; fi
	if [ ! -d $(build_dir) ]; then git clone git@github.com:marchelbling/marchelbling.github.io $(build_dir); fi

clean:
	rm -fr docs/

generate:
	docker run --user=$(shell id -u):$(shell id -g) -v $(mkfile_dir):$(mkfile_dir) -it marchelbling/hugo sh -c "cd $(src_dir) && hugo -t malt"
	cp $(src_dir)/CNAME $(build_dir)

serve:
	docker run --user=$(shell id -u):$(shell id -g) -v $(mkfile_dir):$(mkfile_dir) --net=host -it marchelbling/hugo sh -c "cd $(src_dir) && hugo server -D watch"

push:
	cd $(build_dir) && git add . && git commit -m "Update site build" && git push origin master

deploy: generate push
