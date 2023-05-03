import * as cdk from 'aws-cdk-lib';
import * as appsync from 'aws-cdk-lib/aws-appsync';

const getUrlReadHttpResolver = (
  dataSource: cdk.aws_appsync.HttpDataSource,
  apiKey: string
): cdk.aws_appsync.Resolver => {
  return dataSource.createResolver("UrlReadHttpResolver", {
    typeName: 'Mutation',
    fieldName: 'readRequestUrl',
    requestMappingTemplate: appsync.MappingTemplate.fromString(`
      {
        "version": "2018-05-29",
        "method": "POST",
        "resourcePath": "/vision/v3.2/read/analyze",
        "params": {
          "headers": {
            "Ocp-Apim-Subscription-Key": "${apiKey}",
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
}

export default getUrlReadHttpResolver;