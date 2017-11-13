---
layout: post
title:  "Build Pipelines #1: A Journey Of Discovery"
date:   2017-06-10 12:00:00 -0000
tags: [Automation, Continous Delivery, Build Pipelines, Cake, AppVeyor, Travis, GitVersion, GitReleaseNotes, OpenCover, Coveralls]
keywords: "Automation, Continous Delivery, Build Pipelines, Cake, AppVeyor, Travis, GitVersion, GitReleaseNotes, OpenCover, Coveralls"
comments: true
---
I've been spending some time recently setting up build pipelines for a number of open source projects I contribute to. I've been using automated build pipelines for about 15 years, but it's been a while since I've built one from from scratch, and in the meantime technology has moved on. So, despite my previous experience, setting up the new pipelines has been a great opportunity to learn. 

I'll write more about the new pipelines later, but first a brief description of my journey so far...

## A world before build pipelines

It's amazing now to look back on my early career and see a world before build pipelines. Back in 1999 I was developing a project in [Delphi](https://en.wikipedia.org/wiki/Delphi_(programming_language)). In those days, a common attitude in development was pretty much "if it compiles, it probably works". We didn't know better. Of course, we weren't totally wreckless; after compiling the code in the IDE, we'd manually debug it. If it seemed to work ok, we'd commit it to our source control system and then roll it out to live. But we would never have any confidence the changes we'd made would not break the system elsewhere. Our lack of confidence was often shown to be entirely justified.

## Unit tests

In about 2000 I went on an Object Oriented Design training course, which included a short session on writing automated unit tests against code. I liked the idea, but I just couldn't see how we could possibly use it on our system; our code made heavy use of Monte Carlo modelling and random number generation, so how could we possibly write deterministic tests against non-deterministic code? (It would be a few years more before I discovered the power of inversion of control...) 

As it happens, we did have an opportunity to give automated testing a go soon after, on an application we were building to provide a user interface for editing configuration files. This application was written in Perl, and we added tests that inserted some values in the UI and then checked the generated configuration files to see if they looked correct. We'd run these tests manually from within the IDE before committing our code. It was a big step forward. We were living in the future, although it was still very much a manual process to run the tests, and so sometimes we didn't, and we'd break the code.

## Automation

In 2003, I was working on a telecoms project written in [SDL](https://en.wikipedia.org/wiki/Specification_and_Description_Language) and Java, and running on HP-UX. This was my first exposure to [Extreme Programming](https://en.wikipedia.org/wiki/Extreme_programming), and as such we were keen to embace the strange new ways of working that XP offered. We pair-programmed, we code reviewed, and we made a big deal about covering our code in unit tests and acceptance tests. We even wrote some automation scripts to build the whole system and run the tests on a dedicated build machine. As this was effectively a research project, there was no need for releases; all we really cared about was, "does the current version of the code work?". So, a very naive build system, but useful nonetheless. 

## Bespoke pipelines

A couple of years later I found myself in a new job, this time working on some .NET applications. The build system here was, again, a bespoke collection of scripts written in VBScript. For reasons lost in the mists of time, the original developers of the scripts chose to call the system CruiseControl, despite there already being a [completely unrelated open source build tool](https://en.wikipedia.org/wiki/CruiseControl) going by the same name. Anyway, I digress. Our tool would compile the code, run unit tests, run acceptance tests and, if successful, publish a versioned installation package to an archive. Best of all, it ran automatically on every commit, and the code changes would only be merged into source control if the build pipeline succeeded. Lovely! A proper end-to-end build pipeline. If only we didn't have to struggle with maintaining our own bespoke build tool...

## Off the shelf tools

Onwards, to 2008. Another new job, and my first introduction to [Hudson](https://en.wikipedia.org/wiki/Hudson_(software)), later [Jenkins](https://jenkins.io/). At last, an off-the-shelf tool that was a joy to use! We defined [NAnt](https://en.wikipedia.org/wiki/NAnt) scripts to perform compilation, testing, test coverage reporting, deployment to test environments and generation of code quality metrics. We even automated database deployments, scripting up all our changes using [RoundhousE](https://github.com/chucknorris/roundhouse). A fully automated pipeline. Well, not quite: deploying our code to live was still a manual process, and filled me with dread every time.

I loved using Jenkins, and when I bought a home server a year or so later, I wanted to set up Jenkins so that I could use it on my own projects at home. My server ran Ubuntu and so this meant that I had to also set up and maintain a windows VM on which I built my code. Painful.

At my current employer, our build pipeline is actually not very different to what I used in 2008; we use [TeamCity](https://www.jetbrains.com/teamcity/) rather than Jenkins, and we use [psake](https://github.com/psake/psake) rather that Nant. Oh, and we use [Octopus](https://octopus.com/) to deploy the code to our servers, and to Azure. So, we truly do have an end-to-end build pipeline. Our cycle time is a matter of minutes for some of our smaller services. It's not perfect, but it works pretty well. Although, some of the tech is now fairly old, and theres a fair bit of infrastructure to support, and TeamCity doesn't come cheap...

## Pipelines in the cloud

So, 18 years from when the journey started, I find myself writing open source projects in .NET Core. I want a pipeline to run cross-platform, on Windows, Linux and MacOS. I want to automatically generate code coverage reports, and release notes. I want automatic versioning. I definitely don't want the pain of maintaining my own build server. Oh, and I don't want to pay a penny for any of it. 

How do I do this? With [Cake](http://cakebuild.net), [AppVeyor](https://www.appveyor.com/), [Travis](https://travis-ci.org/), [GitVersion](https://github.com/GitTools/GitVersion), [GitReleaseNotes](https://github.com/GitTools/GitReleaseNotes), [OpenCover](https://github.com/OpenCover/opencover) and [Coveralls](https://coveralls.io/). I'll go into the details in the next post.
