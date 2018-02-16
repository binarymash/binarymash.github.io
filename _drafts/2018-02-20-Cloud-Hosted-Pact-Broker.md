---
layout: post
title: "Hosted Pact Broker"
description: "Now you can use Consumer-Driven Contracts and Pact without having to worry about hosting your own Pact broker"
date: 2018-02-20 12:00:00 -0000
comments: true
tags: [Pact, Consumer Driven Contracts]
keywords: "Pact, Consumer Driven Contracts, api, services, contracts"

---

Back in 2016 I wrote about using [Consumer-Driven Contracts]({{ site.baseurl }}{% post_url 2016-10-10-Consumer-Driven-Contracts %}) and the Pact framework when designing and testing contracts for RESTful APIs.

As I mentioned in that post, one of the components of Pact is the Pact Broker. The Broker acts as a repository for all the service contracts; a service consumer first defines the pacts it needs with a provider, and then uploads these to the Broker. A service provider downloads the very same pacts from the Broker to verify that it can support them.

The Broker is, like the rest of the Pact framework, [open-source code](https://github.com/pact-foundation/pact_broker). Releases are also published as [Docker images](https://hub.docker.com/r/dius/pact-broker/), so it's just a case of finding somewhere to host it. At work we are running the container on a virtual machine on Azure. None of this is difficult to do, but it's another thing to manage and keep up to date. And, it caused us some pain a few weeks ago when Microsoft patched the VMs for the Meltdown vulnerability; for some reason we couldn't get the broker running again afterwards, and so had to create a whole new VM. What a pain.

The need to host a broker is also a bit of a barrier to adopting the use of Pact in any open source project or personal project.

Happily, I noticed last week that [Dius](https://dius.com.au), one of the major contributors to Pact, is now offering the Broker as a [hosted service](https://pact.dius.com.au/). It is in beta testing at the moment, and currently free to use, but I assume at some point that they'll start charging for it. I've not used it yet, but I expect to be doing some work on an open source project soon that will give me an opportunity to try it out. And, at the right price, this is kind of thing I think we'd be willing to pay for at work so that we have one less thing to manage ourselves.