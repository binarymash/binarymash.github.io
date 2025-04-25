---
layout: post
title: "Lambdas and .NET"
description: "Where "
date: 2021-01-01 11:02:00 -0000
comments: true
tags: [AWS, Lamba, Serverless, .NET]
keywords: "AWS, Lambda, Serverless, .NET, dotnet core, dotnet"

---

# Introduction


## Development

Before we look at 

### Tooling


The AWS cli. We don't need to use this at development time, but we might want to use it later when it comes to publishing our lambdas to AWS.

#### AWS Toolkit for Visual Studio

AWS Toolkit for Visual Studio (https://aws.amazon.com/visualstudio/) is a Visual Studio extension that provides integration with all things AWS. It slso includes .net templates


#### Amazon.Lambda.Templates

If you're not using the AWS Toolkit you can get access to the same AWS templates by installing

```
dotnet new -i Amazon.Lambda.Templates
```

After installing, we can list the templates available to us...

```
$ dotnet new -l
Templates                                                 Short Name                                        Language          Tags
----------------------------------------------------      --------------------------------------------      ------------      ----------------------
Order Flowers Chatbot Tutorial                            lambda.OrderFlowersChatbot                        [C#]              AWS/Lambda/Function
Lambda Custom Runtime Function (.NET 5)                   lambda.CustomRuntimeFunction                      [C#], F#          AWS/Lambda/Function
Lambda Detect Image Labels                                lambda.DetectImageLabels                          [C#], F#          AWS/Lambda/Function
Lambda Empty Function                                     lambda.EmptyFunction                              [C#], F#          AWS/Lambda/Function
Lambda Empty Function (.NET 5 Container Image)            lambda.image.EmptyFunction                        [C#], F#          AWS/Lambda/Function
Lex Book Trip Sample                                      lambda.LexBookTripSample                          [C#]              AWS/Lambda/Function
Lambda Simple Application Load Balancer Function          lambda.SimpleApplicationLoadBalancerFunction      [C#]              AWS/Lambda/Function
Lambda Simple DynamoDB Function                           lambda.DynamoDB                                   [C#], F#          AWS/Lambda/Function
Lambda Simple Kinesis Firehose Function                   lambda.KinesisFirehose                            [C#]              AWS/Lambda/Function
Lambda Simple Kinesis Function                            lambda.Kinesis                                    [C#], F#          AWS/Lambda/Function
Lambda Simple S3 Function                                 lambda.S3                                         [C#], F#          AWS/Lambda/Function
Lambda Simple SNS Function                                lambda.SNS                                        [C#]              AWS/Lambda/Function
Lambda Simple SQS Function                                lambda.SQS                                        [C#]              AWS/Lambda/Function
Lambda ASP.NET Core Web API                               serverless.AspNetCoreWebAPI                       [C#], F#          AWS/Lambda/Serverless
Lambda ASP.NET Core Web API (.NET 5 Container Image)      serverless.image.AspNetCoreWebAPI                 [C#], F#          AWS/Lambda/Serverless
Lambda ASP.NET Core Web Application with Razor Pages      serverless.AspNetCoreWebApp                       [C#]              AWS/Lambda/Serverless
Serverless Detect Image Labels                            serverless.DetectImageLabels                      [C#], F#          AWS/Lambda/Serverless
Lambda DynamoDB Blog API                                  serverless.DynamoDBBlogAPI                        [C#]              AWS/Lambda/Serverless
Lambda Empty Serverless                                   serverless.EmptyServerless                        [C#], F#          AWS/Lambda/Serverless
Lambda Empty Serverless (.NET 5 Container Image)          serverless.image.EmptyServerless                  [C#], F#          AWS/Lambda/Serverless
Lambda Giraffe Web App                                    serverless.Giraffe                                F#                AWS/Lambda/Serverless
Serverless Simple S3 Function                             serverless.S3                                     [C#], F#          AWS/Lambda/Serverless
Step Functions Hello World                                serverless.StepFunctionsHelloWorld                [C#], F#          AWS/Lambda/Serverless
Serverless WebSocket API                                  serverless.WebSocketAPI                           [C#]              AWS/Lambda/Serverless
...
```

#### Amazon.Lambda.Tools

The AWS Lambda dotnet global tool compliments the AWS CLI with functionality.

```
dotnet tool update -g Amazon.Lambda.Tools
```


```
$ dotnet lambda
Amazon Lambda Tools for .NET Core applications (5.0.0)
Project Home: https://github.com/aws/aws-extensions-for-dotnet-cli, https://github.com/aws/aws-lambda-dotnet

Commands to deploy and manage AWS Lambda functions:

        deploy-function         Command to deploy the project to AWS Lambda
        invoke-function         Command to invoke a function in Lambda with an optional input
        list-functions          Command to list all your Lambda functions
        delete-function         Command to delete a Lambda function
        get-function-config     Command to get the current runtime configuration for a Lambda function
        update-function-config  Command to update the runtime configuration for a Lambda function

Commands to deploy and manage AWS Serverless applications using AWS CloudFormation:

        deploy-serverless       Command to deploy an AWS Serverless application
        list-serverless         Command to list all your AWS Serverless applications
        delete-serverless       Command to delete an AWS Serverless application

Commands to publish and manage AWS Lambda Layers:

        publish-layer           Command to publish a Layer that can be associated with a Lambda function
        list-layers             Command to list Layers
        list-layer-versions     Command to list versions for a Layer
        get-layer-version       Command to get the details of a Layer version
        delete-layer-version    Command to delete a version of a Layer

Other Commands:

        package                 Command to package a Lambda project either into a zip file or docker image if --package-type is set to "image". The output can later be deployed to Lambda with either deploy-function command or with another tool.
        package-ci              Command to use as part of a continuous integration system.
        push-image              Build Lambda Docker image and push the image to Amazon ECR.

To get help on individual commands execute:
        dotnet lambda help <command>

```

As this is a dotnet tool, it can be installed locally in your repository using a tool manifest file. By adding it in this way you can ensure that 

#### Mock Lambda Test Tool

https://github.com/aws/aws-lambda-dotnet/tree/master/Tools/LambdaTestTool#versions-of-the-tool

The Mock Lambda Test Tool is a dotnet global tool that launches a lambda and lets us send requests to it via a web front end. This is useful at development time to help manually test and debug our lambda. 
#TODO: runtime support?

The tool installed as part of the AWS Toolkit in Visual Studio, or can be installed manually. There are different versions of the tool for different runtimes 

```
dotnet tool install -g Amazon.Lambda.TestTool-3.1
```

It is possible to configure a launch setting in Visual Studio or Visual Studio Code so that the we can run the tool direct from our code editor.

### Packaging

Until recently, the only real option for packaging a lambda was to create a zip file containing our code. We'd have to choose one of the supported runtimes, or create our own custom runtime. AWS provides runtimes for LTS versions of .net core (2.1, 3.1) and, going forward, .net (6.0, sscheduled to be released in November 2021). If we didn't want to use an LTS, we'd have to create our own custom runtime. 

All this changed in December 2020, when containierized lambdas were announced.

### Architecture

Lambdas are triggered by some kind of event in AWS. This could be a web request from an application load balancer, or an API gateway; it might be an event from SQS, or a Dynamo DB stream; it could be a scheduled event that runs on some periodic basis. However our lambda is triggered, we need to create a handler that receives the event and then performs whatever functionality we require. This gives us yet more decisions to make.


### Empty function in pre-defined runtime

The simplest function we can create is by using the empty function template. In Visual Studio 2019
dotnet new lambda.EmptyFunction -n MyLambda


- The csproj contains references to a couple of AWS packages
  - Amazon.Lambda.Core provides core lambda functionality
  - Amazon.Lambda.Serialization.SystemTextJson
- 
- aws

If you have the AWS Toolkit installed, we also get the Mock Lambda Test Tool bootstrapped for us:
- launchSettings.json has a profile 

dotnet lambda package -c Release -pl ./MyLambda -o ./MyLambda.zip

26kB

### Custom runtime

Amazon.Lambda.RuntimeSupport
Lambda now has a main function which creates a bootstrapper for our function handler. 
published package size is now 31918KB; our dotnet runtime is now included in the zip package.
No launch settings provided for mock lambda test tool.

<AssemblyName>bootstrap</AssemblyName> to force the output assembly to be named bootstrap.dll. This is the default name searched for by the AWS when using a custom runtime. If we were to remove this, and attempt to invoke our function, we'd get an error:

```
{
  "errorMessage": "RequestId: 9a9d3dc4-b826-4538-8b23-0571fd6aa24f Error: Couldn't find valid bootstrap(s): [/var/task/bootstrap /opt/bootstrap]",
  "errorType": "Runtime.InvalidEntrypoint"
}
```
If want to use a custom name for our assembly, we can do so by adding a shell script in a file named `bootstrap`, and including this as content in our project. The contents of the script should be `/var/task/<assemblyName>`. For example:

```
#!/bin/sh
/var/task/MyLambda
```

#### Containers


ECR must be on the same AWS account as the lambda that is using it, which means that if you're using 