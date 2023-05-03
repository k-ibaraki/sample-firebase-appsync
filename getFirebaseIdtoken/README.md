# getFirebase ID Token

## これなに？

Firebase認証のテスト用作ったツールです。
雑にFirebaseで認証してidtokenの取得します。

# 使い方

- 事前にFirebase上でやる
  - Firebaseプロジェクト上でwebアプリを追加しておく
  - Firebase Authentication上に適当にパスワード認証のユーザーを作っておく

- 設定
  1. `_index.js`を`index.js`にコピー
  2. index.jsの`firebaseConfig`を正しい値で上書きする
     - Firebase上でwebアプリを作成すると表示されるコードからコピペしてくればOKです
  3. index.jsの`email`と`password`にFirebaseのユーザー情報を入れる

- インストール
```
npm i
```
- 起動
```
npm start
```