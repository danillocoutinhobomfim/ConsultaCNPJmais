/* ==========================================================================
   Utilitários de formatação, validação e contagem de campos
   ========================================================================== */

export const onlyDigits = (value) => String(value ?? "").replace(/\D/g, "");

/* ---------------------------- CNPJ / CPF --------------------------------- */

/** Aplica a máscara 00.000.000/0000-00 progressivamente enquanto digita. */
export function maskCNPJ(value) {
  const d = onlyDigits(value).slice(0, 14);
  if (d.length <= 2) return d;
  if (d.length <= 5) return `${d.slice(0, 2)}.${d.slice(2)}`;
  if (d.length <= 8) return `${d.slice(0, 2)}.${d.slice(2, 5)}.${d.slice(5)}`;
  if (d.length <= 12)
    return `${d.slice(0, 2)}.${d.slice(2, 5)}.${d.slice(5, 8)}/${d.slice(8)}`;
  return `${d.slice(0, 2)}.${d.slice(2, 5)}.${d.slice(5, 8)}/${d.slice(8, 12)}-${d.slice(12)}`;
}

export const maskCPF = (value) => {
  const d = onlyDigits(value).slice(0, 11);
  return d.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
};

/** Valida os dígitos verificadores de um CNPJ. */
export function isValidCNPJ(value) {
  const c = onlyDigits(value);
  if (c.length !== 14) return false;
  if (/^(\d)\1{13}$/.test(c)) return false; // sequências repetidas
  const calc = (base) => {
    let sum = 0;
    let weight = base.length - 7;
    for (let i = 0; i < base.length; i++) {
      sum += Number(base[i]) * weight--;
      if (weight < 2) weight = 9;
    }
    const rest = sum % 11;
    return rest < 2 ? 0 : 11 - rest;
  };
  if (calc(c.slice(0, 12)) !== Number(c[12])) return false;
  return calc(c.slice(0, 13)) === Number(c[13]);
}

export const fmtCNPJ = (value) => {
  const d = onlyDigits(value);
  return d.length === 14 ? maskCNPJ(d) : String(value ?? "");
};

/* -------------------------------- CEP ------------------------------------ */

export const fmtCEP = (value) => {
  const d = onlyDigits(value);
  return d.length === 8 ? `${d.slice(0, 5)}-${d.slice(5)}` : String(value ?? "");
};

/* ------------------------------ Telefone --------------------------------- */

export function fmtPhone(digits) {
  const d = onlyDigits(digits);
  if (d.length === 11) return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
  if (d.length === 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
  if (d.length === 9) return `${d.slice(0, 5)}-${d.slice(5)}`;
  if (d.length === 8) return `${d.slice(0, 4)}-${d.slice(4)}`;
  return String(digits ?? "");
}

/* -------------------------------- Datas ---------------------------------- */

const DATE_ONLY = /^\d{4}-\d{2}-\d{2}$/;
const ISO_FULL =
  /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(?::\d{2})?(?:\.\d+)?(?:Z|[+-]\d{2}:?\d{2})?$/;
const ISO_MIDNIGHT_UTC = /T00:00(?::00(?:\.0+)?)?Z$/;

export const isDateLike = (value) =>
  typeof value === "string" && (DATE_ONLY.test(value) || ISO_FULL.test(value));

export function fmtDate(value) {
  if (typeof value !== "string") return String(value ?? "");
  if (DATE_ONLY.test(value)) {
    const [y, m, d] = value.split("-");
    return `${d}/${m}/${y}`;
  }
  if (ISO_FULL.test(value)) {
    // Timestamps exatamente à meia-noite UTC costumam ser "só data" — evita
    // exibir o dia anterior (fuso -3) com hora zerada.
    if (ISO_MIDNIGHT_UTC.test(value)) {
      const [y, m, d] = value.slice(0, 10).split("-");
      return `${d}/${m}/${y}`;
    }
    const dt = new Date(value);
    if (!Number.isNaN(dt.getTime())) {
      const data = dt.toLocaleDateString("pt-BR");
      const hora = dt.toLocaleTimeString("pt-BR", {
        hour: "2-digit",
        minute: "2-digit",
      });
      return `${data} às ${hora}`;
    }
  }
  return value;
}

/* ----------------------------- Moeda (BRL) ------------------------------- */

export const fmtBRL = (number) =>
  Number(number).toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });

/* -------------------------- Tipos auxiliares ----------------------------- */

