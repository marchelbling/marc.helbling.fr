---
layout: post
title: What could go wrong?
category: experience
tags: [tools, code, devops]
description: An ongoing list of real-life software “failures”
---

When dealing with software, stuff quite inexorably go wrong at some point. Here is a ‘memo’ list
of shit that I saw happen.


## Bash

* Use [shellcheck](http://www.shellcheck.net/).
* user rights and privileges are well known; however, in a rush (or not) it is very easy to forget this and
  perform some server changes while being logged as `root` that will break part of a service (typically runned as `www-data`).
  Never log as `root`.
* when processing unknown inputs in bash, you always end up with a filename containing
  a space. Or worse. When manipulating a path or a string variable in bash, *always* use double
  quotes unless you’re 100% sure it will always work correctly.
* there is no exception mechanism in bash. Every command or function has a [return
  status](http://tldp.org/LDP/abs/html/exit-status.html) telling if it was successful (`0`) or not (`>0`).  *Every* command. It is very easy to forget to test an important status code e.g. with some piped commands. Bash has a special flag to prevent silent failures: [`set -e`](http://www.gnu.org/software/bash/manual/bashref.html#The-Set-Builtin), which may be used either globally (e.g. by using `#!/bin/bash -e` shebang) or on a specific bloc of code i.e.

```bash

set -e
command0 | command 1
command2
set +e
```

* bash script often involve filesystem; even though the kernel only handles bytes, it may easily be
  overlooked that the [locale](http://en.wikipedia.org/wiki/Locale) may have an impact on file
  manipulations; e.g. 7z uses the locale when handling archives.


## C++

* some STL functions require the definition of a [strict weak ordering](https://www.sgi.com/tech/stl/StrictWeakOrdering.html) which means that `x op y` and `y op x` can not be true at the same time (especially `x op x` must be false). As the function signature does not impose anything more than taking two instances and returning a boolean, there is no way the compiler could detect that the function is not properly defined.
* when using pointer wrappers, make sure you actually test the pointer value rather than the
  wrapper.


## Python

* everything is an object in Python. Even if small [integer
  values](https://docs.python.org/2/c-api/int.html)  like 0 or
  1 will usually return the same object, this is [implementation](http://www.laurentluce.com/posts/python-integer-objects-implementation/)
  dependant. Do *not* use `is` to test equalityf or not singleton objects, always use `==`.


## Floats

* mathematical functions have a domain of definition; e.g. the C++
  [`std::acos`](http://www.cplusplus.com/reference/cmath/acos/) function will return
  `NaN` outside [-1; 1]. Make sure you know this and you control values sent to those functions.
* depending on serialization format, exceptional values like `NaN` and `±inf` may not be supported.
* [floats](https://randomascii.wordpress.com/category/floating-point/) repartition is irregular
  (and, in spite of IEEE-754, numerical behaviors may depend a *lot* on your
  [platform](https://randomascii.wordpress.com/2013/07/16/floating-point-determinism/))
  and if you don’t take that into account, except unexpected behaviors.


## Failures & exceptions

* when bootstraping a project, it’s tempting to think that it should not crash to give an *impression*
  of robustness to early users. This is probably ok for early development but will soon enough mask
  bugs. Don’t “catch all exceptions” everywhere, let the [code crash](https://mazenharake.wordpress.com/2009/09/14/let-it-crash-the-right-way/),
  monitor and then fix.


## Development environment

* not using a common environment locally and in production may cause undetected bugs e.g. the setup
  uses some bash script with non-POSIX commands, either the command themselves or some options might
  slightly change between two distinct environments. Use a [VM](https://www.vagrantup.com/) or a
  [container](http://docker.com/) to make sure there are no discrepancies between your environments.
* when developing new features, we often purely rely on a local setup. This is fine however it will
  mask lots of ‘real usage’ issues. For example, uploading a file locally will likely be instantaneous
  but will take much longer on a distant server. Not considering this could lead to unusable code
  (e.g. synchronous upload that could freeze the whole system). Make sure to test features with a real
  setup early enough.
* lots of products somehow rely on files. You should know your filesystem. NFS typically needs to be
  fine [configured](https://wiki.archlinux.org/index.php/NFS/Troubleshooting#Close-to-open.2Fflush-on-close)
  depending on your usage requirements.



## Security & credentials

* as most staff members will have extra privileges, there are a good target for account hijacking.
  You must enforce strong password/authentication policy for staff members, be it on your service
  or external services like code hosting.
* when dealing with people’s money, be very careful. Double check & test everything. Implement a
  refund system soon enough to prevent angry users to spread a bad reputation for your service.
* when handling sensitive data such as a token or payment information, make sure to never log
  messages with the data in plain text. It is easy to overlook logs and have a security hole.
* when implementing a token based API, be very careful when you communicate about it. It is very
  easy to let your token unencrypted in some slides or video leaving everyone able to use your
  identity easily. And as staff members usually have extra privileges, this could be a big security
  issue.


# Data

* never trust user data:
    * safely decode encoding
    * escape data
* never trust “external” data:
    * data may be partly missing
    * data may be malformed
* if your product rely on a custom data format, this format will very likely evolve in time.
  By the time you make the format evolve, you will either have to be able to reprocess old data or
  otherwise increase the legacy burden.
  Think about being [future-proof](http://www.onebigfluke.com/2015/05/the-importance-of-future-proofing.html) early.

# Team

* http://blog.jessitron.com/2015/05/fitting-in-v-belonging.html
