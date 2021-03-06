---
layout: post
title: "Consumer-Driven Contracts"
description: "How to use Consumer-Driven Contracts and the Pact framework to develop RESTful service contracts"
date: 2016-10-10 12:00:00 -0000
comments: true
tags: [Pact, Consumer Driven Contracts]
keywords: "Pact, Consumer Driven Contracts, ThoughtWorks, Technology Radar, api, services, contracts"
---

Like many tech companies, at my employer we have a spider’s web of internal services communicating over HTTP. Services call other services. The website calls services. Our iOS and Android apps use these services. The services are owned by a number of different teams, and the apps are owned by entirely separate teams. 

Consumer-driven contracts is a pattern that seeks to reduce the risk of maintaining services by explicitly documenting and testing the dependencies between them. We adopted consumer-driven contracts around a year ago, after the technique appeared on the [ThoughtWorks Technology Radar](https://www.thoughtworks.com/radar/tools/pact-pacto). 

I've [posted](https://engineering.moonpig.com/development/consumer-driven-contracts) about our experience on our [engineering blog](https://engineering.moonpig.com/).