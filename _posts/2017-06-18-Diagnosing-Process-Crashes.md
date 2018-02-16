---
layout: post
title: "Diagnosing Process Crashes, or, What To Do When Computers Choose To Hate Us"
description: "Microsoft's Debug Diagnostic Tool is a valuable resource when troubleshooting mysterious crashes. Here is how we used it to identify a mysterious crash."
date: 2017-06-18 12:00:00 -0000
comments: true
tags: [Debug Diagnostics]
keywords: "Debug Diagnostics, debugging, asp.net, crash, exception, iis"
---

By their very nature computers are deterministic. We tell them what to do, and they unquestioningly follow our orders, repeatably and consistently. This is what makes us techies the happy, contented people that we are; we are the masters of our machines.

Then, it all stops working, for no reason, and at the worst possible time. And we conclude that computers hate us.

We recently added a new endpoint to an existing service, an ASP.NET web API running on IIS. This was a very simple endpoint: it retrieved some data from our database, updated it and then saved it. The implementation also introduced some new technology, [entity framework core](https://docs.microsoft.com/en-us/ef/core/), so we had a number of new DLLs being pulled into our service.

The new code worked just fine on our development machines, and after going through our build pipeline and onto our acceptance and integration environments it was all looking good. 

And then it failed on our staging environment.

Something was going wrong, and we had no idea why. Was it our code? Probably not, because it worked on other environments. Was it an environment issue? Maybe. But, all the existing endpoints on the service still worked ok; this problem was specific to our new code.

## When logging alone is not enough

Our service contained a decent amount of logging, including some global exception handling to trap any unexpected behaviour. So, this would log whatever was going wrong, right?

Wrong. There was nothing, although we did see some logs relating to service start-up, right *after* we hit the endpoint. So, it appeared that the endpoint was killing and then restarting the service! Uh-oh. That wasn't a good sign.

We peeked at the server's Application logs...

```
15:27:10
Faulting application name: w3wp.exe, version: 8.5.9600.16384, time stamp: 0x5215df96
Faulting module name: MSVCR120.dll, version: 12.0.21005.1, time stamp: 0x524f83ff
Exception code: 0xc0000409
Fault offset: 0x000000000006dd27
Faulting process id: 0x709c
Faulting application start time: 0x01d2e5e2ff5dd5cf
Faulting application path: c:\windows\system32\inetsrv\w3wp.exe
Faulting module path: C:\Windows\SYSTEM32\MSVCR120.dll
Report Id: b759f33e-51d6-11e7-80d2-0050569e5760
Faulting package full name: 
Faulting package-relative application ID:
```

```xml
<Event xmlns="http://schemas.microsoft.com/win/2004/08/events/event">
  <System>
    <Provider Name="Application Error" /> 
    <EventID Qualifiers="0">1000</EventID> 
    <Level>2</Level> 
    <Task>100</Task> 
    <Keywords>0x80000000000000</Keywords> 
    <TimeCreated SystemTime="2017-06-15T14:27:10.000000000Z" /> 
    <EventRecordID>525920</EventRecordID> 
    <Channel>Application</Channel> 
    <Computer>[REDACTED]</Computer> 
    <Security /> 
  </System>
  <EventData>
    <Data>w3wp.exe</Data> 
    <Data>8.5.9600.16384</Data> 
    <Data>5215df96</Data> 
    <Data>MSVCR120.dll</Data> 
    <Data>12.0.21005.1</Data> 
    <Data>524f83ff</Data> 
    <Data>c0000409</Data> 
    <Data>000000000006dd27</Data> 
    <Data>709c</Data> 
    <Data>01d2e5e2ff5dd5cf</Data> 
    <Data>c:\windows\system32\inetsrv\w3wp.exe</Data> 
    <Data>C:\Windows\SYSTEM32\MSVCR120.dll</Data> 
    <Data>b759f33e-51d6-11e7-80d2-0050569e5760</Data> 
    <Data /> 
    <Data /> 
  </EventData>
</Event>
```

Something blowing up in msvcr120.dll, the C runtime. 

What did the System event log tell us?

```
The Windows Error Reporting Service service entered the running state.
 
15:27:23
A process serving application pool '[Redacted]' suffered a fatal communication error with the Windows Process Activation Service. The process id was '28828'. The data field contains the error number.

```

```xml
<Event xmlns="http://schemas.microsoft.com/win/2004/08/events/event">
  <System>
    <Provider Name="Microsoft-Windows-WAS" Guid="{524B5D04-133C-4A62-8362-64E8EDB9CE40}" EventSourceName="WAS" /> 
    <EventID Qualifiers="32768">5011</EventID> 
    <Version>0</Version> 
    <Level>3</Level> 
    <Task>0</Task> 
    <Opcode>0</Opcode> 
    <Keywords>0x80000000000000</Keywords> 
    <TimeCreated SystemTime="2017-06-15T14:27:23.000000000Z" /> 
    <EventRecordID>272960</EventRecordID> 
    <Correlation /> 
    <Execution ProcessID="0" ThreadID="0" /> 
    <Channel>System</Channel> 
    <Computer>[REDACTED]</Computer> 
    <Security /> 
  </System>
  <EventData>
    <Data Name="AppPoolID">[REDACTED]</Data> 
    <Data Name="ProcessID">28828</Data> 
    <Binary>6D000780</Binary> 
  </EventData>
</Event>
```

So, the logs really didn't have very much to go on. We knew something was blowing up in msvcr120.dll, but absolutely no clues as to what. What was our next option?

## Debug Diagnostics

The [Debug Diagnostics Tool](https://blogs.msdn.microsoft.com/debugdiag/), from Microsoft, was designed to diagnose issues in IIS, although it can also be used on any Windows process. It provides a large amount of information about the state of a process, and is particuarly useful if, as in our case, the process dies unexpectedly. I won't go into how to use it here, as this is documented [elsewhere](https://blogs.msdn.microsoft.com/debugdiag/2013/03/15/debug-diag-blog-post-series-from-my-french-iis-colleagues/). 

The Debug Diagnostics Tool helpfully provided a call stack of our process at the moment it died. Here's an extract from the top of the stack:

```
msvcr120!_invoke_watson+17
msvcr120!_invalid_parameter+64
msvcr120!_invalid_parameter_noinfo+19
msvcr120!_vswprintf_s_l+6b
msvcr120!vswprintf_s+11
AppDynamics_Profiler_x64!DllUnregisterServer+c3e8
AppDynamics_Profiler_x64!DllUnregisterServer+a62e
AppDynamics_Profiler_x64!DllUnregisterServer+a434
clr!EEToProfInterfaceImpl::JITCompilationStarted+85
clr!MethodDesc::MakeJitWorker+3630d8
clr!MethodDesc::DoPrestub+a5c
clr!PreStubWorker+3cc
[[PrestubMethodFrame] (Microsoft.EntityFrameworkCore.Query.Internal.SqlServerQueryModelVisitor..ctor)] Microsoft.EntityFrameworkCore.Query.Internal.SqlServerQueryModelVisitor..ctor(Microsoft.EntityFrameworkCore.Query.Internal.IQueryOptimizer, Microsoft.EntityFrameworkCore.Query.ExpressionVisitors.Internal.INavigationRewritingExpressionVisitorFactory, Microsoft.EntityFrameworkCore.Query.ExpressionVisitors.Internal.ISubQueryMemberPushDownExpressionVisitor, Microsoft.EntityFrameworkCore.Query.ExpressionVisitors.Internal.IQuerySourceTracingExpressionVisitorFactory, Microsoft.EntityFrameworkCore.Query.ExpressionVisitors.Internal.IEntityResultFindingExpressionVisitorFactory, Microsoft.EntityFrameworkCore.Query.ExpressionVisitors.Internal.ITaskBlockingExpressionVisitor, Microsoft.EntityFrameworkCore.Query.ExpressionVisitors.Internal.IMemberAccessBindingExpressionVisitorFactory, Microsoft.EntityFrameworkCore.Query.ExpressionVisitors.Internal.IOrderingExpressionVisitorFactory, Microsoft.EntityFrameworkCore.Query.ExpressionVisitors.IProjectionExpressionVisitorFactory, Microsoft.EntityFrameworkCore.Query.ExpressionVisitors.IEntityQueryableExpressionVisitorFactory, Microsoft.EntityFrameworkCore.Query.Internal.IQueryAnnotationExtractor, Microsoft.EntityFrameworkCore.Query.IResultOperatorHandler, Microsoft.EntityFrameworkCore.Metadata.Internal.IEntityMaterializerSource, Microsoft.EntityFrameworkCore.Query.Internal.IExpressionPrinter, Microsoft.EntityFrameworkCore.Metadata.IRelationalAnnotationProvider, Microsoft.EntityFrameworkCore.Query.ExpressionVisitors.Internal.IIncludeExpressionVisitorFactory, Microsoft.EntityFrameworkCore.Query.ExpressionVisitors.ISqlTranslatingExpressionVisitorFactory, Microsoft.EntityFrameworkCore.Query.ExpressionVisitors.Internal.ICompositePredicateExpressionVisitorFactory, Microsoft.EntityFrameworkCore.Query.ExpressionVisitors.Internal.IConditionalRemovingExpressionVisitorFactory, Microsoft.EntityFrameworkCore.Query.ExpressionVisitors.Internal.IQueryFlattenerFactory, Microsoft.EntityFrameworkCore.Infrastructure.IDbContextOptions, Microsoft.EntityFrameworkCore.Query.RelationalQueryCompilationContext, Microsoft.EntityFrameworkCore.Query.Internal.SqlServerQueryModelVisitor)
clr!ThePreStub+55
Microsoft.EntityFrameworkCore.Query.Internal.SqlServerQueryModelVisitorFactory.Create(Microsoft.EntityFrameworkCore.Query.QueryCompilationContext, Microsoft.EntityFrameworkCore.Query.EntityQueryModelVisitor)+347
Microsoft.EntityFrameworkCore.Query.RelationalQueryCompilationContext.CreateQueryModelVisitor(Microsoft.EntityFrameworkCore.Query.EntityQueryModelVisitor)+11
Microsoft.EntityFrameworkCore.Query.RelationalQueryCompilationContext.CreateQueryModelVisitor()+11
Microsoft.EntityFrameworkCore.Storage.Database.CompileQuery[[System.__Canon, mscorlib]](Remotion.Linq.QueryModel)+34
Microsoft.EntityFrameworkCore.Query.Internal.QueryCompiler.CompileQueryCore[[System.__Canon, mscorlib]](System.Linq.Expressions.Expression, Remotion.Linq.Parsing.Structure.INodeTypeProvider, Microsoft.EntityFrameworkCore.Storage.IDatabase, Microsoft.Extensions.Logging.ILogger, System.Type)+17c
Microsoft.EntityFrameworkCore.Query.Internal.QueryCompiler+<>c__DisplayClass19_0`1[[System.__Canon, mscorlib]].<CompileQuery>b__0()+71
Microsoft.EntityFrameworkCore.Query.Internal.CompiledQueryCache.GetOrAddQueryCore[[System.__Canon, mscorlib]](System.Object, System.Func`1<System.Func`2<Microsoft.EntityFrameworkCore.Query.QueryContext,System.__Canon>>)+8f
Microsoft.EntityFrameworkCore.Query.Internal.QueryCompiler.Execute[[System.__Canon, mscorlib]](System.Linq.Expressions.Expression)+9c
... //another 100 items on the stack below here
```

Once again we could see the problem occurred in msvcr120.dll. We could now also see that our service appeared to be blowing up during the Entity Framework Core query. And there was some stuff going on in [AppDynamics](https://www.appdynamics.co.uk/) shortly before it died. AppDynamics is a tool we use to provide application performance management and monitoring; each server in our environment has an AppDynamics agent service running to report various metrics about the performance and health of the server and the services running on the server. It's a powerful tool that gives us a lot of useful information about our systems. In fact, the very same errors we saw in the server event logs were also visible in AppDynamics. 

Looking at this stack trace, it was difficult to know exactly where the normal behaviour finished and the error behaviour started. And so, we turned to the internet for help. A quick google for AppDynamics and mscvr120 brought up this result...

[Applications with very long method signatures may crash in 4.3.0 or 4.3.1.0](https://docs.appdynamics.com/display/PAA/Support+Advisory+-+Applications+with+very+long+method+signatures+may+crash+in+4.3.0+or+4.3.1.0)

Aha! That sounded interesting, a bug in certain versions of the AppDynamics agent. Our agent was on version 4.3.1.0, one of the affected versions. So, with a sense irrational optimism, we disabled the AppDynamics agent on our server, and hit the troublesome endpoint and... success! It worked! 

AppDynamics itself was causing the problem, presumably because something in the new DLLs we were using triggered the bug. A quick upgrade to the latest AppDynamics agent followed, and the service all worked beautifully. 

## It's a love/hate relationship

Sometimes things go wrong in ways that we have no hope of understanding on our own. Isolating the problem can be a challenge, but our chances of doing so are greatly improved if we know that there are tools available to help us.

Without the stack trace from Debug Diagnostics, it would have been very difficult to isolate the problem in any logical way. With trial and error we may have stumbled across the solution in days, or maybe weeks. More likely we would have given up on a bad job, and reverted to older technology, and sworn never to use Entity Framework Core ever again.

As it happens, thanks to the Debug Diagnostics Tool, our problem was resolved within an hour or two. What's not to love about that?