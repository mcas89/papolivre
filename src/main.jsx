import React from "react";
import ReactDOM from "react-dom/client";

import App from "./App";

import "@fontsource/inter";

import "./styles/reset.css";
import "./styles/variables.css";
import "./styles/globals.css";
import "./styles/typography.css";
import "./styles/animations.css";
import "./styles/light.css";
import "./styles/dark.css";

import { ChatProvider } from "./context/ChatContext";
import { AuthProvider } from "./context/AuthContext";
import { SystemProvider } from "./context/SystemContext";
import { ToastProvider } from "./context/ToastContext";
import { ConfirmProvider } from "./context/ConfirmContext";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>

    <SystemProvider>
      <ToastProvider>
        <AuthProvider>
          <ConfirmProvider>
            <ChatProvider>
              <App />
            </ChatProvider>
          </ConfirmProvider>
        </AuthProvider>
      </ToastProvider>
    </SystemProvider>

  </React.StrictMode>
);