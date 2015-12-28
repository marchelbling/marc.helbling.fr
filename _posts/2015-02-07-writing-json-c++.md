---
layout: post
title: Writing json in C++
category: code
tags: [c++, json]
description: A case study of a real life C++ exercice (written naively).
---

Writing a valid json file looks simple. Except that if the json file contains real world data coming from unknown sources, it might not be that simple. The [json](http://json.org) format does not support everything that you could expect for numerical values and strings.

More specifically, a numerical value involves digits in json. This prevents from having `inf` or `nan` serialized in json.
Strings preferred encoding is UTF-8 with some restriction. Quotes `"` and backslash `\` have to be escaped but [control characters](http://en.wikipedia.org/wiki/Unicode_control_characters) should be encoded with their unicode 4 hex digits representation.

As the C++ standard library does not implement JSON, it makes it a good exercise putting into practice a bit of template functions and STL usage.


## json stream

What we need to achieve is simply to sanitize data when streaming it into an output stream. So we basically want to override the behavior of `<<`. We could try to inherit `std::ofstream` and simply reimplement the desired operator. However, deriving from `basic_ostream` is really [cumbersome](http://www.math.hkbu.edu.hk/parallel/pgi/doc/pgC++_lib/stdlibug/cre_2288.htm). It is much easier and safer to simply implement a wrapper around some `std::ofstream` object:

```cpp

#include <string>
#include <fstream>


class json_stream {

public:
    json_stream(const std::string& path) : _stream(path.c_str())
    {}

    template<typename T>
    json_stream& operator<<(const T& data) {
        if (_stream.is_open()) {
            _stream << dump(data);
        }
        return *this;
    }

private:
    std::ofstream _stream;
};

```

# Object serialization

JSON defines very few structures:

* numbers
* strings
* ordered list of values i.e. array
* collection of name/value pair i.e. associative array where name should be a string

Using template construct, we can easily set up functions that will recursively JSON serialize complex structures

```cpp
#include <sstream>
#include <vector>
#include <map>


template<typename T>
struct is_container : std::false_type {};

template<typename T>
struct is_associative_container : std::false_type {};

// vector overload
template<typename T>
struct is_container< std::vector<T> > : std::true_type {};

// map overload
template<typename K, typename V>
struct is_container< std::map<K, V> > : std::true_type {};

template<typename K, typename V>
struct is_associative_container< std::map<std::string, V> > : std::true_type {};


class json_stream {
    //...
private:
    // ...
    template<typename T>
    std::string dump(const T& t) const {
        // dispatch to actual dump method:
        // * not iterable type dumped as simple value
        // * iterable type
        //   * with mapped value dumped as mapped_container
        //   * otherwise dumped as simple_container
        return dump_value_or_container(t, typename is_container<T>::type());
    }

    // dispatch to correct dump method
    template<typename T>
    std::string dump_value_or_container(const T& t, std::false_type) const {
        return dump_value(t);
    }

    template<typename T>
    std::string dump_value_or_container(const T& t, std::true_type) const {
        return dump_simple_or_associative_container(t, typename is_associative_container<T>::type());
    }

    template<typename T>
    std::string dump_simple_or_associative_container(const T& t, std::false_type) const {
        return dump_simple_container(t);
    }

    template<typename T>
    std::string dump_simple_or_associative_container(const T& t, std::true_type) const {
        return dump_associative_container(t);
    }

    // implement type specific serialization
    template<typename V>
    std::string dump_value(const V& value) const {
        std::ostringstream oss;
        oss << sanitize(value);
        return oss.str();
    }

    std::string dump_value(const std::string& value) const {
        return "\"" + value + "\"";
    }

    template<typename K, typename V>
    std::string dump_value(const std::pair<const K, V>& pair) const {
        std::ostringstream oss;
        oss << "[" << dump(pair.first) << ", " << dump(pair.second) << "]";
        return oss.str();
    }

    template<typename V>
    std::string dump_pair(const std::pair<const std::string, V>& pair) const {
        std::ostringstream oss;
        oss << dump(pair.first) << ": " << dump(pair.second);
        return oss.str();
    }

    template<typename C>
    std::string dump_simple_container(const C& container) const
    {
        std::ostringstream oss;
        typename C::const_iterator it = container.begin();

        oss << "[" << dump(*it);
        for (++ it ; it != container.end() ; ++ it) {
            oss << ", " << dump(*it);
        }
        oss << "]";

        return oss.str();
    }

    template<typename M>
    std::string dump_associative_container(const M& map) const
    {
        std::ostringstream oss;
        typename M::const_iterator it = map.begin();

        oss << "{" << dump_pair(*it);
        for (++ it ; it != map.end() ; ++ it) {
            oss << ", " << dump_pair(*it);
        }
        oss << "}";

        return oss.str();
    }

    template<typename T>
    T sanitize(const T& t) const {
        return t;
    }

    // ...

```

Note that, for generic `map<K, V>` where `K` is not `std::string`, we did not serialize the key as a string but instead serialized generic `pair<K, V>` as a container.

We now have all the machinery in place:

* depending on the container nature, we serialize it as a JSON array or a JSON associative array.
* when serializing a 'final' value, we call a `sanitize` method (that will return the input object by default).


So to customize our serializer we just have to:

* specialize the `is_container` and `is_associative_container` traits to support new containers; this approach is much easier to understand and read than typical SFINAE and notice that every code path is defined at compile time;
* *overload*  `sanitize` method for specific input types. C++ will indeed prefer a non templated function over a templated function. This has the advantage that it enables to change the function signature to meet some specific needs.


## infinity and not-a-number

From the [RFC 4627](http://www.ietf.org/rfc/rfc4627.txt),
>   Numeric values that cannot be represented as sequences of digits
>   (such as Infinity and NaN) are not permitted.

This is probably arguable as the [IEEE 754](http://en.wikipedia.org/wiki/IEEE_floating_point) standard defines `inf` and `nan`. Let’s see how some languages deal with this in their json libraries:

* Python:

```python
>>> import json
>>> json.dumps(float('nan'))
'NaN'
>>> json.loads(json.dumps(float('nan')))
nan
```
Python does not conform to the RFC but is consistent.

* Ruby

```ruby
irb(main):001:0> require 'json'
=> true
irb(main):002:0> JSON.dump(Float::NAN)
=> "NaN"
irb(main):003:0> JSON.parse('{"key": NaN}')
JSON::ParserError: 209: unexpected token at 'NaN}'
	from /Library/Ruby/Gems/2.0.0/gems/json-1.8.1/lib/json/common.rb:155:in `parse'
	from /Library/Ruby/Gems/2.0.0/gems/json-1.8.1/lib/json/common.rb:155:in `parse'
	from (irb):3
	from /usr/bin/irb:12:in `<main>'
irb(main):004:0> JSON.parse('{"key": NaN}', allow_nan: true)
=> {"key"=>NaN}
```
Ruby (2.0.0p481) is not so consistent. It will serialize a `nan` but, by default, will not deserialize it.

* (node)js

```js
> JSON.stringify(NaN)
'null'
> JSON.parse('NaN')
SyntaxError: Unexpected token N
    at Object.parse (native)
    at repl:1:7
    at REPLServer.self.eval (repl.js:110:21)
    at Interface.<anonymous> (repl.js:239:12)
    at Interface.emit (events.js:95:17)
    at Interface._onLine (readline.js:203:10)
    at Interface._line (readline.js:532:8)
    at Interface._ttyWrite (readline.js:761:14)
    at ReadStream.onkeypress (readline.js:100:10)
    at ReadStream.emit (events.js:98:17)
```
js is somehow consistent and conforms to the RFC. However, `null` is untyped so depending on the usage this might lead to some issues. Also, js serializes `inf` is serialized to `null` too making `inf` and `nan` indistinguishable from a consumer point of view.

The RFC therefore seems like the way to go if the json has to be consumed by different environments.

We have two straightforward ways to handle non finite floating values:

* serialize them as string and have a post json deserialization step fixing those values
* remapping those values to json serialize finite values.

The choice might be application specific. Using string serialization requires an extra step that should be implemented by all consumers. The second option while not entirely satisfactory has the advantage of not adding any requirement on consumers. Let’s use this option and replace `inf` by the maximum representable value and `nan` by 0:

```cpp

template <typename T>
int sgn(const T&  val) const {
    return (T(0) < val) - (val < T(0));
}

double sanitize(const double d) const {
    if(std::isfinite(d)) { // include <cmath>
        return d;
    }
    else {
        if(std::isinf(d)) {
            return sgn(d) * std::numeric_limits<double>::max(); // include <limits>
        }
        return 0.;
    }
}

double sanitize(const float f) const {
    return sanitize(static_cast<double>(f));
}
```

Notice that we here benefit from the possibility of changing the function signature and have `double sanitize(const float)` instead of `float sanitize(const float&)`. This would not be possible if we were specializing a templated function.


## String

Manipulating text encodings is a pain in C++ (at least to my knowledge). The standard library mostly offers conversion between locale facets i.e. “class[es] describing a locale feature set associated to a specific cultural aspect." (see [locale/facet](http://www.cplusplus.com/reference/locale/locale/facet/)). The basic `std::string` type is a simple `char` i.e. byte container with no constraint and `std::wstring` is tightly bound to the system locale which is not always very useful.

To conform with the RFC 4627, we need to make sure every string is UTF-8 encoded and `\`, `/`, `\b`, `\f`, `\n`, `\r` and `\t` must be escaped and other control characters must be “unicode escaped” i.e. represented using `\\uxxxx`. We will suppose that input data is *mostly* UTF-8 encoded and will replace bad byte sequence by `\ufffd`. For the sake of the exercise, we will not use any library for this. [utfcpp](http://utfcpp.sourceforge.net/) or [poco](https://github.com/pocoproject/poco) would do the job.

One important point when considering text decoding/encoding is wether the sequence should be considered signed or not. In our case, UTF-8 decoding/encoding will only require bit masks and shifts so the sign does not matter.

Let’s first write a naive UTF-8 decoder; we will parse the string and transform byte sequence to code points:

```cpp
inline unsigned int mask8(char const value) {
    return value & 0xff;
}

inline bool is_valid_continuation_byte(unsigned int byte) {
    return ((byte & 0xC0) == 0x80);
}

inline int get_next_byte(std::string::const_iterator& iterator, std::string::const_iterator end_iterator) {
    if(iterator != end_iterator) {
        return mask8(*(++ iterator));
    }
    else {
        return 0; // invalid continuation byte
    }
}

void insert_replacement(std::vector<unsigned int>& output, unsigned int replacement, unsigned int count) {
    for(unsigned int i = 0 ; i < count ; ++ i) {
        output.push_back(replacement);
    }
}

std::vector<unsigned int> decode_utf8(const std::string& input, const int replacement=0xfffd) {
    unsigned int code_unit1, code_unit2, code_unit3, code_unit4;
    std::vector<unsigned int> codepoints;

    for(std::string::const_iterator iterator = input.begin() ; iterator != input.end() ; ++ iterator) {
        code_unit1 = mask8(*iterator);
        if (code_unit1 < 0x80) {
            codepoints.push_back(code_unit1);
        }
        else if (code_unit1 < 0xC2) { // continuation or overlong 2-byte sequence
            codepoints.push_back(replacement);
        }
        else if (code_unit1 < 0xE0) { // 2-byte sequence
            code_unit2 = get_next_byte(iterator, input.end());

            if (!is_valid_continuation_byte(code_unit2)) {
                insert_replacement(codepoints, replacement, 2);
            }
            else {
                codepoints.push_back((code_unit1 << 6) + code_unit2 - 0x3080);
            }
        }
        else if (code_unit1 < 0xF0) { // 3-byte sequence
            code_unit2 = get_next_byte(iterator, input.end());

            if (!is_valid_continuation_byte(code_unit2) ||
                (code_unit1 == 0xE0 && code_unit2 < 0xA0)) /* overlong */ {
                insert_replacement(codepoints, replacement, 2);
            }
            else {
                code_unit3 = get_next_byte(iterator, input.end());

                if (!is_valid_continuation_byte(code_unit3)) {
                    insert_replacement(codepoints, replacement, 3);
                }
                else {
                    codepoints.push_back((code_unit1 << 12) + (code_unit2 << 6) + code_unit3 - 0xE2080);
                }
            }
        }
        else if (code_unit1 < 0xF5) { // 4-byte sequence
            code_unit2 = get_next_byte(iterator, input.end());
            if(!is_valid_continuation_byte(code_unit2) ||
               (code_unit1 == 0xF0 && code_unit2 < 0x90) || /* overlong */
               (code_unit1 == 0xF4 && code_unit2 >= 0x90)) {  /* > U+10FFFF */
                insert_replacement(codepoints, replacement, 2);
            }
            else {
                code_unit3 = get_next_byte(iterator, input.end());
                if(!is_valid_continuation_byte(code_unit3)) {
                    insert_replacement(codepoints, replacement, 3);
                }
                else {
                    code_unit4 = get_next_byte(iterator, input.end());
                    if(!is_valid_continuation_byte(code_unit4)) {
                        insert_replacement(codepoints, replacement, 4);
                    }
                    else {
                        codepoints.push_back((code_unit1 << 18) + (code_unit2 << 12) + (code_unit3 << 6) + code_unit4 - 0x3C82080);
                    }
                }
            }
        }
        else {
            /* > U+10FFFF */
            insert_replacement(codepoints, replacement, 1);
        }
    }
    return codepoints;
}
```

This piece of code is pretty long but really simple. We try to decode a single codepoint by progressively reading up to 4 bytes and validate that each “prefix” is a valid UTF-8 sequence otherwise we insert an replacement value for each invalid byte.

We can now iterate over the codepoints and encode them using the JSON rules:

```cpp

std::string json_encode_control_char(unsigned int codepoint) {
    std::ostringstream oss;
    oss.fill('0');
    oss << "\\u" << std::setw(4) << std::hex << codepoint;
    return oss.str();
}


std::string utf8_encode(unsigned int codepoint) {
    std::string output;

    if(codepoint > 0x590 && codepoint < 0x5F4) {
        return output;
    }

    // out of range
    if(codepoint > 1114112) {
        return utf8_encode(0xfffd);
    }

    if (codepoint < 0x80) {
        output.push_back(codepoint);
    }
    else if (codepoint <= 0x7FF) {
        output.push_back((codepoint >> 6) + 0xC0);
        output.push_back((codepoint & 0x3F) + 0x80);
    }
    else if (codepoint <= 0xFFFF) {
        output.push_back((codepoint >> 12) + 0xE0);
        output.push_back(((codepoint >> 6) & 0x3F) + 0x80);
        output.push_back((codepoint & 0x3F) + 0x80);
    }
    else if (codepoint <= 0x10FFFF) {
        output.push_back((codepoint >> 18) + 0xF0);
        output.push_back(((codepoint >> 12) & 0x3F) + 0x80);
        output.push_back(((codepoint >> 6) & 0x3F) + 0x80);
        output.push_back((codepoint & 0x3F) + 0x80);
    }
    return output;
}


std::string json_encode_codepoints(std::vector<unsigned int> const& codepoints) {
    std::string json_string;

    for(std::vector<unsigned int>::const_iterator codepoint = codepoints.begin() ; codepoint != codepoints.end() ; ++ codepoint) {
        if(*codepoint == 8) { // \b
            json_string.push_back('\\');
            json_string.push_back('b');
        }
        else if(*codepoint == 9) {  // \t
            json_string.push_back('\\');
            json_string.push_back('t');
        }
        else if(*codepoint == 10) { // \n
            json_string.push_back('\\');
            json_string.push_back('n');
        }
        else if(*codepoint == 12) { // \f
            json_string.push_back('\\');
            json_string.push_back('f');
        }
        else if(*codepoint == 13) { // \r
            json_string.push_back('\\');
            json_string.push_back('r');
        }
        else if(*codepoint == 34) { // "
            json_string.push_back('\\');
            json_string.push_back('"');
        }
        else if(*codepoint == 47) { // /
            json_string.push_back('\\');
            json_string.push_back('/');
        }
        else if(*codepoint == 92) {
            json_string.push_back('\\');
            json_string.push_back('\\');
        }
        else if(*codepoint < 32 || *codepoint == 127 || (*codepoint >= 128 && *codepoint <= 159)) {
            json_string += json_encode_control_char(*codepoint);
        }
        else {
            json_string += utf8_encode(*codepoint);
        }
    }
    return json_string;
}

```

By composing those decoding/encoding functions together we finally have our string sanitization function:

```cpp
std::string sanitize(std::string const& input) const {
    return json_encode_codepoints(decode_utf8(input));
}
```


# Conclusion

Even though it may be a better choice to use an existing library for production code (see [language libraries](http://json.org/)), writing a json serializer is a good exercise as it involves a lot of C++ mechanisms (templates, function overload, recursion etc.) and “standards” (JSON, IEEE 754, Unicode).

The exercice can be refined a lot: beautification, support for heterogeneous types, deserializer etc.
It deals with real world issues (and trade-offs) and is typically the kind of stuff that should probably be taught (more) to students.


Code available as a [gist](https://gist.github.com/marchelbling/658f6c3f7c882974eb96).
