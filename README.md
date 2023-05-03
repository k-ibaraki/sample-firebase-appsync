# sample-firebase-appsync
`Azure Cognitive Service` の Read API を使って OCR を実施するGraphQLのAPIを、
`AWS AppSync` で構築して、
`Firebase Authentication` で認証を付けました。

![](./doc/architecture.drawio.svg)

## 構築手順
1. Firebase Authenticationを使える状態にしておく
2. Azure Cognitive Serviceを使える状態にしておく
3. `cd cdk-appsync` : 移動
4. `cp .env.sample .env` : .envを用意
5. `.env`にFirebaseとAzureの必要な情報を入れる
6. `npm run build` : ビルド
7. `cdk deploy` : デプロイ

