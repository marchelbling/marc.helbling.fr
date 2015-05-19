---
layout: post
title: What could go wrong?
category: experience
tags: [code, devops, people]
description: An ongoing list of real-life software “failures”
---

When dealing with software, stuff — be it <a href="#code">technical</a> or <a href="#management">human</a> —
quite inexorably go wrong at some point. Here is a ‘memo’ list of shit that I lived or witnessed and hopefully ways to prevent them.
Some points might look totally obvious but as I experienced them at least once they are probably worth listing.


## Code

> Explicit is better than implicit
>
> <cite>[The Zen of Python](https://www.python.org/doc/humor/#the-zen-of-python)</cite>

### Bash

* Use [shellcheck](http://www.shellcheck.net/).
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


### C++

* some STL functions require the definition of a [strict weak ordering](https://www.sgi.com/tech/stl/StrictWeakOrdering.html) which means that `x op y` and `y op x` can not be true at the same time (especially `x op x` must be false). As the function signature does not impose anything more than taking two instances and returning a boolean, there is no way the compiler could detect that the function is not properly defined.
* when using pointer wrappers, make sure you actually test the pointer value rather than the
  wrapper.


### Data

* never trust user data:
    * safely decode incoming text (you *will* have non-UTF8 encodings somewhere so you *have to*
      [understand](http://www.joelonsoftware.com/articles/Unicode.html) [encodings](http://www.tbray.org/ongoing/When/200x/2003/04/26/UTF))
    * escape data (you will face [code injection](https://www.owasp.org/index.php/Code_Injection) at some point)
* never trust “external” data:
    * data may be partly missing
    * data may be malformed

    so make sure to clean it before using it.
* if your product rely on a custom data format, this format will very likely evolve with time.
  By the time you make the format change, you will either have to be able to reprocess old data or
  otherwise increase the legacy burden.
  Think about being [future-proof](http://www.onebigfluke.com/2015/05/the-importance-of-future-proofing.html) early.


### Development environment

* user rights and privileges are well known; however, in a rush (or not) it is very easy to forget this and
  perform some server changes while being logged as `root` that will break part of a service (typically runned as `www-data`).
  Never log as `root`.
* not using a common environment locally and in production may cause undetected bugs e.g. the setup
  uses some bash script with non-POSIX commands, either the command themselves or some options might
  slightly change between two distinct environments. Use a [VM](https://www.vagrantup.com/) or a
  [container](http://docker.com/) to make sure there are no discrepancies between your environments.
* when developing new features, we often purely rely on a local setup. This is fine however it will
  mask lots of ‘real usage’ issues. For example, uploading a file locally will likely be instantaneous
  but will take much longer on a distant server. Not considering this could lead to unusable code
  (e.g. synchronous upload that could freeze the whole system). Make sure to test features with a real
  setup early enough.
* a lot of products somehow rely on files. You should know your filesystem. NFS typically needs to be
  fine [configured](https://wiki.archlinux.org/index.php/NFS/Troubleshooting#Close-to-open.2Fflush-on-close)
  depending on your usage requirements.


### Failures & exceptions

* when bootstrapping a project, it’s tempting to think that it should not crash to give an *impression*
  of robustness to early users. This is probably ok for early development but will soon enough mask
  bugs. Don’t “catch all exceptions” everywhere, let the [code crash](https://mazenharake.wordpress.com/2009/09/14/let-it-crash-the-right-way/),
  monitor, understand the real issues and then fix.


### Floats

* mathematical functions have a domain of definition; e.g. the C++
  [`std::acos`](http://www.cplusplus.com/reference/cmath/acos/) function will return
  `NaN` outside [-1; 1]. Make sure you know this and you control values sent to those functions.
* depending on serialization format, exceptional values like `NaN` and `±inf` may not be
  [supported](http://mrchlblng.me/2015/02/writing-json-c++/).
* [floats](https://randomascii.wordpress.com/category/floating-point/) repartition is irregular
  (and, in spite of IEEE-754, numerical behaviors may depend a *lot* on your
  [platform](https://randomascii.wordpress.com/2013/07/16/floating-point-determinism/))
  and if you don’t take that into account, expect unexpected behaviors.


### Python

* everything is an object in Python. Even if small [integer values](https://docs.python.org/2/c-api/int.html)  like 0 or
  1 will usually return the same object, this is [implementation](http://www.laurentluce.com/posts/python-integer-objects-implementation/)
  dependant. Do *not* use `is` to test equality if objects are not singleton, always use `==`.
* Python is a dynamic language but people often forget that it is
  [compiled](http://late.am/post/2012/03/26/exploring-python-code-objects.html) and not re-evaluated
  at each call. [Functions](http://intermediatepythonista.com/the-function) are first class citizens
  and default values are stored in the [`func_default`](http://effbot.org/zone/default-values.htm)
  tuple attribute. This is probably one of the most common
  [gotcha](http://docs.python-guide.org/en/latest/writing/gotchas/#mutable-default-arguments) but
  using a *mutable* object there (e.g. a `list` or a `dict`) will probably cause unexpected results.
  Typically use `None` and assign the desired default value in the function body.


### Security & credentials

* as most staff members will have extra privileges, there are a good target for account hijacking.
  You must enforce strong password/authentication policy for staff members, be it on your service
  or external services like code hosting.
* when dealing with people’s money, be very careful. Double check & test everything. Implement a
  refund system soon enough to prevent angry users to spread a bad reputation about your service.
* when handling sensitive data such as a token or payment information, make sure to never log
  messages with the data in plain text. It is easy to overlook logs and have a security hole.
* when implementing a token based API, be very careful when you communicate about it. It is very
  easy to let your token unencrypted in some slides or video leaving everyone able to use your
  identity easily. And as staff members usually have extra privileges, this could be a big security
  issue.


## Management

> What goes well without saying, goes even better when you say it.
>
> <cite>[Charles-Maurice
> Talleyrand](http://en.wikipedia.org/wiki/Charles_Maurice_de_Talleyrand-P%C3%A9rigord)</cite>


### Project

* when refactoring or rewriting code, do not change every part of the system at once
    * chances are high that you will loose focus, e.g. to fix some production bugs or another
      priority will pop up or even you will take some vacations; by loosing focus you will likely
      ship bad code
    * putting large changes in production can be more difficult hence it could very well delay the
      new code going live
    * if things go wrong, you will likely have a harder time finding the root cause of evil

    Keeping some legacy code that works during a refactoring does not increase the [technical
  debt](http://bigeng.io/post/118399425343/why-the-way-we-look-at-technical-debt-is-wrong); it just
  allows you to ship code in production more quickly and safely.
* never think of [crunch mode](http://chadfowler.com/blog/2014/01/22/the-crunch-mode-antipattern/) as
  a good option. Split important projects in small deliverable steps; if you fail to do so, you are
  the captain of a ship that is drifting. Ensure people stay focused
  on their targets. Eventually consider pressuring the staff to meet the deadline or move the deadline. If you
  ask more with less from your staff, compensate them in some way. This will make everyone know that
  crunch mode is not something considered normal in your company.
* if people complain a lot on the tools or processes (or the lack of it), search for solutions.
  Being [agile](http://blog.toolshed.com/2015/05/the-failure-of-agile.html) is about being able to
  adapt and make everyone in the company, from developers to product managers, work efficiently
  together. Simplify tool chains. [Educate](http://mrchlblng.me/2014/09/practical-git-introduction/)
  people about their tools. Automate tasks. Write [hooks](https://gist.github.com/mrchlblng/7358077).
  Make people happy with their work environment.


### Team

* [trust](https://thinkmarkets.wordpress.com/2009/02/08/on-confidence-andor-trust/).
  A manager should trust her subordinates to produce quality work. Subordinates should trust their
  manager will help everyone give her best. Trust is a bilateral relation that should produce code
  that is controlled (typically by a test suite and [code reviews](http://kevinlondon.com/2015/05/05/code-review-best-practices.html))
  to make everyone confident with it.
* [care](http://boz.com/articles/be-kind.html). Listen to your staff and co-workers.
  If you want people to give their best, you need to know and detect if something looks wrong. Do
  *not* force people to speak but give them real opportunities to do so.
* treat with equality what you consider boring and interesting subjects. Every business has some
  shitty tasks that need to be done. If you overlook or neglect those, people that perform them will
  eventually feel demotivated.
* make people feel *responsible* for their code. [“Eat your own dog
  food”](http://en.wikipedia.org/wiki/Eating_your_own_dog_food) and let people search
  production logs & metrics to follow the impact of their changes and make sure that they have not
  broken unexpected things. Knowing that they have an impact on the product will likely make people
  more involved and as a side effect make them more careful about code they and others write.
* people’s performance is actually often dictated by their [boss
  management](http://www.insead.edu/facultyresearch/research/doc.cfm?did=46698). If you are a manager
  and have difficulties with one or more subordinates do not simply blame them. You are also failing.
  Either you failed recruiting the right person or (more likely) are failing at helping people
  meet what you expect from them:
   * listen to feedback
   * be analytical to find what is not working (possibly ask for an external opinion to make sure
     you are not biaised in your analysis)
   * make sure people understand your expectations and their mission
   * communicate as clearly as possible
* beware of the team culture. Joking (aka trolling) about everything gives the impression that nothing
  really matters and will make people less willing to share ideas or ask for help. Team cohesion is
  very important and you need to make people feel like they [belong rather than just fit](http://blog.jessitron.com/2015/05/fitting-in-v-belonging.html).
