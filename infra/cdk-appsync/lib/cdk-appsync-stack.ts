import * as cdk from 'aws-cdk-lib';
import * as appsync from 'aws-cdk-lib/aws-appsync';
import { Construct } from 'constructs';
import * as dotenv from 'dotenv';

dotenv.config();

const FIREBASE_PROJECT_ID = process.env.FIREBASE_PROJECT_ID ?? "";
const AZURE_COGNITIVE_SERVICES_URL = process.env.AZURE_COGNITIVE_SERVICES_URL ?? "";
const AZURE_COGNITIVE_SERVICES_KEY = process.env.AZURE_COGNITIVE_SERVICES_KEY ?? "";

export class AppsyncWithHttpResolverStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // Create a new AppSync API
    const api = new appsync.GraphqlApi(this, 'Api', {
      name: 'sampleFirebaseAppsync',
      schema: appsync.SchemaFile.fromAsset('./lib/schema.graphql'),
      authorizationConfig: {
        defaultAuthorization: {
          authorizationType: appsync.AuthorizationType.OIDC,
          openIdConnectConfig: {
            oidcProvider: `https://securetoken.google.com/${FIREBASE_PROJECT_ID}`,
          },
        },
      }
    });

    // Create a new HTTP data source with API key authentication
    const dataSource = api.addHttpDataSource('HttpDataSource', AZURE_COGNITIVE_SERVICES_URL, {
      description: 'HTTP data source for Azure Read API',
    });

    // Create a new resolver for the HTTP data source
    const readHttpResolver = dataSource.createResolver("ReadHttpResolver",
      {
        typeName: 'Mutation',
        fieldName: 'readRequest',
        requestMappingTemplate: appsync.MappingTemplate.fromString(`
          #set($apiKey = "${AZURE_COGNITIVE_SERVICES_KEY}")
          {
            "version": "2018-05-29",
            "method": "POST",
            "resourcePath": "/vision/v3.2/read/analyze",
            "params": {
              "headers": {
                "Ocp-Apim-Subscription-Key": "$apiKey",
                "Content-Type": "application/json"
              },
              "query": {
                "language": "ja",
                "model-version": "2022-04-30",
                "readingOrder": "natural"
              },
              "body": {
                "url" : "$ctx.args.url"
              }
            }
          }
        `),
        responseMappingTemplate: appsync.MappingTemplate.fromString(`
          #if($ctx.error)
            $util.error($ctx.error.message, $ctx.error.type)
          #end
          #if($ctx.result.statusCode == 202)
            { "requestId" : "$ctx.result.headers.apim-request-id" }
          #else
            $utils.appendError($ctx.result.body, "$ctx.result.statusCode")
          #end
        `),
      });

    const readResultHttpResolver = dataSource.createResolver("ReadResultHttpResolver",
      {
        typeName: 'Query',
        fieldName: 'readResult',
        requestMappingTemplate: appsync.MappingTemplate.fromString(`
          #set($apiKey = "${AZURE_COGNITIVE_SERVICES_KEY}")
          {
            "version": "2018-05-29",
            "method": "GET",
            "resourcePath": "/vision/v3.2/read/analyzeResults/$ctx.args.requestId",
            "params": {
              "headers": {
                "Ocp-Apim-Subscription-Key": "$apiKey",
                "Content-Type": "application/json"
              }
            }
          }
        `),
        responseMappingTemplate: appsync.MappingTemplate.fromString(`
          #if($ctx.error)
            $util.error($ctx.error.message, $ctx.error.type)
          #end
          #if($ctx.result.statusCode == 200)
            $ctx.result.body
          #else
            $utils.appendError($ctx.result.body, "$ctx.result.statusCode")
          #end
        `),
      });
  }
}
