import { createContext, useContext, useEffect, useState } from "react";

import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInAnonymously,
  signOut,
  updateProfile,
  sendPasswordResetEmail,
  deleteUser,
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
        const userDocRef = doc(db, "users", firebaseUser.uid);
        
        // Atualiza lastLogin apenas ao abrir o app (uso ativo)
        setDoc(userDocRef, { lastLogin: serverTimestamp() }, { merge: true }).catch(() => {});

        // Escuta perfil em tempo real no Firestore
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
              isAnonymous: firebaseUser.isAnonymous,
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
      isAnonymous: true,
      location:  location || null,
      createdAt: serverTimestamp(),
      lastLogin: serverTimestamp(),
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
      isAnonymous: false,
      createdAt: serverTimestamp(),
      lastLogin: serverTimestamp(),
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
    const currentUser = auth.currentUser;
    if (currentUser?.isAnonymous) {
      try {
        // Remove do Firestore
        await deleteDoc(doc(db, "users", currentUser.uid));
        // Remove do Firebase Auth
        await deleteUser(currentUser);
        // O deleteUser já faz sign out automático e limpa a sessão.
        return;
      } catch (err) {
        console.error("Erro ao remover doc/auth de usuário anônimo:", err);
      }
    }
    await signOut(auth);
  }

  // ----------------------------------------------------------
  // RECUPERAÇÃO DE SENHA
  // ----------------------------------------------------------
  async function resetPassword(email) {
    if (!email) throw new Error("E-mail não fornecido.");
    await sendPasswordResetEmail(auth, email);
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
    resetPassword,
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