/* ==========================================================================
   Camada de acesso à API pública https://publica.cnpj.ws/cnpj/{cnpj}

   Estratégia:
   1) Tenta a chamada DIRETA do navegador (a API libera CORS);
   2) Em caso de falha de rede/CORS, tenta o proxy local (/api/cnpj)
      configurado no Vite (útil em desenvolvimento).

   A API permite 3 consultas por minuto por IP (HTTP 429).
   ========================================================================== */

export class ApiError extends Error {
  constructor(message, status = 0) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

const API_BASE = "https://publica.cnpj.ws/cnpj";
const PROXY_PATH = "/api/cnpj"; // proxy do Vite (vite.config.js)

export async function fetchCNPJ(digits) {
  const targets = [`${API_BASE}/${digits}`, `${PROXY_PATH}/${digits}`];
  let lastError = null;
  let sawRateLimit = false;

  for (const url of targets) {
    let res;
    try {
      res = await fetch(url, { headers: { Accept: "application/json" } });
    } catch {
      // Falha de rede/CORS — tenta o próximo alvo (proxy local).
      lastError = new ApiError(
        "Não foi possível conectar à API. Verifique sua conexão com a internet.",
        0
      );
      continue;
    }

    if (res.status === 404) {
      throw new ApiError(
        "CNPJ não encontrado na base pública da Receita Federal. Confira os dígitos e tente novamente.",
        404
      );
    }

    if (res.ok) {
      let body;
      try {
        body = await res.json();
      } catch {
        throw new ApiError(
          "A API retornou uma resposta que não é um JSON válido.",
          502
        );
      }
      if (
        body &&
        typeof body === "object" &&
        !Array.isArray(body) &&
        body.status &&
        Number(body.status) >= 400
      ) {
        throw new ApiError(
          body.detalhes || body.erro || body.message || "Erro retornado pela API.",
          Number(body.status)
        );
      }
      if (!body || typeof body !== "object" || Array.isArray(body)) {
        throw new ApiError("Resposta inesperada da API.", 502);
      }
      return body;
    }

    if (res.status === 429) sawRateLimit = true;
    lastError = new ApiError(
      `A API respondeu com o status HTTP ${res.status}.`,
      res.status
    );
  }

  if (sawRateLimit) {
    throw new ApiError(
      "Limite de consultas excedido: a API pública permite 3 consultas por minuto por IP. Aguarde um instante e tente novamente.",
      429
    );
  }
  throw lastError ?? new ApiError("Não foi possível contatar a API.", 0);
}
