---
date: 2019-06-18
tags:
- vcs
- git
title: "Advanced git operations"
description: "A list of more advanced git operations."
url: advanced-git/
---

## Merging repositories

Without loosing history:

```
```cd path/to/project-b
git remote add project-a path/to/project-a
git fetch project-a --tags
git merge --allow-unrelated-histories --strategy-option=theirs
git remote remove project-a
```

