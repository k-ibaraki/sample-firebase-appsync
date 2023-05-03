import { initializeApp } from "firebase/app";
import { getAuth, signInWithEmailAndPassword, getIdToken } from "firebase/auth";

// ここをfirebaseのコンソールから取れるソースコードの内容で上書きする
const firebaseConfig = {
  apiKey: "",
  authDomain: "",
  projectId: "",
  storageBucket: "",
  messagingSenderId: "",
  appId: "",
  measurementId: ""
};

// firebaseに登録しているユーザーのメールアドレスとパスワード
const email = '';
const password = '';


// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);

// メールアドレスとパスワードを使って認証

async function run() {

  const credential = await signInWithEmailAndPassword(auth, email, password);
  // IDトークン（JWT）取得
  const token = await getIdToken(credential.user, true);

  console.log(token);
}

run();
