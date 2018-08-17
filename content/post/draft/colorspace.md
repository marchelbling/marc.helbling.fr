---
layout: post
title: Image processing
category: 2d
draft: true
tags: [image, 2d, 3d]
description: Some notes on not-always-well-known issues in image processing
---

* sRGB: still today?
* sRGB-linear-sRGB sandwich
* premult alpha (but not alpha channel!)
    * see doing maths + resize alpha
* a word on HDR (and pixel storage type: float, half-float, int8)

Read: http://blog.qythyx.com/2014/01/premultiplied-alpha.html?

* [The importance of being linear](http://http.developer.nvidia.com/GPUGems3/gpugems3_ch24.html)
* [Doing maths with RGB](http://www.essentialmath.com/GDC2015/VanVerth_Jim_DoingMathwRGB.pdf)
* [Gamma error in picture scaling](http://www.4p8.com/eric.brasseur/gamma.html)
* [Gamut](https://en.wikipedia.org/wiki/Gamut)
* [sRGB learning curve](https://en.wikipedia.org/wiki/Gamut)
* [resize alpha](http://entropymine.com/imageworsener/resizealpha/)
