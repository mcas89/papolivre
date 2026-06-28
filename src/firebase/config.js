// ===============================
// PapoLivre — Firebase Config
// Firestore   → salas + perfis
// Realtime DB → mensagens (tempo real)
// ===============================

import { initializeApp }       from "firebase/app";
import { getAuth }             from "firebase/auth";
import { getFirestore }        from "firebase/firestore";
import { getDatabase }         from "firebase/database";

const firebaseConfig = {
  apiKey:            "AIzaSyAW16M4uuyqjMGA0FeQPsG0YRx4H3qRFK8",
  authDomain:        "papolivre-4c8c9.firebaseapp.com",
  databaseURL:       "https://papolivre-4c8c9-default-rtdb.firebaseio.com",
  projectId:         "papolivre-4c8c9",
  storageBucket:     "papolivre-4c8c9.firebasestorage.app",
  messagingSenderId: "277668383692",
  appId:             "1:277668383692:web:6c04572dc6f6a6892e6b69",
};

const app  = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db   = getFirestore(app);   // Firestore — salas, usuários
export const rtdb = getDatabase(app);    // Realtime DB — mensagens

export default app;
