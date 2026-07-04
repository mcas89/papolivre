import React, { createContext, useContext, useEffect, useState } from "react";
import { collection, doc, onSnapshot, getDocs } from "firebase/firestore";
import { db } from "../firebase/config";

const SystemContext = createContext();

export function SystemProvider({ children }) {
  const [status, setStatus] = useState({
    maintenanceMode: false,
    registrationsEnabled: true,
    chatEnabled: true,
    effectsEnabled: true,
    giftsEnabled: true
  });
  
  const [settings, setSettings] = useState({
    premiumPrice: 10,
    roomPrice: 10,
    renewRoomPrice: 8,
    giftRose: 1,
    giftCoffee: 2,
    giftChocolate: 3,
    effectsCooldownFree: 180,
    effectsCooldownPremium: 60
  });

  useEffect(() => {
    // 1. Escutar Status Global em tempo real
    const statusRef = doc(db, "system_status", "global");
    const unsubStatus = onSnapshot(
      statusRef, 
      (docSnap) => {
        if (docSnap.exists()) {
          setStatus(docSnap.data());
        }
      },
      (err) => {
        console.warn("Firestore status global - Permissão Negada ou Erro:", err);
      }
    );

    // 2. Escutar Configurações em tempo real
    // Como são poucos documentos (aprox 8-10), onSnapshot na coleção é leve.
    const settingsCol = collection(db, "system_settings");
    const unsubSettings = onSnapshot(
      settingsCol, 
      (snapshot) => {
        const newSettings = { ...settings }; // mantém os defaults como base
        snapshot.forEach(docSnap => {
          const data = docSnap.data();
          if (data.key && data.value !== undefined) {
            newSettings[data.key] = data.value;
          }
        });
        setSettings(newSettings);
      },
      (err) => {
        console.warn("Firestore settings - Permissão Negada ou Erro:", err);
      }
    );

    return () => {
      unsubStatus();
      unsubSettings();
    };
  }, []);


  // TELA PRETA DE MANUTENÇÃO
  if (status.maintenanceMode) {
    return (
      <div style={{ 
        display: 'flex', 
        flexDirection: 'column',
        justifyContent: 'center', 
        alignItems: 'center', 
        height: '100vh', 
        backgroundColor: '#0f172a', 
        color: '#fff',
        padding: '2rem',
        textAlign: 'center'
      }}>
        <h1 style={{ color: '#fbbf24', marginBottom: '1rem' }}>Em Manutenção</h1>
        <p style={{ color: '#94a3b8', fontSize: '1.1rem', maxWidth: '400px' }}>
          O PapoLivre está temporariamente offline para atualizações de segurança e melhorias. 
          Por favor, tente acessar novamente mais tarde.
        </p>
      </div>
    );
  }

  return (
    <SystemContext.Provider value={{ status, settings }}>
      {children}
    </SystemContext.Provider>
  );
}

export function useSystem() {
  return useContext(SystemContext);
}
