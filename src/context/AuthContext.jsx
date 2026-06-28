import { createContext, useContext, useEffect, useState } from "react";

import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInAnonymously,
  signOut,
  updateProfile,
} from "firebase/auth";

import {
  doc,
  setDoc,
  getDoc,
  serverTimestamp,
  onSnapshot,
  collection,
  getDocs,
  query,
  where,
  deleteDoc,
  Timestamp,
} from "firebase/firestore";

import { auth, db } from "../firebase/config";

// ============================================================
// Context
// ============================================================

const AuthContext = createContext();

// ============================================================
// Provider
// ============================================================

export function AuthProvider({ children }) {

  const [user,    setUser]    = useState(null);
  const [loading, setLoading] = useState(true);

  // ----------------------------------------------------------
  // Escuta mudanças de autenticação (Firebase cuida da sessão)
  // ----------------------------------------------------------
  useEffect(() => {
    let unsubFirestore = null;

    const unsubscribeAuth = onAuthStateChanged(auth, async (firebaseUser) => {
      if (unsubFirestore) {
        unsubFirestore();
        unsubFirestore = null;
      }

      if (firebaseUser) {
        // Escuta perfil em tempo real no Firestore
        const userDocRef = doc(db, "users", firebaseUser.uid);
        
        unsubFirestore = onSnapshot(userDocRef, (docSnap) => {
          if (docSnap.exists()) {
            const data = docSnap.data();
            const proUntilMillis = data.proUntil ? data.proUntil.toMillis() : 0;
            const isPremium = proUntilMillis > Date.now();
            setUser({ uid: firebaseUser.uid, ...data, isPremium });
          } else {
            // Usuário anônimo ou sem perfil salvo ainda — dados mínimos do Auth
            setUser({
              uid:    firebaseUser.uid,
              name:   firebaseUser.displayName || "Anônimo",
              email:  firebaseUser.email || "",
              avatar: firebaseUser.photoURL || null,
              anonymous: firebaseUser.isAnonymous,
              connectedRooms: [],
              credits: 0,
              proUntil: null,
              isPremium: false,
            });
          }
          setLoading(false);
        }, (err) => {
          console.error("Erro no onSnapshot do usuário:", err);
          setLoading(false);
        });

      } else {
        setUser(null);
        setLoading(false);
      }
    });

    return () => {
      unsubscribeAuth();
      if (unsubFirestore) unsubFirestore();
    };

  }, []);

  // ----------------------------------------------------------
  // LIMPEZA DE ANÔNIMOS INATIVOS (roda uma vez ao abrir o app)
  // Apaga os perfis do Firestore de usuários anônimos que não
  // fazem login há mais de 24 horas.
  // Nota: o registro no Firebase Auth permanece, mas fica inativo
  // e sem dados no Firestore (o app trata esse caso graciosamente).
  // ----------------------------------------------------------
  useEffect(() => {
    async function cleanupStaleAnonymous() {
      try {
        const cutoffMillis = Date.now() - 24 * 60 * 60 * 1000;
        const q = query(
          collection(db, "users"),
          where("anonymous", "==", true)
        );
        const snap = await getDocs(q);
        
        const deletes = [];
        snap.docs.forEach((d) => {
          const data = d.data();
          // Se lastSeen for nulo (perfil muito antigo) ou menor que o cutoff, apaga
          const lastSeenMillis = data.lastSeen ? data.lastSeen.toMillis() : 0;
          if (lastSeenMillis < cutoffMillis) {
            deletes.push(deleteDoc(d.ref));
          }
        });
        
        await Promise.all(deletes);
        if (deletes.length > 0) {
          console.log(`[Auth] ${deletes.length} perfis anônimos inativos removidos do Firestore.`);
        }
      } catch (err) {
        // Falha silenciosa — não impede o uso do app
        console.warn("[Auth] Erro na limpeza de anônimos:", err);
      }
    }

    cleanupStaleAnonymous();
  }, []);


  // ----------------------------------------------------------
  // LOGIN — email/senha
  // ----------------------------------------------------------
  async function login({ email, password, location }) {

    const credential = await signInWithEmailAndPassword(auth, email, password);

    // Atualiza localização a cada login (opcional)
    if (location) {
      await setDoc(
        doc(db, "users", credential.user.uid),
        { location, lastLogin: serverTimestamp() },
        { merge: true }
      );
    }

  }

  async function loginAnonymous({ nickname, avatar, location } = {}) {

    const credential = await signInAnonymously(auth);

    const anonProfile = {
      uid:       credential.user.uid,
      name:      nickname || "Anônimo",
      nickname:  nickname || "Anônimo",
      avatar:    avatar   || "👦🏼",
      anonymous: true,
      location:  location || null,
      createdAt: serverTimestamp(),
      lastSeen:  serverTimestamp(),
      connectedRooms: [],
      credits: 0,
      proUntil: null,
    };

    // Atualiza o displayName e photoURL no Auth para compatibilidade
    await updateProfile(credential.user, {
      displayName: nickname || "Anônimo",
      photoURL: avatar || "👦🏻"
    });

    await setDoc(doc(db, "users", credential.user.uid), anonProfile);

  }

  // ----------------------------------------------------------
  // REGISTRO — email/senha + perfil no Firestore
  // ----------------------------------------------------------
  async function register({ name, nickname, email, password, gender, city, birthdate, age, location }) {

    const credential = await createUserWithEmailAndPassword(auth, email, password);

    // Atualiza displayName no Firebase Auth
    await updateProfile(credential.user, { displayName: nickname });

    // Salva perfil completo no Firestore
    const profileData = {
      uid:       credential.user.uid,
      name,
      nickname,
      email,
      gender,
      city,
      birthdate,
      age,
      location:  location || null,
      avatar:    null,
      anonymous: false,
      createdAt: serverTimestamp(),
      connectedRooms: [],
      credits: 0,
      proUntil: null,
    };

    await setDoc(doc(db, "users", credential.user.uid), profileData);

  }

  // ----------------------------------------------------------
  // LOGOUT
  // ----------------------------------------------------------
  async function logout() {
    await signOut(auth);
  }

  // ----------------------------------------------------------
  // Contexto
  // ----------------------------------------------------------
  const value = {
    user,
    loading,
    isAuthenticated: !!user,
    login,
    loginAnonymous,
    register,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );

}

export function useAuth() {
  return useContext(AuthContext);
}