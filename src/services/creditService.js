import {
  doc,
  collection,
  runTransaction,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "../firebase/config";
import { CREDIT_TYPE } from "../constants/creditConstants";

/**
 * PapoLivre Credit Service - V2.0 Economy Foundation
 * All credit transactions must pass through this service to ensure atomicity
 * and to maintain a consistent history log.
 */
const creditService = {
  /**
   * Generates a new transaction ID using Firestore's built-in id generator
   */
  _generateTransactionId() {
    return doc(collection(db, "credits_history")).id;
  },

  /**
   * Internal helper to process a transaction
   */
  async _processTransaction(userId, amount, reason, source, type, adminId = null, additionalUpdates = {}) {
    if (!userId || !amount || amount <= 0 || !reason || !source) {
      throw new Error("INVALID_TRANSACTION_PARAMS");
    }

    const userRef = doc(db, "users", userId);
    const transactionId = this._generateTransactionId();
    const historyRef = doc(db, "credits_history", transactionId);

    return await runTransaction(db, async (transaction) => {
      const userDoc = await transaction.get(userRef);
      if (!userDoc.exists()) {
        throw new Error("USER_NOT_FOUND");
      }

      const currentBalance = userDoc.data().credits || 0;
      let newBalance = currentBalance;

      if (type === CREDIT_TYPE.IN) {
        newBalance += amount;
      } else if (type === CREDIT_TYPE.OUT) {
        newBalance -= amount;
        if (newBalance < 0) {
          throw new Error("SALDO_INSUFICIENTE");
        }
      }

      // 1. Atualizar saldo e campos extras
      const updates = { ...additionalUpdates, credits: newBalance };
      transaction.update(userRef, updates);

      // 2. Registrar histórico
      const historyEntry = {
        transactionId,
        userId,
        type,
        amount,
        reason,
        source,
        balanceBefore: currentBalance,
        balanceAfter: newBalance,
        timestamp: serverTimestamp(),
      };

      if (adminId) {
        historyEntry.adminUser = adminId;
      }

      transaction.set(historyRef, historyEntry);

      return {
        success: true,
        transactionId,
        balanceBefore: currentBalance,
        balanceAfter: newBalance,
      };
    });
  },

  /**
   * Get current credits (reads direct from Firestore if needed, but Context is preferred for UI)
   */
  async getCredits(userId) {
    // This is a direct read. In React, prefer using AuthContext's user.credits.
    const { getDoc } = await import("firebase/firestore");
    const docSnap = await getDoc(doc(db, "users", userId));
    if (docSnap.exists()) {
      return docSnap.data().credits || 0;
    }
    return 0;
  },

  /**
   * Add credits to a user
   */
  async addCredits(userId, amount, reason, source, adminId = null) {
    return await this._processTransaction(userId, amount, reason, source, CREDIT_TYPE.IN, adminId);
  },

  /**
   * Remove credits from a user (spend)
   * Accepts optional additionalUpdates to perform atomic updates (e.g., setting proUntil)
   */
  async removeCredits(userId, amount, reason, source, additionalUpdates = {}) {
    return await this._processTransaction(userId, amount, reason, source, CREDIT_TYPE.OUT, null, additionalUpdates);
  },

  /**
   * Refund a transaction
   * @todo Implement logic to reverse a specific transaction ID in the future
   */
  async refundCredits(transactionId, reason, adminId) {
    console.warn("refundCredits is a stub prepared for future implementation.");
    // 1. Fetch transactionId
    // 2. Verify it hasn't been refunded
    // 3. Process inverse transaction
    throw new Error("NOT_IMPLEMENTED");
  },

  /**
   * Rollback a transaction
   * @todo Fallback for complex errors
   */
  async rollbackTransaction(transactionId) {
    console.warn("rollbackTransaction is a stub prepared for future implementation.");
    throw new Error("NOT_IMPLEMENTED");
  },

  // ============================================================
  // USER METHODS
  // ============================================================
  async getUserHistory(userId) {
    const { getDocs, query, where, orderBy } = await import("firebase/firestore");
    const q = query(
      collection(db, "credits_history"),
      where("userId", "==", userId),
      orderBy("timestamp", "desc")
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  },

  // ============================================================
  // ADMIN METHODS
  // ============================================================
  async adminAddCredits(userId, amount, reason, adminId) {
    return await this.addCredits(userId, amount, reason, "ADMIN", adminId);
  },

  async adminRemoveCredits(userId, amount, reason, adminId) {
    return await this._processTransaction(userId, amount, reason, "ADMIN", CREDIT_TYPE.OUT, adminId);
  },
  
  async adminGetHistory(userId = null) {
    const { getDocs, query, where, orderBy } = await import("firebase/firestore");
    let q;
    if (userId) {
      q = query(
        collection(db, "credits_history"),
        where("userId", "==", userId),
        orderBy("timestamp", "desc")
      );
    } else {
      q = query(
        collection(db, "credits_history"),
        orderBy("timestamp", "desc")
      );
    }

    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  }
};

export default creditService;
