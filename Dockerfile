FROM alpine:latest
MAINTAINER Marc Helbling <marc@helbling.fr>

ENV HUGO_VERSION=0.31.1
ENV HUGO_ARCHIVE=hugo_${HUGO_VERSION}_Linux-64bit.tar.gz

RUN apk update \
 && apk add ca-certificates wget openssl \
 && wget https://github.com/gohugoio/hugo/releases/download/v${HUGO_VERSION}/${HUGO_ARCHIVE} -P /tmp \
 && tar -xf /tmp/${HUGO_ARCHIVE} -C /tmp \
 && mv /tmp/hugo /usr/local/bin/hugo \
 && rm -rf /tmp/hugo_${HUGO_VERSION}*

EXPOSE 1313
