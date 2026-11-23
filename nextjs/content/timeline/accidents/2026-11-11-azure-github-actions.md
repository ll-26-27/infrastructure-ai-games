---
title: "A Microsoft database glitch leaves 3.4 million GitHub jobs half-built"
date: "2026-11-11"
time: "3:05–4:02 p.m. US Eastern"
where: "Azure Central US; GitHub"
kind: accident
category: outage
visible: "One company's cloud underneath another's: the place where most of the world's code is stored and tested runs on a Microsoft database in Iowa."
cause: "Per GitHub, quoting Microsoft's analysis: \"a configuration change to the Central US gateways exposed a latent race condition under a specific high-load traffic pattern.\""
sources:
  - "https://www.githubstatus.com/incidents/dvy0t3mvh1lg"
---
For about an hour, an outage in Azure's Cosmos DB database service in its Central US region left about 3.4 million GitHub Actions runs (automatic tests and builds) partly created, stopped GitHub Pages sites from deploying, and cut Copilot's automatic code reviews by 87%. One system's failure running straight into another's is what the sociologist Charles Perrow called tight coupling.
