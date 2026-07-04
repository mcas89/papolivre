import { db } from "../firebase/config";
import { collection, doc, setDoc, getDocs, query, where, orderBy, runTransaction, serverTimestamp } from "firebase/firestore";
import creditService from "./creditService";
import { GIFTS_CATALOG } from "../constants/giftConstants";

const isAnonymous = (user) => {
  return !user || user.isAnonymous || user.anonymous;
};

const checkAnonymous = (user) => {
  if (isAnonymous(user)) {
    throw new Error("Crie uma conta gratuita para utilizar o sistema de presentes do PapoLivre.");
  }
};

const giftService = {
  /**
   * Envio Privado (direto para um usuário)
   */
  async sendPrivateGift(roomId, sender, receiverId, receiverName, giftId) {
    checkAnonymous(sender);
    if (!receiverId || receiverId === sender.uid) throw new Error("Destinatário inválido.");
    
    const giftDef = GIFTS_CATALOG.find(g => g.id === giftId);
    if (!giftDef || !giftDef.active) throw new Error("Presente inválido.");

    // Desconta os créditos
    await creditService.removeCredits(
      sender.uid, 
      giftDef.cost, 
      `Envio Privado: ${giftDef.name} para ${receiverName}`, 
      "GIFT_SEND"
    );

    const giftDocRef = doc(collection(db, "gifts"));
    const giftData = {
      id: giftDocRef.id,
      giftType: giftDef.id,
      cost: giftDef.cost,
      coinValue: giftDef.coinValue || 0,
      senderId: sender.uid,
      senderName: sender.nickname || sender.name || "Usuário",
      receiverId: receiverId,
      roomId: roomId,
      status: "claimed", // privados já nascem "pegos"
      claimedBy: receiverId,
      createdAt: serverTimestamp(),
      origin: "Privado"
    };

    await setDoc(giftDocRef, giftData);
    
    // Envia mensagem no chat
    const { default: chatService } = await import("./chatService");
    await chatService.sendMessage(roomId, {
      userId: sender.uid,
      userName: sender.nickname || sender.name || "Usuário",
      userAvatar: sender.photoURL || sender.avatar || null,
      userPremium: !!sender.isPremium,
      text: `${giftDef.icon} ${sender.nickname || sender.name} enviou um(a) ${giftDef.name} para ${receiverName}.`,
      type: "gift",
      private: true,
      targetUser: receiverId,
      targetUserName: receiverName
    });

    return giftData;
  },

  /**
   * Drop Público (na sala)
   */
  async dropPublicGift(roomId, sender, giftId) {
    checkAnonymous(sender);
    const giftDef = GIFTS_CATALOG.find(g => g.id === giftId);
    if (!giftDef || !giftDef.active) throw new Error("Presente inválido.");

    // Desconta os créditos
    await creditService.removeCredits(
      sender.uid, 
      giftDef.cost, 
      `Drop Público: ${giftDef.name} na sala`, 
      "GIFT_DROP"
    );

    const giftDocRef = doc(collection(db, "gifts"));
    const expiresAt = new Date(Date.now() + 10 * 1000); // 10 segundos

    const giftData = {
      id: giftDocRef.id,
      giftType: giftDef.id,
      cost: giftDef.cost,
      coinValue: giftDef.coinValue || 0,
      senderId: sender.uid,
      senderName: sender.nickname || sender.name || "Usuário",
      roomId: roomId,
      status: "dropped",
      expiresAt: expiresAt, // Local Date obj, Firestore converte automaticamente
      createdAt: serverTimestamp(),
      origin: "Público"
    };

    await setDoc(giftDocRef, giftData);
    return giftData;
  },

  /**
   * Capturar Presente Público
   */
  async claimPublicGift(giftId, claimerUser) {
    checkAnonymous(claimerUser);
    
    const giftRef = doc(db, "gifts", giftId);

    // Usa Transaction para impedir que 2 cliquem no mesmo ms e ganhem
    return await runTransaction(db, async (transaction) => {
      const giftDoc = await transaction.get(giftRef);
      if (!giftDoc.exists()) {
        throw new Error("Presente não encontrado.");
      }

      const data = giftDoc.data();
      if (data.status !== "dropped") {
        throw new Error("Este presente já foi pego.");
      }
      
      const now = new Date().getTime();
      const expiresTime = data.expiresAt?.toMillis ? data.expiresAt.toMillis() : new Date(data.expiresAt).getTime();
      
      if (expiresTime && now > expiresTime) {
         throw new Error("Este presente expirou.");
      }

      if (data.senderId === claimerUser.uid) {
         throw new Error("Você não pode resgatar o seu próprio presente.");
      }

      const claimerName = claimerUser.nickname || claimerUser.name || "Usuário";

      transaction.update(giftRef, {
        status: "claimed",
        claimedBy: claimerUser.uid,
        receiverId: claimerUser.uid
      });

      return { ...data, claimedBy: claimerUser.uid, claimerName };
    }).then(async (result) => {
       // Mensagem pós-captura
       const { default: chatService } = await import("./chatService");
       await chatService.sendMessage(result.roomId, {
          userId: claimerUser.uid, 
          userName: result.claimerName,
          userAvatar: claimerUser.photoURL || claimerUser.avatar || null,
          userPremium: !!claimerUser.isPremium,
          text: `🎁 ${result.claimerName} recebeu o presente de ${result.senderName}.`,
          type: "gift"
       });
       return result;
    });
  },

  /**
   * Converter Coins em Créditos (Lote)
   * A cada 2 coins = 1 crédito
   */
  async convertCoinsToCredits(userId) {
    if (!userId) throw new Error("Usuário inválido.");

    // 1. Calcula o total de coins ganhos (lendo todos os presentes)
    const q = query(collection(db, "gifts"), where("receiverId", "==", userId));
    const snap = await getDocs(q);
    
    let totalEarnedCoins = 0;
    snap.forEach(doc => {
       const data = doc.data();
       const giftDef = GIFTS_CATALOG.find(cat => cat.id === data.giftType);
       const val = giftDef ? giftDef.coinValue : 0;
       totalEarnedCoins += val;
    });

    // 2. Transação para converter o saldo com segurança
    const userRef = doc(db, "users", userId);
    const transactionId = doc(collection(db, "credits_history")).id;
    const historyRef = doc(db, "credits_history", transactionId);

    return await runTransaction(db, async (transaction) => {
       const userDoc = await transaction.get(userRef);
       if (!userDoc.exists()) throw new Error("Usuário não encontrado.");
       
       const data = userDoc.data();
       const convertedCoins = data.convertedGiftCoins || 0;
       const currentCredits = data.credits || 0;
       
       const availableCoins = totalEarnedCoins - convertedCoins;
       if (availableCoins < 2) throw new Error("Você precisa de pelo menos 2 Coins para converter.");
       
       const creditsToGive = Math.floor(availableCoins / 2);
       const coinsToConsume = creditsToGive * 2;
       
       const newCredits = currentCredits + creditsToGive;
       const newConvertedCoins = convertedCoins + coinsToConsume;
       
       // Atualiza saldo e coins consumidos
       transaction.update(userRef, {
         credits: newCredits,
         convertedGiftCoins: newConvertedCoins
       });
       
       // Registra no histórico da carteira
       transaction.set(historyRef, {
         transactionId,
         userId,
         type: "IN",
         amount: creditsToGive,
         reason: "Conversão de Presentes",
         source: "GIFT_CONVERSION",
         balanceBefore: currentCredits,
         balanceAfter: newCredits,
         timestamp: serverTimestamp()
       });
       
       return { credits: creditsToGive, consumed: coinsToConsume, remaining: availableCoins - coinsToConsume };
    });
  },

  /**
   * Histórico da Carteira
   */
  async getUserGifts(userId) {
    const q = query(
      collection(db, "gifts"),
      where("receiverId", "==", userId)
    );
    const snap = await getDocs(q);
    const gifts = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    
    // Ordenar localmente pelo mais recente para não exigir Composite Index no Firestore
    gifts.sort((a, b) => {
      const timeA = a.createdAt?.toMillis ? a.createdAt.toMillis() : (a.createdAt || 0);
      const timeB = b.createdAt?.toMillis ? b.createdAt.toMillis() : (b.createdAt || 0);
      return timeB - timeA;
    });
    
    return gifts;
  }
};

export default giftService;
