import * as cdk from 'aws-cdk-lib';
import * as appsync from 'aws-cdk-lib/aws-appsync';

const getReadResultHttpResolver = (
  dataSource: cdk.aws_appsync.HttpDataSource,
  apiKey: string
): cdk.aws_appsync.Resolver => {
  return dataSource.createResolver("ReadResultHttpResolver", {
    typeName: 'Query',
    fieldName: 'readResult',
    requestMappingTemplate: appsync.MappingTemplate.fromString(`
      #set($apiKey = "${apiKey}")
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

export default getReadResultHttpResolver;