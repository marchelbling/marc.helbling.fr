---
layout: post
title: Python string formatting
category: code
tags: [python, internals]
description: Diving into python formatting syntax and performance
---

Links:
* http://plumberjack.blogspot.co.uk/2010/10/supporting-alternative-formatting.html
* http://stackoverflow.com/questions/5082452/python-string-formatting-vs-format
* http://www.protocolostomy.com/2011/01/02/python-3-informal-string-formatting-performance-comparison/
* https://developers.google.com/edu/python/strings

Formatting strings is one of the most used features in most languages and Python is no exception. Be
it for logging, template generation, database query, string formatting is everywhere!

Python string interpolation comes in 2 flavors:

* “old” syntax: `'%s' % (content,)`; the original format quite inspired by the C `printf` syntax
* “new” syntax: `'{}'.format(content)`; a new flexible syntax introduced in Python 2.6 (see [PEP 3101](https://www.python.org/dev/peps/pep-3101))

The `format` syntax was introduced to prevent “[common errors](https://docs.python.org/3/library/stdtypes.html#printf-style-string-formatting)
such as failing to display tuples and dictionaries correctly”. However both syntaxes work with
python3.

http://pyformat.info/
+ https://mkaz.com/2012/10/10/python-string-format/

This post intends to look at differences and performance of these 2 syntaxes.

## Similarities

* both syntaxes support keyword arguments
    * `'%(foo)s %(bar)s' % {'foo': 'hello', 'bar': 'world'}`
    * `'{foo} {bar}'.format(foo='hello', bar='world')`
* corollary: both syntaxes support reusing arguments
    * `'%(foo)s %(bar)s, %(foo)s' % {'foo': 'hello', 'bar': 'world'}`
    * `'{foo} {bar} {foo}'.format(foo='hello', bar='world')`
* both methods can be used in a functional way:
    * `map('%(foo)s'.__mod__, [{'foo': 'one'}, {'foo': 'two'}, {'foo': 'three'}])`
    * `map('{}'.format, ['one', 'two', 'three'])`

## Differences

* the old syntax requires a single argument so to print a tuple, one must wrap it in another tuple
  i.e. `'%s' % ((1, 2),)`
* the new syntax allows argument reference using indexes i.e. `'{0} {1} {2} {1}'.format(1, 2, 3)`
  (note that one must use consecutive indices with `0` as first index)
* the old syntax is strict regarding the number of arguments passed
    * `'%s %s' % ('foo', 'bar', 'baz')` will raise a `TypeError` exception
    * `'{} {}'.format('foo', 'bar', 'baz')` will print `'foo bar'`, discarding `bar`
* printing `%` requires to type `'%%'` with the old syntax
* printing `{` (resp. `}`) requires to type `'{​{'` (resp. `'}​}'`) with the new syntax
* Mixing Unicode and byte string http://stackoverflow.com/a/12252460/626278
* Decimals http://stackoverflow.com/a/23637584/626278


## Performance


### Instructions

```python

>>> import dis
>>> def old_syntax():
>>>     print '%(float)f %(string)s %(integer)' % {'float':3.14, 'string': 'foo', 'integer': 0}
>>> dis.dis(old_syntax)
  2           0 LOAD_CONST               1 ('%(float)f %(string)s %(integer)d')
              3 BUILD_MAP                3
              6 LOAD_CONST               2 (3.14)
              9 LOAD_CONST               3 ('float')
             12 STORE_MAP           
             13 LOAD_CONST               4 ('foo')
             16 LOAD_CONST               5 ('string')
             19 STORE_MAP           
             20 LOAD_CONST               6 (0)
             23 LOAD_CONST               7 ('integer')
             26 STORE_MAP           
             27 BINARY_MODULO       
             28 PRINT_ITEM          
             29 PRINT_NEWLINE       
             30 LOAD_CONST               0 (None)
             33 RETURN_VALUE        


>>> def new_syntax():
>>>     print '{float} {string} {integer}'.format(float=3.14, string='foo', integer=0)
>>> dis.dis(new_syntax)
  2           0 LOAD_CONST               1 ('{float} {string} {integer}')
              3 LOAD_ATTR                0 (format)
              6 LOAD_CONST               2 ('float')
              9 LOAD_CONST               3 (3.14)
             12 LOAD_CONST               4 ('string')
             15 LOAD_CONST               5 ('foo')
             18 LOAD_CONST               6 ('integer')
             21 LOAD_CONST               7 (0)
             24 CALL_FUNCTION          768
             27 PRINT_ITEM          
             28 PRINT_NEWLINE       
             29 LOAD_CONST               0 (None)
             32 RETURN_VALUE        
```

Let’s look at raw performance

```python

>>> timeit.Timer("%d and %.1f" % (17, 3.14)).timeit(100000)
0.007246971130371094

>>> timeit.Timer("{} and {}".format(17, 3.14)).timeit(100000)
0.006257057189941406

>>> timeit.Timer("""words = ['hello', 'world', 'you', 'look', 'nice'] * 100; map(lambda x: '%(foo)s' % {'foo': x}, words)""").timeit(10000)
1.857041835784912

>>> timeit.Timer("""words = ['hello', 'world', 'you', 'look', 'nice'] * 100; map(lambda x: '{foo}'.format(foo=x), words)""").timeit(10000)
2.7408900260925293
```

=> add performance bench
+ look at instructions

