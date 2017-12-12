---
title: Galton-Watson
draft: true
categories:
- maths
tags:
- probabilities
- simulation
description:
---


# Introduction

A large nation of whom we will only concern ourselves with adult males, $N$ in number, and who each bear separate surnames colonise a district. Their law of population is such that, in each generation, $a_{0}$ per cent of the adult males have no children who reach adult life; $a_{1}$ have one such male child; $a_{2}$ have two and so on up to $a_{5}$. Find (1) what proportion of their surnames will have become extinct after $r$ generations and (2) how many instances there will be of the surname being held by $m$ persons.


# Power function

Let’s define the power function of a random variable $X$ taking values in $\mathbb{N}$ by

$$ F_X(s) = \sum_{k=0}^{+\infty}P(X = k)s^k $$

As $\sum_{k=0}^{+\infty}P(X=k)=1$, we easily see that $F_X(1)=1$ and $F_X(0)=P(X=0)$.  $F$ is a power series having each term lowered by 0 and majored by 1. Its radius of convergence is thus at least 1.
We will consider that the power function is limited to the $[0;1]$ domain.

## Convexity

For any $k$, $P(X=k)\geq 0$ so every $P(X=k)s^k$ function is increasing. By deriving $F$,

$$F'_X(s) = \sum_{k=0}^{+\infty}kP(X=k)s^{k-1}$$

we see that each $F'_X$ is the sum of increasing functions ($kP(X=k)s^{k-1}$) so $F_X$ is convex.


## Relation with mean value

We have seen that

$$F'_X(s) = \sum_{k=0}^{+\infty}kP(X=k)s^{k-1}$$

So by taking this expression to the limit

$$\lim_{s\rightarrow 1}F'_X(s) = \lim_{s\rightarrow 1}\sum_{k=0}^{+\infty}kP(X=k)s^{k-1}=\sum_{k=0}^{+\infty}kP(X=k)=E(X)$$


## Power function of the sum of independant variabels

Let’s suppose $X$ and $Y$ are two independant random variables. We may write

$$\mathbb{P}(X+Y=k) = \sum_{i=0}^{k} \mathbb{P}(X=i \cap Y=k-i) = \mathbb{P}(X=i)\mathbb{P}(Y=k-i).$$

Using this expression in the power function definition:

$$F_{X+Y}(s) = \sum_{k=0}^{\infty} \mathbb{P}(X+Y=k)s^k= \sum_{k=0}^{\infty} \sum_{i=0}^{k} \mathbb{P}(X=i)\mathbb{P}(Y=k-i)s^{k-i+i}$$

By defining $j=k-i$, we may rewrite this as
$$F_{X+Y}(s) = \left(\sum_{k=0}^{\infty} \mathbb{P}(X=i)s^i\right) \left(\sum_{j=0}^{\infty}\mathbb{P}(Y=j)s^{j}\right)$$
i.e.
$$F_{X+Y}(s)=F_X(s)F_Y(s)$$


## Application

Let’s define $Z_n$ with $n\in \mathbb{N}$ as the number of male individuals at the $n$th generation. We will further assume that every individual will follow the same probability function of having $c$ children and that all individual are independant.

We also define
$$\begin{array}{c}F_0(s)=s\\F_1(s)=F(s)\\F_n(s)=F(F_{n-1}(s))\end{array}$$

We want to demonstrate that the number of individuals at the $n$-th generation has $F_n$ as power function.


# Exponantial law


## Density function:

$$ f(x) = \alpha \exp^{- \alpha x} \mbox{ if }  x\geq 0 $$


## Expected value

$$ E(X) = \int_{-\infty}^{+\infty}xf(x) dx = \frac{1}{\alpha} $$


## Variance

$$ V(X) = E(X^2) - E(X)^2 = \frac{1}{\alpha^2} $$


## Memory

$P(T \geq t+x / T \geq t) = \frac{P(T \geq t+x \cap T \geq t)}{P(T \geq t)} = \frac{P(T \geq t+x)}{P(T \geq t)}$

As $$P(T \geq y) = \int_y^{+\infty} \alpha \exp^{-\alpha t}dt = \exp^{-\alpha y}$$

We have $$P(T \geq t+x / T \geq t) = \frac{\exp^{-\alpha (t+x)}}{\exp^{-\alpha t}} = \exp^{-\alpha x}=P(T\geq x)$$


## inf value for a variable family

$$T = \underset{i\in [1;n]}{\inf} T_i$$


$$F_T(x) = P(T \leq x) = 1 - P(T > x).$$

If $T > x$, then $\forall i \in [1;n], T_i > x$ as $T \leq T_i$ by definition.

$$P(T > x) = P\left(\underset{i=1}{\overset{n}{\bigcap}} T_i> x \right) = \prod_{i=1}^n P(T_i > x),$$ by independance.

So $$P(T > x) = P(T_1 > x)^n$$ and $$P(T \leq x) = 1- P(T > x) = 1 - P(T_1 > x)^n.$$

As we have seen $$P(T > x) = \exp^{-\alpha x},$$

we therefore have $$F_T(x) = 1 - \exp^{(-\alpha x)}^n = 1 - \exp^{-n\alpha x}}.$$

By derivation:
$$f_T(x) = \frac{d}{dx}F_T(x) = \frac{d}{dx}(1 - \exp^{-n\alpha x}) = n\alpha \exp^{-n\alpha x}}.$$



# References
