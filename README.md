# marc.helbling.fr

Static site built with [Hugo](https://gohugo.io). Current theme is: [malt](https://github.com/marchelbling/malt).

## Requirements

* hugo (v0.160.1)
* make
* `git submodule update --init` (or `make theme`)

## Running locally

```
$ make local
```

## Building content

```
$ make generate
```

## Deployment

Deployment to GitHub Pages is automated via GitHub Actions on every push to `main`.
