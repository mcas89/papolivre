import { createContext, useContext, useState, useCallback } from "react";
import { CheckCircle, XCircle, Info, X } from "lucide-react";
import "./ToastContext.css";

const ToastContext = createContext();

export function ToastProvider({ children }) {
  const [toast, setToast] = useState(null);

  const showToast = useCallback((message, type = "info") => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 4000); // Esconde depois de 4 segundos
  }, []);

  const closeToast = () => setToast(null);

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {toast && (
        <div className={`global-toast toast-${toast.type}`}>
          <div className="toast-icon">
            {toast.type === "success" && <CheckCircle size={20} />}
            {toast.type === "error" && <XCircle size={20} />}
            {toast.type === "info" && <Info size={20} />}
          </div>
          <div className="toast-content">{toast.message}</div>
          <button className="toast-close" onClick={closeToast}>
            <X size={16} />
          </button>
        </div>
      )}
    </ToastContext.Provider>
  );
}

export function useToast() {
  return useContext(ToastContext);
}
