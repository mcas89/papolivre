import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../firebase/config";

const reportService = {
  async createReport(reportData) {
    try {
      const reportsRef = collection(db, "reports");
      await addDoc(reportsRef, {
        reportedUser: reportData.reportedUser, 
        reportedMessage: reportData.reportedMessage || null, 
        reportedBy: reportData.reportedBy, 
        roomId: reportData.roomId || null,
        reason: reportData.reason || "Outros",
        status: "pending",
        createdAt: serverTimestamp()
      });
      return { success: true };
    } catch (error) {
      console.error("Error creating report:", error);
      throw error;
    }
  }
};

export default reportService;
