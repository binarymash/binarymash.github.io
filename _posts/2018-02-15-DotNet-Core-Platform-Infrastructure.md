---
layout: post
title: ".NET Core Platform Infrastructure"
description: "What do the .NET Core SDK and Runtime packages install, and to where?"
date: 2018-02-15 12:00:00 -0000
comments: true
tags: [.NET Core]

---

I've been using .NET Core for a few years now: I think the first version I installed was ASP.NET 5 beta 6, in mid 2015. I've installed a lot of different verions since then - my SDK folder currently contains 14 different versions - but it occurred to me recently that I've never really looked at *what* is being installed. So, I thought I'd take a quick look.

## Installation Packages

The installation packages come in two different flavours: Runtime and SDK. Here's what each of them contains:

- The Runtime packages supplies the dependencies you need to run an application built with .NET Core, including a `dotnet` command to execute the application. 
- The SDK package includes everything from the Runtime package, and additionally the dependencies you need to build a .NET Core application. It also provides a `dotnet` command, but in this case it is the full .NET command line tool which allows us to build, restore, package, etc.

As is often the case, a diagram can describe more concisely the relationship between the SDK and Runtime packages:

{% include figure.html 
  url="/assets/images/dotnet-core-packages.png" 
  alt="A diagram showing the relationship between the SDK and Runtime packages" 
  caption=".NET Core installation packages" 
%}

Note that the SDK and Runtime have different version numbers. At the time of writing, the latest SDK is 2.1.4; the latest Runtime is 2.0.5, even when installed via the SDK package[^1]. 

## Installation on the Filesystem

Regardless of whether you are installing the SDK or the Runtime package, everything is installed to the same location on your filesystem. However, the exact location of this is dependent upon the platform you are installing to: 

- on Windows, the installation directory is `c:\Program Files\dotnet`
- on MacOS it is `/usr/share/local/dotnet`
- on Linux it is `/usr/share/dotnet`[^2]

Regardless of the platform you're installing on, once we're in the `dotnet` folder everything is nicely consistent across all platforms. Here it is on my MacBook; we see exactly the same folders on Ubuntu and Windows too.

{% include figure.html 
  url="/assets/images/dotnet-core-macos.png" 
  alt="A screenshot showing the contents of the .NET Core installation directory on MacOS" 
  caption=".NET Core installation on MacOS" 
%}

There's a lot of stuff here, and it's not immediately apparent what all of it does. Let's break it down based on what is providing it.

From the Runtime installation...

- `dotnet` - executes the .NET Core application. This is not the full .NET Command Line Tools
- `host` - contains hostfxr.dll, involved in bootstrapping the execution of a .NET Core application[^3] 
- `shared` - contains each installed version of the runtime libraries, organised by version number

Additionally from the SDK installtion...

- `additionalDeps` - contains dependency manifest (deps.json) files. These define dependencies for assemblies dynamically injected at runtime[^4]
- `dotnet` - the .NET Command Line Tools
- `sdk` - contains each installed version of the SDK libraries, organised by version number
- `store` - the [runtime package store](https://docs.microsoft.com/en-us/dotnet/core/deploying/runtime-store). This allows us to pre-install package dependencies on a machine, reducing the size of our packaged application. Packages can be installed in here using the `dotnet store` command.

Again, let's summarise this in a diagram:

{% include figure.html 
  url="/assets/images/dotnet-core-filesystem.png" 
  alt="A diagram showing a breakdown of the .NET Core installation on the filesystem" 
  caption=".NET Core installation on the filesystem" 
%}

So, there we go. No great revelations, but a mildly interesting diversion that helps fill a small gap of knowledge. It was interesting to read about the additionalDeps folder. Every application we build has a deps.json, generated automatically for us by the build system. I need to do a bit more reading to really understand how the dependency manifest mechanism works, and when I need to actually care about it.

### Footnotes

[^1]: The .NET Core repo on GitHub has a full [release history](https://github.com/dotnet/core/blob/master/release-notes/download-archive.md) of the installation packages, including release notes
[^2]: I tested on Ubuntu 14.04. Actually, the location on depends on how you install it. If you install via `apt-get`, it is installed into `/usr/share/dotnet`. However, if you follow the instructions for installing the `tar.gz` file then you'll end up with an installation at `$HOME/dotnet`
[^3]: Matt Warren has written a [post](http://mattwarren.org/2016/07/04/How-the-dotnet-CLI-tooling-runs-your-code/) about how the CLI tooling runs a .NET Core application 
[^4]: I believe that [this](https://github.com/dotnet/core-setup/issues/1597) is the GitHub issue for the implementation of this functionality