import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import "./index.css";

/* -------------------------------------------------------------------------
   ErrorBoundary: se qualquer componente quebrar em runtime, exibe uma
   mensagem visível (em CSS puro) em vez de uma página totalmente branca.
   ------------------------------------------------------------------------- */
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, info) {
    // Registro opcional em serviço de monitoramento (Sentry etc.)
    console.error("Erro capturado pelo ErrorBoundary:", error, info);
  }

  render() {
    if (this.state.error) {
      return (
        <div
          style={{
            fontFamily:
              "ui-sans-serif, system-ui, -apple-system, 'Segoe UI', Roboto, Arial, sans-serif",
            minHeight: "100vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "#f1f5f9",
            padding: "24px",
          }}
        >
          <div
            style={{
              maxWidth: "560px",
              width: "100%",
              backgroundColor: "#ffffff",
              border: "1px solid #e2e8f0",
              borderRadius: "16px",
              padding: "28px",
              boxShadow: "0 10px 25px rgba(15, 23, 42, 0.08)",
            }}
          >
            <div style={{ fontSize: "34px", lineHeight: 1 }}>⚠️</div>
            <h1
              style={{
                margin: "12px 0 4px",
                fontSize: "20px",
                fontWeight: 700,
                color: "#0f172a",
              }}
            >
              ConsultaCNPJ+ · Erro inesperado
            </h1>
            <p style={{ margin: "0 0 16px", fontSize: "14px", color: "#475569" }}>
              Algo quebrou durante a renderização. A mensagem técnica está
              abaixo — normalmente recarregar a página resolve.
            </p>
            <pre
              style={{
                margin: "0 0 18px",
                padding: "12px 14px",
                backgroundColor: "#f8fafc",
                border: "1px solid #e2e8f0",
                borderRadius: "10px",
                fontSize: "12px",
                color: "#b91c1c",
                whiteSpace: "pre-wrap",
                wordBreak: "break-word",
                maxHeight: "180px",
                overflow: "auto",
              }}
            >
              {String(this.state.error?.message ?? this.state.error)}
            </pre>
            <button
              type="button"
              onClick={() => window.location.reload()}
              style={{
                backgroundColor: "#4f46e5",
                color: "#ffffff",
                border: "none",
                borderRadius: "10px",
                padding: "10px 20px",
                fontSize: "14px",
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              Recarregar página
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>
);
