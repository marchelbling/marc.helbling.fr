/*

This is a very simple name-spacing stuff.
You implement a module with:

ns('your.module.path', function () {
  this.fns(a, b);

  this.some_other_stuff = 'asdfftw!';

  function a () {}
  function b () {}
  function a_private_function () {}
});

This will cause to object your.module.path have fields a, b and some_other_stuff.
Modules can be re-entered so different parts have separate private scopes.
(Try to use this property to minimize amount of stuff brought in to functions as
closures.)

*/

function ns (path, fn) {
  var object = typeof path === 'string' ? ns.create_path(path)
                                        : path;
  if (typeof fn === 'function') {
    fn.call(object);
  }

  return object;
}

ns.root = {};

ns.NS = function () {};

ns.NS.prototype.fns = function () {
  for (var i = 0; i < arguments.length; ++i) {
    var fn = arguments[i];
    var name = ns.function_name(fn);
    this[name] = fn;
  }
};

ns.function_name = function (fn) {
  return fn.name || fn.toString().match(/function\s+([^\s\(]+)/)[1];
};

ns.create_path = function (path) {
  var names = path.split('.');

  var parent = ns.root;
  var object, name;

  for (var i = 0; i < names.length; ++i) {
    name   = names[i];
    object = parent[name];
    if (!object) {
      object = parent[name] = new ns.NS;
    }

    parent = object;
  }

  return object;
};

/*

For lazy references to functions & objects (to get the object you need to
invoke the returned function anyway)

When compiled, calls to this should be translated to literal paths, with the
exception of circular dependencies

Also, keeps guard of passing proper `this` to the functions (their own
namespace)

*/
function use (path) {
  var last_dot_index = path.lastIndexOf('.');
  var parent_path = path.substring(0, last_dot_index);
  var name = path.substring(last_dot_index + 1);

  var parent, object, run;

  return function () {
    if (!object) {
      parent = ns(parent_path);
      object = parent[name];
      run    = typeof object === 'function';
    }

    if (run) {
      return object.apply(parent, Array.prototype.slice.call(arguments, 0));
    } else {
      return object;
    }
  }
}

function main (fn) {
  // TODO: do the proper DOMContentLoaded here:
  setTimeout(fn, 0);
}

main(function() {
  'use strict';

  var start_extra_modules = use('slides.extra_modules.start');

  start_extra_modules();
});

ns("slides.extra_modules", function () {
  "use strict";

  this.start = start;

  var ATTR_EXTRA_SCRIPTS = "data-load-modules";
  var EXTRA_SCRIPTS_SELECTOR = "[" + ATTR_EXTRA_SCRIPTS + "]";
  var array = use("slides.utils.array");

  function start () {
    var nodes;

    if (document.querySelectorAll) {
      nodes = array(document.querySelectorAll(EXTRA_SCRIPTS_SELECTOR));
    } else {
      nodes = Sizzle(EXTRA_SCRIPTS_SELECTOR);
    }

    if (!nodes || !nodes.reduce) return;

    var names = nodes.reduce(function (agg, node) {
      return agg.concat(node.getAttribute(ATTR_EXTRA_SCRIPTS).split(/\s+/));
    }, []).filter(function (name) {
      return name;
    });

    names.forEach(function (name) {
      ns(name).start();
    });
  }
});

ns("slides.play", function () {
  "use strict";

  this.fns(start);

  var NEXT_CODES = [32, 34, 39, 40];
  var PREV_CODES = [33, 37, 38];

  var array = use("slides.utils.array");

  var html = document.documentElement;
  var fullscreen = html.mozRequestFullScreen || html.webkitRequestFullScreen;

  var sections = [];

  function start () {
    var content = document.body.querySelector("article");

    if (window.addEventListener) {
      window.addEventListener("keydown", keyboard, false);
    }

    sections = [];
    var elements = array(content.children);

    elements.forEach(function (element) {
      var name = element.nodeName;

      var section = sections[sections.length - 1];
      var section_content;

      if (!section || name === "H1" || name === "HR") {
        section = document.createElement("section");
        sections.push(section);
        section_content = document.createElement("div");
        section_content.className = "wrap";
        section.appendChild(section_content);
      }

      section_content = section.children[0];

      if (element.nodeName === "HR") {
        content.removeChild(element);
      } else if (name !== "SCRIPT") {
        section_content.appendChild(element);
      }
    });

    sections.forEach(function (section) {
      content.appendChild(section);
    });
  }

  function keyboard (event) {
    var dir = (NEXT_CODES.indexOf(event.keyCode) > -1
               ? 1
               : PREV_CODES.indexOf(event.keyCode) > -1
               ? -1
               : 0);

    if (event.keyCode === 70) { // 'f'
      fullscreen.call(html);
    }

    if (dir) {
      move(dir);
      event.preventDefault();
      event.stopPropagation();
    }
  }

  function move (dir) {
    var scroll = html.scrollTop || document.body.scrollTop;
    var height = window.innerHeight;

    var i = Math.round(scroll / height) + dir;

    if (sections[i]) {
      window.scrollTo(0, sections[i].offsetTop);
    }
  }
});

ns('slides.scripts', function () {
  'use strict';

  this.add = add;

  function extra_scripts () {
    return document.getElementById('extra-scripts');
  }

  function add (url) {
    var api_call = document.createElement('script');
    api_call.setAttribute('type', 'text/javascript');
    api_call.setAttribute('src', url);
    api_call.setAttribute('async', true);
    extra_scripts().appendChild(api_call);
  }
});

ns('slides.utils', function () {
  'use strict';

  this.array = array;

  function array (list) {
    var result = [];
    for (var i = 0; i < list.length; ++i) {
      result[i] = list[i];
    }
    return result;
  }
});
