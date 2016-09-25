---
layout: post
title: Migrating from bash to python
category: code
tags: [script, python]
description: 
---

# Why bash?

very good glue
pervasive (still relevant in a docker world)
lots of tools

# Why moving away from bash?

do you write `cat toto | grep tata`
or `if [ "$( grep tata toto | wc -l )" ]; ...`

well, you probably don’t know how to bash or your colleague doesn’t

defensive bash programming is difficult (e.g. failure in a pipe, global variable leaking)


# Evolution of our stack

C++/Python/Bash => C++/Python(/Bash)
plotting evolution of line counts in bash/python


# Difficulties

Bash return value vs output result
Global vs local
Unicode

# Steps

Quote joel on software

Mostly standard practice when rewriting large code base:
Rewrite legacy code in an 'appropriate' way:

1. write some tests (testing 3D is hard but still there are things you can test)
2. split legacy code into functions
3. use local variables wherever possible
4. move code part after part 
5. drop legacy ftw!

# Rewrite steps

1. you'll be happy that argparse is nicer than bash option parsed by hand
2. use subprocess
3. use NamedTuple to not
* leak/introduce undesire  `env` variables
* control when any variable should be updated
4. replace return values with exceptions


# Last but not least: Unicode!


# Monitor

monitoring + way to reproduce the issue easily

# Links

* [A bite of Python](https://access.redhat.com/blogs/766093/posts/2592591): some security notes on the `subprocess` library
