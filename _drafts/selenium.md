---
layout: post
title: Selenium
category: tools
tags: [test, browser]
description: A primer on what selenium is and how to use it with Python.
---

[webdriver spec](http://www.w3.org/TR/webdriver/)

selenium comes with firefow driver.
[chrome webdriver](https://code.google.com/p/selenium/wiki/ChromeDriver)
[opera webdriver](https://code.google.com/p/selenium/wiki/OperaDriver)
[ie webdriver](https://code.google.com/p/selenium/wiki/InternetExplorerDriver)

[python selenium](http://selenium-python.readthedocs.org/en/latest/)


* you might want to use jenkins for very different reason; manipulate the browser using some script or actually testing a website. In that case you need to chose a testing framework. Using Python, [pytest](http://pytest.org/) seems like a very good fit as it is just easy to use and will allow to setup how to run the test.
* extend the driver class; most often event are not completely instant so implementing wait in driver will help mimick real user interaction
* usually a service will have a small set of possible interaction; write a method for each atomic action thus creating the DSL for your service and then simply call actions to perform a full user scenario
* test responsiveness by changing screen sizes
* beware that selenium is a machine and it can
* selenium is slow
* don't write unit test with selenium; describe realistic scenario and test this
