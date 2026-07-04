import { createContext, useContext, useState, useCallback } from "react";
import { AlertCircle } from "lucide-react";
import Button from "../components/ui/Button/Button";
import "./ConfirmContext.css";

const ConfirmContext = createContext();

export function ConfirmProvider({ children }) {
  const [confirmState, setConfirmState] = useState(null);

  const confirm = useCallback((message, title = "Confirmação") => {
    return new Promise((resolve) => {
      setConfirmState({
        title,
        message,
        onConfirm: () => {
          resolve(true);
          setConfirmState(null);
        },
        onCancel: () => {
          resolve(false);
          setConfirmState(null);
        }
      });
    });
  }, []);

  return (
    <ConfirmContext.Provider value={{ confirm }}>
      {children}
      {confirmState && (
        <div className="modal-overlay" onClick={confirmState.onCancel}>
          <div className="confirm-modal-content" onClick={e => e.stopPropagation()}>
            <div className="confirm-icon">
              <AlertCircle size={40} color="#f59e0b" />
            </div>
            <h2>{confirmState.title}</h2>
            <p>{confirmState.message}</p>
            <div className="confirm-actions">
              <Button variant="secondary" onClick={confirmState.onCancel}>
                Cancelar
              </Button>
              <Button variant="primary" onClick={confirmState.onConfirm}>
                Confirmar
              </Button>
            </div>
          </div>
        </div>
      )}
    </ConfirmContext.Provider>
  );
}

export function useConfirm() {
  return useContext(ConfirmContext);
}
