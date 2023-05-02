import * as cdk from 'aws-cdk-lib';
import * as appsync from 'aws-cdk-lib/aws-appsync';
import * as ssm from 'aws-cdk-lib/aws-ssm';
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

    // Create a new ssm parameter for the API key
    const parameterName = 'sampleAzureReadApiKey';
    new ssm.StringParameter(this, 'ApiKeyParameter', {
      parameterName,
      stringValue: AZURE_COGNITIVE_SERVICES_KEY,
    });




    // Create a new HTTP data source with API key authentication
    const dataSource = api.addHttpDataSource('HttpDataSource', AZURE_COGNITIVE_SERVICES_URL, {
      description: 'HTTP data source for Azure Read API',
    });

    // Create a new resolver for the HTTP data source
    const httpResolver = dataSource.createResolver("GetDataResolver",
      {
        typeName: 'Mutation',
        fieldName: 'analyze',
        requestMappingTemplate: appsync.MappingTemplate.fromString(`
        #set($apiKey = $util.aws.ssmautomation("${parameterName}"))
        {
          "version": "2018-05-29",
          "method": "POST",
          "resourcePath": "vision/v3.2/read/analyze",
          "params": {
            "headers": {
              "Ocp-Apim-Subscription-Key": "$apiKey",
              "Content-Type": "application/octet-stream",
            },
            "query": {
              "language": "ja",
              "model-version": "2022-04-30",
              "readingOrder": ""natural"",
            },
            "body": "$ctx.args.data"
          }
        }
      `),
        responseMappingTemplate: appsync.MappingTemplate.fromString(`
          #if($ctx.result.statusCode == 200)
            $ctx.result.body
          #else
            $utils.appendError($ctx.result.body, "$ctx.result.statusCode")
          #end
        `),
      });
  }
}
