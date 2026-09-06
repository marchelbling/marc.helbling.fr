---
layout: post
date: 2026-09-06
title: "France 2050 🇫🇷"
description: "Une carte interactive des communes françaises de plus de 10k habitants, filtrables sur une vingtaine de critères climatiques, hydrologiques et de services — sans note globale."
tags: [data]
url: france-2050/
---

<!-- La carte elle-même est un fichier statique (static/france-2k50/),
     publiée à /france-2k50/ indépendamment de cet article.
     Ne pas donner à cet article l'url /france-2k50/ : collision. -->

<!-- À écrire. Quelques points de départ, à garder ou à jeter. -->

<style>
.carte-embed{position:relative;left:50%;transform:translateX(-50%);
  width:min(calc(100vw - 2rem),1400px);margin:1.8rem auto}
.carte-embed iframe{display:block;width:100%;height:min(68vh,620px);min-height:440px;
  border:1px solid #e4e2dc;border-radius:6px;background:#faf9f7}
.carte-embed figcaption{font-size:.8rem;color:#6b6b66;margin-top:.5rem;text-align:center}
</style>

<figure class="carte-embed">
  <iframe src="/france-2k50/" title="Carte des communes françaises filtrable par critère"
          loading="lazy"></iframe>
  <figcaption><a href="/france-2k50/">Ouvrir la carte en plein écran</a></figcaption>
</figure>

L'été 2026 aura été chaud et sec sur la ~quasi~ totalité du territoire français. Il faut malheureusement
s'attendre à ce que l'exception devienne norme si nous n'arrivons pas à maitriser nos
émissions de gaz à effet de serre (comme cela semble être le cas, malgré les avertissements).

[Les Nations Unies](https://www.pbs.org/newshour/science/global-warming-will-exceed-1-5-degree-limit-un-says-in-report-that-maps-path-back-below-danger-zone) s'attendent même à ce que nous n'atteignons pas les objectifs de [l'Accord de Paris (2015)](https://unfccc.int/fr/a-propos-des-ndcs/l-accord-de-paris) de
rester en dessous de +1.5°C au dessus de la moyenne pré-ère industrielle. Le nouvel objectif est que nous
arrivions à contenir le dépassement pour rester en dessous de +2°C qui aurait des conséquences encore
plus dramatiques.

Afin de comprendre les évolutions du climat en fonction du territoire et des modèles météorologiques, la carte ci-dessus permet
de visualiser la situation attendue sur le territoire français pour 2050.

La carte ci-dessous croise la situation actuelle (population et services) et les projections officielles (climat) sur
1089 communes de plus de 10 000 habitants sur 6 dimensions :

* **Sols et risques** (Géorisques) : inondation, sismicité, retrait-gonflement
  des argiles, feu de forêt, radon et cavités souterraines, chacun avec son
  niveau.
* **Chaleur** (Climadiag Commune, Météo-France) : jours à plus de 35 °C, nuits
  tropicales et température moyenne d'été, à l'horizon 2050 sur la trajectoire
  TRACC (+2,7 °C sur la France).
* **Eau** (Sandre, VigiEau, ADES) : nature de la nappe libre sous la commune,
  années de restriction sévère sur les cinq dernières, tendance piézométrique
  sur vingt ans.
* **Santé** (DREES, INSEE) : consultations de généraliste accessibles par
  habitant et par an, service d'urgences, temps d'accès à ces urgences, nombre
  de spécialités présentes.
* **Culture** (INSEE) : conservatoires, lieux d'exposition et de médiation,
  arts du spectacle.
* **Accès et marché** (SNCF, DGFiP, INSEE) : temps de train direct vers Paris,
  prix médian des maisons vendues, population et son évolution.

L'objectif de la carte est de permettre à chacun de recoller les différentes données, d'aujourd'hui et demain, pour permettre
de se projeter dans la France de demain.
