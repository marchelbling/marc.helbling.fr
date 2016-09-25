---
layout: post
title: photogrammetry
category: 3d
tags: [3d, photogrammetry, tools]
description: Notes on making PBR photogrammetry
---

# Notes on shooting

* low ISO
* consistant ISO
* fast shutter (avoid blur)
* very good overlap between photos

# Notes on 3D reconstruction


# Notes on materials


# Softwares

## Reconstruction

* [OpenMVG](https://github.com/openMVG/openMVG/)
* [OpenMVS](https://github.com/cdcseacave/openMVS) ([forum](https://groups.google.com/forum/#!forum/openmvs))
* [Bundler: structure from motion from unordered image collections](http://www.cs.cornell.edu/~snavely/bundler/)
* [Clustering Views for Multi-view Stereo](http://www.di.ens.fr/cmvs/)
* [Patch-based Multi-view Stereo Software](http://www.di.ens.fr/pmvs/)
* [VisualFSM](http://ccwu.me/vsfm/) ([forum](https://groups.google.com/forum/#!forum/vsfm))
* [Agisoft Photoscan](http://www.agisoft.com/) ([forum](http://www.agisoft.com/forum/))
* [Acute3d](https://www.acute3d.com/)
* [Reality Capture](https://www.capturingreality.com/) ([forum](https://www.capturingreality.com/forum))

### Geometry processing

* [Meshlab](http://meshlab.sourceforge.net/) (point cloud to mesh, simplification)

### Materials

* [Allegorithmic Bitmap2Materials](https://www.allegorithmic.com/products/bitmap2material)
* [xNormal (windows)](http://www.xnormal.net)


### Library

* [Quixel megascan (PBR library)](https://megascans.se/)


### Cloud services

* [Altizure](https://www.altizure.com/): reconstruction, publishing
* [Autodesk 123D Catch](http://www.123dapp.com/catch): mobile app and reconstruction service
* [Autodesk ReMake](https://remake.autodesk.com/about) / [Autodesk ReCap 360](https://recaphub.autodesk.com/)


# References

## Videos

* [Photoscan (youtube) guide](https://www.youtube.com/watch?v=LeU_2SHwhqI)
* [Star Wars: Battlefront and the Art of Photogrammetry](https://www.youtube.com/watch?v=U_WaqCBp9zo)


## Articles

* [Visual revolution of the vanishing of Ethan Carter](http://www.theastronauts.com/2014/03/visual-revolution-vanishing-ethan-carter/)
* [Photorealistic rendering utilizing close-range photogrammetry](http://www.cs.uoregon.edu/Reports/UG-201606-Slater.pdf)
* [Open source photogrammetry: ditching 123D catch](http://wedidstuff.heavyimage.com/index.php/2013/07/12/open-source-photogrammetry-workflow/)
* [How 3D Scanning was used to create the worlds of Star Wars Battlefront](http://nicklievendag.com/3d-scanning-star-wars-battlefront/): see materials notes
* [Tutorial: VisualSFM + OpenMVS](https://groups.google.com/forum/#!topic/vsfm/VcXGvP1HuMo)
* [OpenMVS usage: from openMVG to a textured mesh](https://github.com/cdcseacave/openMVS/wiki/Usage)
* [Creating Next-gen Assets from Scanned Data](http://blog.meltinglogic.com/2015/04/creating-next-gen-assets-from-scanned-data/)
* [Making 3D Models with Photogrammetry (Getting Started with Agisoft PhotoScan)](http://www.haskinssociety.org/photogrammetry)
* [The Workflows of Creating Game Ready Textures and Assets using Photogrammetry](http://www.gamasutra.com/blogs/JosephAzzam/20160824/278719/The_Workflows_of_Creating_Game_Ready_Textures_and_Assets_using_Photogrammetry.php)
* [Taking Better Photos for Textures](https://udn.epicgames.com/Three/TakingBetterPhotosForTextures.html)
* [The Digital Emily Project: Achieving a Photoreal Digital Actor](http://gl.ict.usc.edu/Research/DigitalEmily/)

## Communities
* [/r/photogrammetry](https://www.reddit.com/r/photogrammetry/)
* [Sketchfab 3D scanning & photogrammetry forum](https://forum.sketchfab.com/c/groups/3d-scanning-and-photogrammetry)

# Interesting notes:

* [Would you pay for faster photogrammetry](https://www.reddit.com/r/gamedev/comments/4w88fz/would_you_pay_for_faster_photogrammetry/)
    > Can you be a bit more detailed about the aspects of photogrammetry pipeline you try to speed up? Are they only about the reconstruction phase? As someone who uses photogrammetry for in game models, what i would really love would be a tool to help me with shadow(direct and nondirect) removal. I am aware of the current proposed workflow of shooting hdr 360 images - relighting the model in an offline renderer and use the shadow mask to help you in photoshop, but i find this part of the workflow much more difficult and time consuming than the actual reconstruction.
* [Quixel megascans: how?](https://megascans.se/faq#How%20are%20the%203D%20scans%20acquired%20and%20processed%3F)
* [Photoscan to game asset](http://www.agisoft.com/forum/index.php?topic=2286.0)
