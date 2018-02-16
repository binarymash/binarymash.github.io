---
layout: post
title: "Dot Net Build"
date: 2018-03-08 12:00:00 -0000
comments: true
tags: [msbuild]
---

It's fair to say that the .NET ecosystem has seen significant changes over the last few years. The tooling has The release of .NET Core in 2016

project.json
dnx dvm

Early adopters were felt the frustration of an ; 


Fragmentation. As things have evoloved
csproj/project.json/SDK-style csproj. We have anumber of options for building our code: msbuild; dotnet cli; Visual Studio; Visual Studio Code...


Thankfully, with the release of MSBuild 15 and dotnet SDK 1.0 in March 2017, things converged, though at first glance it is not obviously apparent how. How does the msbuild of .NET core relate to the msbuild of .NET Framework? And where does the dotnet cli fit into all of this?

There's several facets to MSBuild: fundamentally it is a build engine that defines an xml schema that describes how to process your code at build time; it has a stand-alone executable, msbuild.exe that you can use on the command line or on a build server to run the build process; Visual Studio also uses the MSBuild engine, but does not rely on MSBuild.exe. And then there's the dotnet cli...

If you look at the dotnet cli help you'll see a list of the default commands that it provides.

```
Phils-MBP:~ phil$ dotnet --help
.NET Command Line Tools (2.0.3)
Usage: dotnet [runtime-options] [path-to-application]
Usage: dotnet [sdk-options] [command] [arguments] [command-options]

path-to-application:
  The path to an application .dll file to execute.

SDK commands:
  new              Initialize .NET projects.
  restore          Restore dependencies specified in the .NET project.
  run              Compiles and immediately executes a .NET project.
  build            Builds a .NET project.
  publish          Publishes a .NET project for deployment (including the runtime).
  test             Runs unit tests using the test runner specified in the project.
  pack             Creates a NuGet package.
  migrate          Migrates a project.json based project to a msbuild based project.
  clean            Clean build output(s).
  sln              Modify solution (SLN) files.
  add              Add reference to the project.
  remove           Remove reference from the project.
  list             List reference in the project.
  nuget            Provides additional NuGet commands.
  msbuild          Runs Microsoft Build Engine (MSBuild).
  vstest           Runs Microsoft Test Execution Command Line Tool.

Common options:
  -v|--verbosity        Set the verbosity level of the command. Allowed values are q[uiet], m[inimal], n[ormal], d[etailed], and diag[nostic].
  -h|--help             Show help.

Run 'dotnet COMMAND --help' for more information on a command.

sdk-options:
  --version        Display .NET Core SDK version.
  --info           Display .NET Core information.
  -d|--diagnostics Enable diagnostic output.

runtime-options:
  --additionalprobingpath <path>    Path containing probing policy and assemblies to probe for.
  --fx-version <version>            Version of the installed Shared Framework to use to run the application.
  --roll-forward-on-no-candidate-fx Roll forward on no candidate shared framework is enabled.
  --additional-deps <path>          Path to additonal deps.json file.
```

So, it appears that the dotnet cli provides much of the same functionality as msbuild, and also provides other functionality that we don't get with MSBuild. It also has a command called msbuild. So, what's going on here? Well, the code for dotnet cli is open source, so we can take a look around the code to see how it works. 

The cli functionality is implemented using the command pattern - have a look at the code under https://github.com/dotnet/cli/tree/master/src/dotnet/commands.  For example, here's some of the code for the `clean` command, from https://github.com/dotnet/cli/blob/master/src/dotnet/commands/dotnet-clean/Program.cs:

```
public static CleanCommand FromArgs(string[] args, string msbuildPath = null)
{
    var msbuildArgs = new List<string>();
    var parser = Parser.Instance;
    var result = parser.ParseFrom("dotnet clean", args);
    result.ShowHelpOrErrorIfAppropriate();
    var parsedClean = result["dotnet"]["clean"];
    msbuildArgs.AddRange(parsedClean.Arguments);
    msbuildArgs.Add("/t:Clean");
    msbuildArgs.AddRange(parsedClean.OptionValuesToBeForwarded());
    return new CleanCommand(msbuildArgs, msbuildPath);
}
```

So, we can see that it is building a list of arguments for MSBuild - in this case, `/t:Clean`. Effectively, the dotnet cli clean command is just a wrapper around the core MSBuild engine.

In fact, many of the dotnet cli commands are wrappers around calls to msbuild.



The dotnet cli uses it's own copy of msbuild.dll. This is st

MSBuild was open sourced in March 2015 (https://blogs.msdn.microsoft.com/dotnet/2015/03/18/msbuild-engine-is-now-open-source-on-github/)

You can dotnet cli to build projects defined with the old style csproj, and use can use it to build projects that are defined with the new sdk-style csproj. However, it seems that there are some differences in dependencies; I had errors trying to build an asp.net with it; 




Dotnet                 | Msbuild                                    | Remarks                         
-----------------------|--------------------------------------------|---------------------------------
Add                    |                                            |         
-----------------------|--------------------------------------------|---------------------------------                        
Build                  | /t:Build                                   |  
-----------------------|--------------------------------------------|---------------------------------                                
Build --no-incremental | /t:Rebuild                                 |    
-----------------------|--------------------------------------------|---------------------------------                              
Clean                  | /t:clean                                   |                                 
-----------------------|--------------------------------------------|--------------------------------- 
Complete               |                                            |                                 
-----------------------|--------------------------------------------|--------------------------------- 
Help                   |                                            | Help!                           
-----------------------|--------------------------------------------|--------------------------------- 
List                   |                                            |                                 
-----------------------|--------------------------------------------|--------------------------------- 
Migrate                | -                                          |                                 
-----------------------|--------------------------------------------|--------------------------------- 
Msbuild                |                                            | Forwarding all                  
-----------------------|--------------------------------------------|--------------------------------- 
New                    |                                            |                                 
-----------------------|--------------------------------------------|--------------------------------- 
Nuget                  |                                            | Calls nuget?                    
-----------------------|--------------------------------------------|--------------------------------- 
Pack                   | /t:pack                                    |                                 
-----------------------|--------------------------------------------|--------------------------------- 
Publish                | /t:publish                                 |                                 
-----------------------|--------------------------------------------|--------------------------------- 
Remove                 |                                            |                                 
-----------------------|--------------------------------------------|--------------------------------- 
Restore                | /NoLogo /t:Restore                         |
                         /ConsoleLoggerParameters:Verbosity=Minimal |
-----------------------|--------------------------------------------|--------------------------------- 
Run                    | /nologo /verbosity:quiet                   |
                         /p:Configuration=   /p:TargetFramework     |                                 
-----------------------|--------------------------------------------|--------------------------------- 
Sln                    |                                            | Not in msbuild                  
-----------------------|--------------------------------------------|--------------------------------- 
Store                  | /t:ComposeStore                            |                                 
-----------------------|--------------------------------------------|--------------------------------- 
Test                   | /t:VSTest /v:quiet /nologo                 |                                 
-----------------------|--------------------------------------------|--------------------------------- 
Vstest                 |                                            


dotnet cli 


msbuild


##Conclusion



##References

https://github.com/dotnet/cli

https://docs.microsoft.com/en-us/dotnet/core/tools/cli-msbuild-architecture

https://stackoverflow.com/questions/43422488/relationship-between-the-dotnet-cli-and-the-new-vs2017-msbuild
