---
draft: true
categories:
- services
description: Some notes on Google Cloud Platform
date: 2018-04-07T00:00:00Z
tags:
- cloud
- gcp
- golang
title: GCP notes
url: gcp-notes/
---

# CLI

## Interactive shell

https://cloudplatform.googleblog.com/2018/03/introducing-GCPs-new-interactive-CLI.html

# Authentication

## Local environment

`gcloud init`

## Server outside GCP



# Pubsub

## Batching

`MaxOutstandingMessages` set to 1000 by default.

## Duplicates

Pubsub ensure at least once delivery. In backfilling scenario, it seems that the duplicate rate (i.e. pubsub payloads having the exact same id) *seems* to increase

## Notifications

not bound to the topic i.e. destroying the topic will not remove the notification; so when recreating the notification on the same topic (name) will lead to all notifications being duplicated

### Avoiding false positive

The go `storage` client does *not* write any bytes for a new object unless `Writer.Close` is called. This is a very nice design as e.g. when writing a gzip file in a buffered way, one simply has to check `GzipWriter.Close` then `BufWriter.Close` etc.

## Kubernetes

Default ACLs do *not* provide access to pubsub so one has to explicitely enable pubsub when creating a cluster that requires to use the message queue.

## Timeouts

By default a client has 10s to process a message (in a way to maximize the throughput). This limit can be extended up to 10min by configuration the subscription
FIXME: see https://github.com/algolia/analytics-go/pull/202

### Ack/Nack latency

+ ack/nack are batched every 100ms => so this adds some latency


### Extending above 10min with the go client

# GCS

## Content encoding

When setting the `Content-Encoding` metadata header, the client (be it the CLI or e.g. golang [storage](https://godoc.org/cloud.google.com/go/storage)) will uncompress the data if it has the `gzip` value. To *not* use this behavior one should use `ReadCompressed(false)`


# References

* [A vim Tutorial and Primer](https://danielmiessler.com/study/vim/)
* [“What is your most productive shortcut with vim”](http://stackoverflow.com/questions/1218390/what-is-your-most-productive-shortcut-with-vim)
