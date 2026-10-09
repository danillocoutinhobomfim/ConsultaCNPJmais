import { useCallback, useMemo, useState } from "react";
import { countFields, isValidCNPJ, maskCNPJ, onlyDigits } from "./lib/format.js";
import { fetchCNPJ } from "./lib/api.js";
import SummaryCard from "./components/SummaryCard.jsx";
import DynamicData from "./components/DynamicJson.jsx";
import RawJson from "./components/RawJson.jsx";
import {
  EmptyState,
  ErrorAlert,
  LoadingSkeleton,
  SearchForm,
} from "./components/States.jsx";
import { PrinterIcon } from "./components/Icons.jsx";

export default function App() {
  const [input, setInput] = useState("");
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [inputError, setInputError] = useState(null);
  const [apiError, setApiError] = useState(null);

  /* Contador de campos preenchidos do JSON atual */
  const stats = useMemo(() => (data ? countFields(data) : null), [data]);

  const handleChange = useCallback((value) => {
    setInput(maskCNPJ(value));
    setInputError(null);
  }, []);

  const handleClear = useCallback(() => {
    setInput("");
    setInputError(null);
  }, []);

  const runQuery = useCallback(async (digits) => {
    setLoading(true);
    setData(null);
    setApiError(null);
    setInputError(null);
    try {
      const json = await fetchCNPJ(digits);
      setData(json);
    } catch (err) {
      setApiError({
        message: err?.message || "Erro inesperado ao consultar a API.",
        status: err?.status ?? 0,
      });
    } finally {
      setLoading(false);
    }
  }, []);

  const handleSubmit = useCallback(
    (event) => {
      event.preventDefault();
      if (loading) return;
      const digits = onlyDigits(input);
      if (digits.length !== 14) {
        setInputError("Digite os 14 dígitos do CNPJ.");
        return;
      }
      if (!isValidCNPJ(digits)) {
        setInputError(
          "CNPJ inválido — os dígitos verificadores não conferem."
        );
        return;
      }
      runQuery(digits);
    },
    [input, loading, runQuery]
  );

  const handleExample = useCallback(
    (digits) => {
      setInput(maskCNPJ(digits));
      runQuery(digits);
    },
    [runQuery]
  );

  return (
    <div className="flex min-h-screen flex-col bg-slate-100 text-slate-800 antialiased">
      {/* ------------------------------ Cabeçalho ------------------------------ */}
      <header className="no-print relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-900 to-indigo-950 text-white">
        <div className="pointer-events-none absolute -right-24 -top-28 h-80 w-80 rounded-full bg-indigo-600/25 blur-3xl" />
        <div className="pointer-events-none absolute -left-20 bottom-0 h-64 w-64 rounded-full bg-violet-600/15 blur-3xl" />
        <div className="relative mx-auto max-w-6xl px-4 pb-24 pt-9 sm:px-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <img
                src="/logo.png"
                alt="Logomarca do Consulta+ CNPJ"
                className="h-12 w-12 rounded-2xl shadow-lg shadow-indigo-950/40 ring-1 ring-white/25 sm:h-14 sm:w-14"
              />
              <div>
                <h1 className="text-xl font-bold tracking-tight sm:text-2xl">
                  Consulta<span className="text-emerald-400">+</span> CNPJ
                </h1>
                <p className="text-sm text-slate-400">
                  Dados cadastrais públicos da Receita Federal
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 rounded-full bg-white/5 px-3.5 py-1.5 text-xs text-slate-300 ring-1 ring-white/10">
              <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-400" />
              API publica.cnpj.ws · 3 consultas/min
            </div>
          </div>
        </div>
      </header>

      {/* -------------------------------- Conteúdo ----------------------------- */}
      <main className="relative z-10 mx-auto -mt-14 w-full max-w-6xl flex-1 px-4 pb-16 sm:px-6">
        <SearchForm
          input={input}
          onInputChange={handleChange}
          onClear={handleClear}
          onSubmit={handleSubmit}
          onExample={handleExample}
          loading={loading}
          inputError={inputError}
        />

        {apiError && (
          <ErrorAlert message={apiError.message} status={apiError.status} />
        )}

        {loading && <LoadingSkeleton />}

        {!loading && !data && !apiError && <EmptyState />}

        {!loading && data && stats && (
          <>
            {/* Cabeçalho do relatório — visível apenas na impressão */}
            <div className="mt-6 hidden border-b-2 border-slate-800 pb-3 print:block">
              <div className="flex items-center gap-3">
                <img
                  src="/logo.png"
                  alt=""
                  className="h-11 w-11 rounded-lg border border-slate-300"
                />
                <div>
                  <p className="text-lg font-bold text-slate-900">
                    Consulta+ CNPJ — Relatório de Consulta
                  </p>
                  <p className="text-xs text-slate-600">
                    Emitido em {new Date().toLocaleString("pt-BR")} · Fonte:
                    publica.cnpj.ws (dados públicos da Receita Federal)
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-8">
              <SummaryCard data={data} />
            </div>
            <DynamicData data={data} stats={stats} />
            <RawJson data={data} />

            {/* Botão flutuante de impressão (somente na tela) */}
            <button
              type="button"
              onClick={() => window.print()}
              title="Imprimir relatório ou salvar em PDF"
              className="no-print fixed bottom-5 right-5 z-20 inline-flex items-center gap-2 rounded-full bg-indigo-600 px-5 py-3.5 text-sm font-semibold text-white shadow-xl shadow-indigo-600/30 transition hover:bg-indigo-700 focus:outline-none focus:ring-4 focus:ring-indigo-500/30 sm:bottom-6 sm:right-6"
            >
              <PrinterIcon className="h-5 w-5" />
              Imprimir / PDF
            </button>
          </>
        )}
      </main>

      {/* -------------------------------- Rodapé ------------------------------- */}
      <footer className="border-t border-slate-200 bg-white py-5">
        <p className="mx-auto max-w-6xl px-4 text-center text-xs text-slate-400 sm:px-6">
          <span className="font-semibold text-slate-500">
            Consulta<span className="text-emerald-500">+</span> CNPJ
          </span>{" "}
          · Dados públicos fornecidos por{" "}
          <a
            href="https://www.cnpj.ws"
            target="_blank"
            rel="noreferrer"
            className="font-medium text-slate-500 hover:text-indigo-600 hover:underline"
          >
            publica.cnpj.ws
          </a>{" "}
          (base da Receita Federal) · Limite de 3 consultas por minuto por IP ·
          Nenhum dado é armazenado por este aplicativo.
        </p>
      </footer>
    </div>
  );
}
