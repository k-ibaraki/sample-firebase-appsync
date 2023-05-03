import * as cdk from 'aws-cdk-lib';
import * as appsync from 'aws-cdk-lib/aws-appsync';
import { Construct } from 'constructs';
import * as dotenv from 'dotenv';
import getUrlReadHttpResolver from './resolvers/getUrlReadHttpResolver';
import getReadResultHttpResolver from './resolvers/getReadResultHttpResolver';

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
    const urlReadHttpResolver = getUrlReadHttpResolver(
      dataSource, AZURE_COGNITIVE_SERVICES_KEY);
    const readResultHttpResolver = getReadResultHttpResolver(
      dataSource, AZURE_COGNITIVE_SERVICES_KEY);
  }
}
