import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

// Proxy /api/cnpj -> https://publica.cnpj.ws/cnpj
// Usado como fallback caso a chamada direta (browser -> API) falhe
// por CORS/rede. A API já libera CORS, então em geral a chamada
// direta do navegador funciona.
export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    host: true, // bind 0.0.0.0 (necessário para o preview)
    allowedHosts: true,
    port: 5173,
    proxy: {
      "/api/cnpj": {
        target: "https://publica.cnpj.ws",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/cnpj/, "/cnpj"),
      },
    },
  },
  preview: {
    host: true,
    allowedHosts: true,
  },
});
