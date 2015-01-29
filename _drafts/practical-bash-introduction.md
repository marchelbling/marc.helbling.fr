---
layout: post
title: A practical introduction to bash
category: tools
tags: [script, shell]
description: 
---


# Introduction

## terminal vs console vs shell

[This](http://superuser.com/questions/144666/what-is-the-difference-between-shell-console-and-terminal) [is](http://superuser.com/questions/231005/terminal-vs-shell) [very](http://superuser.com/questions/231005/terminal-vs-shell) [confusing](http://askubuntu.com/questions/506510/what-is-the-difference-between-terminal-console-shell-and-command-line) [at](http://unix.stackexchange.com/questions/33881/what-is-the-difference-between-a-console-shell-terminal-terminal-emulator-te) [first](http://stackoverflow.com/questions/21014344/terminal-or-console-or-shell-or-command-prompt). But it should not.

A terminal is a hardware device providing input/display data. A terminal emulator (or tty) emulates a video terminal in a windowing system.

A console runs a terminal that specifically inputs from a keyboard and outputs to a monitor, everything being *local* and attached to the computer.

A shell is a command line interpreter i.e. a computer program relaying on a terminal for user interaction.

## sh == bash?

http://stackoverflow.com/questions/5725296/difference-between-sh-and-bash

## POSIX

http://stackoverflow.com/questions/1780599/i-never-really-understood-what-is-posix

POSIX is a family of standards, specified by the IEEE, to clarify and make uniform the application programming interfaces (and ancillary issues, such as commandline shell utilities) provided by Unix-y operating systems. When you write your programs to rely on POSIX standards, you can be pretty sure to be able to port them easily among a large family of Unix derivatives (including Linux, but not limited to it!); if and when you use some Linux API that’s not standardized as part of Posix, you will have a harder time if and when you want to port that program or library to other Unix-y systems (e.g., MacOSX) in the future.

## Interactivity vs scripting

Shebang. `$-`.


# Variables

## Definition

## Referencing a value

`$variable` is the same as `${variable}`.

## Default value


## Strings

## Numerics

## Scope

## Arrays

seq start [increment] stop

## Hash

## Weak typing

```bash

$ foo=1
$ echo $(( $foo + 1 ))
2
$ foo="a"
$ echo $(( $foo + 1 ))
1
$ foo=1
$ echo $(( "${foo}" + 1 ))
-bash: "1" + 1 : syntax error: operand expected (error token is ""1" + 1 ")
```

## Special variables

`$0`: name of the script.
`$1 $2`: command line arguments given to the script. `$1` is the first argument, `$2` the second and so on.
`$#`: How many command line arguments were given to the script.
`$*`: All of the command line arguments.
`$-`: is shell interactive or not
`$$`: process id
`$?`: status of the *last* command


# Builtins

* [`alias`](http://ss64.com/bash/alias.html): set/get aliases
* `bind`: bind a key sequence to a Readline function or a macro, or set a Readline variable
* [`builtin`](http://ss64.com/bash/builtin.html): run a shell builtin, passing it args, and return its exit status
* `caller`: returns the context of the current subroutine call
* [`command`](http://ss64.com/bash/command.html): execute a simple command or display information about commands
* [`declare`](http://ss64.com/bash/declare.html): set/get variable values and attributes
* [`echo`](http://ss64.com/bash/echo.html): write to standard output
* [`enable`](http://ss64.com/bash/enable.html): enable/disable shell builtins
* `help`: display help for builtin commands
* [`let`](http://ss64.com/bash/let.html): evaluate arithmetic expressions
* [`local`](http://ss64.com/bash/local.html): define local variables to functions
* [`logout`](http://ss64.com/bash/logout.html): exit shell login
* `mapfile`: read lines from the standard input into an indexed array variable
* [`printf`](http://ss64.com/bash/printf.html): formats and prints arguments following a given format
* [`read`](http://ss64.com/bash/read.html): mark shell variables as unchangeable
* `readarray`: read lines from a file into an array variable
* [`source`](http://ss64.com/bash/source.html) or dot (`.`) operator: source filename
* [`type`](http://ss64.com/bash/type.html): display information about command type
* `typeset`: set variable values and attributes
* [`ulimit`](http://ss64.com/bash/ulimit.html): modify shell resource limits
* [`unalias`](http://ss64.com/bash/alias.html): remove some aliases


# Pipes & Redirects


# Traps


# Debugging

http://www.tldp.org/LDP/Bash-Beginners-Guide/html/Bash-Beginners-Guide.html#sect_02_03

Short notation	Long notation	Result
set -f	set -o noglob	Disable file name generation using metacharacters (globbing).
set -v	set -o verbose	Prints shell input lines as they are read.
set -x	set -o xtrace	Print command traces before executing command.

http://bashdb.sourceforge.net/


# References

* [Bash Reference Manual](http://www.gnu.org/software/bash/manual/bashref.html)
* [Command-line tools can be 235x faster than your Hadoop cluster](http://aadrake.com/command-line-tools-can-be-235x-faster-than-your-hadoop-cluster.html)
* [Pipes and Filters](http://blog.petersobot.com/pipes-and-filters)
* [Defensive BASH Programming](http://www.kfirlavi.com/blog/2012/11/14/defensive-bash-programming/)
* [The Unix Shell’s Humble If ](http://robots.thoughtbot.com/the-unix-shells-humble-if)
* [Shell programming with bash](http://matt.might.net/articles/bash-by-example/)
* [How “Exit Traps” Can Make Your Bash Scripts Way More Robust And Reliable](http://redsymbol.net/articles/bash-exit-traps/)