export const isScalar = (v) =>
  v === null ||
  v === undefined ||
  ["string", "number", "boolean", "bigint"].includes(typeof v);

export const isEmptyValue = (v) =>
  v === null || v === undefined || v === "";

/* ---------------------- Rótulos em português ----------------------------- */

const LABELS = {
  cnpj: "CNPJ",
  cnpj_formatado: "CNPJ",
  cnpj_raiz: "CNPJ Raiz",
  cnpj_ordem: "Ordem",
  cnpj_digito_verificador: "Dígito Verificador",
  razao_social: "Razão Social",
  capital_social: "Capital Social",
  responsavel_federativo: "Responsável Federativo",
  atualizado_em: "Atualizado em",
  porte: "Porte",
  natureza_juridica: "Natureza Jurídica",
  qualificacao_do_responsavel: "Qualificação do Responsável",
  socios: "Quadro Societário",
  simples: "Simples Nacional",
  mei: "MEI",
  data_opcao_simples: "Opção pelo Simples",
  data_exclusao_simples: "Exclusão do Simples",
  data_opcao_mei: "Opção pelo MEI",
  data_exclusao_mei: "Exclusão do MEI",
  estabelecimento: "Estabelecimento",
  atividades_secundarias: "Atividades Secundárias",
  atividade_principal: "Atividade Principal",
  tipo: "Tipo",
  tipo_logradouro: "Tipo de Logradouro",
  nome_fantasia: "Nome Fantasia",
  situacao_cadastral: "Situação Cadastral",
  data_situacao_cadastral: "Data da Situação Cadastral",
  data_inicio_atividade: "Início da Atividade",
  nome_cidade_exterior: "Cidade no Exterior",
  logradouro: "Logradouro",
  numero: "Número",
  complemento: "Complemento",
  bairro: "Bairro",
  cep: "CEP",
  ddd1: "DDD 1",
  ddd2: "DDD 2",
  ddd_fax: "DDD do Fax",
  telefone1: "Telefone 1",
  telefone2: "Telefone 2",
  fax: "Fax",
  email: "E-mail",
  situacao_especial: "Situação Especial",
  data_situacao_especial: "Data da Situação Especial",
  pais: "País",
  pais_id: "ID do País",
  estado: "Estado",
  cidade: "Cidade",
  motivo: "Motivo",
  motivo_situacao_cadastral: "Motivo da Situação Cadastral",
  inscricoes_estaduais: "Inscrições Estaduais",
  inscricao_estadual: "Inscrição Estadual",
  observacao: "Observação",
  id: "ID",
  descricao: "Descrição",
  secao: "Seção",
  divisao: "Divisão",
  grupo: "Grupo",
  classe: "Classe",
  subclasse: "Subclasse",
  nome: "Nome",
  sigla: "Sigla",
  ibge_id: "Código IBGE",
  siafi_id: "Código SIAFI",
  comex_id: "Código Comex",
  iso2: "Código ISO 2",
  iso3: "Código ISO 3",
  cpf_cnpj_socio: "CPF/CNPJ do Sócio",
  data_entrada: "Data de Entrada",
  cpf_representante_legal: "CPF do Representante Legal",
  nome_representante: "Nome do Representante Legal",
  faixa_etaria: "Faixa Etária",
  qualificacao_socio: "Qualificação do Sócio",
  qualificacao_representante: "Qualificação do Representante",
  socio: "Sócio",
  ativo: "Ativo",
  situacao: "Situação",
};

/** Rótulo amigável para uma chave do JSON (dicionário + fallback). */
export function labelFor(key) {
  const k = String(key);
  if (LABELS[k]) return LABELS[k];
  const clean = k.replace(/_/g, " ").trim();
  return clean.charAt(0).toUpperCase() + clean.slice(1);
}

/* --------------------- Contador de campos preenchidos -------------------- */

/**
 * Percorre recursivamente o JSON contando "folhas" (campos).
 * Preenchido = qualquer valor não nulo/undefined/string vazia.
 * Arrays vazios contam como 1 campo vazio.
 */
export function countFields(root) {
  let total = 0;
  let filled = 0;
  const walk = (v) => {
    if (v === null || typeof v !== "object") {
      total += 1;
      if (v !== null && v !== undefined && v !== "") filled += 1;
      return;
    }
    if (Array.isArray(v)) {
      if (v.length === 0) {
        total += 1;
        return;
      }
      v.forEach(walk);
      return;
    }
    Object.values(v).forEach(walk);
  };
  walk(root);
  return { total, filled };
}
