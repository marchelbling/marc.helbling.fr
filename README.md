Well, *MAYBE* you should read this later...

# Running locally

See https://help.github.com/articles/using-jekyll-with-pages/:

* `(gem list | grep bundler >/dev/null) || gem install bundler`
* `bundle exec jekyll serve`
* http://localhost:4000

# Adding side/margin notes

To not require a local build, those elements require some HTML tags:

*  side note (numbered): `<label for="sn-id" class="margin-toggle sidenote-number"></label><input type="checkbox" id="sn-id" class="margin-toggle"><span class="sidenote">blabla</span>`
* margin note (not numbered): `/<label for="mn-id" class="margin-toggle"></label><input type="checkbox" id="mn-id" class="margin-toggle"/><span class="marginnote">blabla</span>`
