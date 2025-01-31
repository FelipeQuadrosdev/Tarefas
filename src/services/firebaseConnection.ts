import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAz8ffY-pRI9HD_yJUh0F6LxEVUqgWeT7c",
  authDomain: "tarefaplus-77bb7.firebaseapp.com",
  projectId: "tarefaplus-77bb7",
  storageBucket: "tarefaplus-77bb7.firebasestorage.app",
  messagingSenderId: "532075404010",
  appId: "1:532075404010:web:27538f73cd78b6ef819593"
};


const app = initializeApp(firebaseConfig);
const db = getFirestore(app)

export { db }