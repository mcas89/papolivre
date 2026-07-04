import {
  ref,
  push,
  query,
  onValue,
  onChildAdded,
  serverTimestamp,
  get,
  set,
  orderByChild,
  startAt,
  limitToLast
} from "firebase/database";
import { rtdb } from "../firebase/config";
import { EFFECTS_CATALOG } from "../constants/effectConstants";

// ============================================================
// HELPERS
// ============================================================

function effectsRef(roomId) {
  return ref(rtdb, `rooms/${roomId}/effects`);
}

function userCooldownRef(userId) {
  return ref(rtdb, `effect_cooldowns/${userId}`);
}

// ============================================================
// EFFECT SERVICE
// ============================================================

const effectService = {
  /**
   * Envia um efeito para a sala após validar permissões e cooldown
   */
  /**
   * Envia um efeito para a sala após validar permissões e cooldown
   * Aceita targetUserId e targetUserName para envio em canal privado
   */
  async sendEffect(roomId, effectId, user, targetUserId = null, targetUserName = null) {
    if (!roomId || !effectId || !user?.uid) {
      throw new Error("Parâmetros inválidos para envio de efeito.");
    }

    // 1. Validar se o efeito existe e está ativo
    const effect = EFFECTS_CATALOG.find(e => e.id === effectId);
    if (!effect || !effect.active) {
      throw new Error("Efeito inválido ou inativo.");
    }

    // 2. Validar permissões (Premium Pro ou Passe)
    const isPremium = !!user.isPremium;
    const isAnonymous = user.isAnonymous || user.anonymous;
    const now = Date.now();
    const hasPass = user.effectsPassUntil && user.effectsPassUntil.toMillis && (user.effectsPassUntil.toMillis() > now);

    if (isAnonymous) {
      throw new Error("Crie uma conta grátis para usar efeitos!");
    }

    if (effect.premiumOnly && !isPremium) {
      throw new Error("Exclusivo para Premium PRO.");
    }

    if (effect.requiresPass && !isPremium && !hasPass) {
      throw new Error("Compre um Passe de Efeitos ou seja Premium para usar!");
    }

    // 3. Validar Cooldown no Realtime Database (Global por usuário)
    const cooldownRef = userCooldownRef(user.uid);
    const cooldownSnap = await get(cooldownRef);
    
    if (cooldownSnap.exists()) {
      const lastEffectAt = cooldownSnap.val().lastEffectAt || 0;
      const timeSinceLastEffect = now - lastEffectAt;
      
      // Cooldown: Premium = 1 minuto (60000ms), Free = 3 minutos (180000ms)
      const cooldownMs = isPremium ? 60000 : 180000;
      
      if (timeSinceLastEffect < cooldownMs) {
        const remaining = Math.ceil((cooldownMs - timeSinceLastEffect) / 1000);
        
        // Formatar tempo de forma amigável
        const minutes = Math.floor(remaining / 60);
        const seconds = remaining % 60;
        const timeStr = minutes > 0 ? `${minutes}m e ${seconds}s` : `${seconds}s`;
        
        throw new Error(`Aguarde ${timeStr} para enviar outro efeito.`);
      }
    }

    // 4. Se passou em tudo, atualiza o cooldown e dispara o efeito
    await set(cooldownRef, {
      lastEffectAt: serverTimestamp()
    });

    const newEffect = {
      effectId: effect.id,
      userId: user.uid,
      userName: user.nickname || user.name || "Anônimo",
      targetUserId,
      targetUserName,
      timestamp: serverTimestamp(),
      duration: effect.duration
    };

    await push(effectsRef(roomId), newEffect);
    
    return { success: true };
  },

  /**
   * Listener isolado para efeitos. 
   * Retorna a função de unsubscribe.
   */
  subscribeToEffects(roomId, currentUser, callback) {
    if (!roomId || !currentUser) return () => {};

    const q = query(
      effectsRef(roomId),
      limitToLast(1)
    );

    let initialLoadComplete = false;

    // O onValue é usado apenas para saber quando a carga inicial (histórico) terminou
    const unsubValue = onValue(q, () => {
      initialLoadComplete = true;
      unsubValue();
    }, (err) => console.warn("RTDB Efeitos Histórico - Permissão Negada ou Erro:", err));

    const unsubChild = onChildAdded(q, (snapshot) => {
      // Ignora o último efeito histórico puxado na carga inicial
      if (!initialLoadComplete) return;

      const data = snapshot.val();
      
      // Filtro de privacidade
      if (data.targetUserId) {
        if (data.targetUserId !== currentUser.uid && data.userId !== currentUser.uid) {
          return;
        }
      }

      callback({ id: snapshot.key, ...data });
    }, (err) => console.warn("RTDB Efeitos Novo - Permissão Negada ou Erro:", err));

    return () => {
      unsubValue();
      unsubChild();
    };
  }
};

export default effectService;
