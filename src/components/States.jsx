import { maskCNPJ } from "../lib/format.js";
import {
  AlertIcon,
  InfoIcon,
  LoaderIcon,
  SearchIcon,
} from "./Icons.jsx";

/* ------------------------------- Busca ----------------------------------- */

export function SearchForm({
  input,
  onInputChange,
  onClear,
  onSubmit,
  onExample,
  loading,
  inputError,
}) {
  const EXAMPLES = [
    { label: "Globo", value: "27865757000102" },
    { label: "Banco do Brasil", value: "00000000000191" },
    { label: "Correios", value: "34028316000103" },
  ];

  return (
    <form
      onSubmit={onSubmit}
      noValidate
      className="rounded-2xl border border-slate-200 bg-white p-4 shadow-lg shadow-slate-900/5 sm:p-5"
    >
      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <SearchIcon className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            inputMode="numeric"
            autoComplete="off"
            spellCheck="false"
            value={input}
            onChange={(e) => onInputChange(e.target.value)}
            placeholder="00.000.000/0000-00"
            aria-label="CNPJ"
            maxLength={18}
            className={`h-14 w-full rounded-xl border bg-white pl-12 pr-11 font-mono text-lg tracking-wide text-slate-800 shadow-sm outline-none transition placeholder:font-sans placeholder:tracking-normal placeholder:text-slate-300 focus:ring-4 ${
              inputError
                ? "border-rose-400 focus:border-rose-500 focus:ring-rose-500/15"
                : "border-slate-300 focus:border-indigo-500 focus:ring-indigo-500/15"
            }`}
          />
          {input && (
            <button
              type="button"
              onClick={onClear}
              aria-label="Limpar campo"
              className="absolute right-3 top-1/2 grid h-7 w-7 -translate-y-1/2 place-items-center rounded-full text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
            >
              ✕
            </button>
          )}
        </div>
        <button
          type="submit"
          disabled={loading}
          className="inline-flex h-14 items-center justify-center gap-2.5 rounded-xl bg-indigo-600 px-7 text-base font-semibold text-white shadow-sm transition hover:bg-indigo-700 focus:outline-none focus:ring-4 focus:ring-indigo-500/30 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? (
            <>
              <LoaderIcon className="h-5 w-5 animate-spin" />
              Consultando…
            </>
          ) : (
            <>
              <SearchIcon className="h-5 w-5" />
              Consultar
            </>
          )}
        </button>
      </div>

      {inputError ? (
        <p className="mt-2.5 flex items-center gap-1.5 text-sm font-medium text-rose-600">
          <AlertIcon className="h-4 w-4 shrink-0" />
          {inputError}
        </p>
      ) : (
        <div className="mt-3 flex flex-wrap items-center gap-2 text-xs text-slate-500">
          <span className="font-medium">Exemplos:</span>
          {EXAMPLES.map((ex) => (
            <button
              key={ex.value}
              type="button"
              onClick={() => onExample(ex.value)}
              disabled={loading}
              className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 font-medium text-slate-600 transition hover:border-indigo-300 hover:bg-indigo-50 hover:text-indigo-700 disabled:opacity-50"
            >
              {ex.label} · {maskCNPJ(ex.value)}
            </button>
          ))}
        </div>
      )}
    </form>
  );
}

/* ------------------------------ Erro da API ------------------------------ */

export function ErrorAlert({ message, status }) {
  const rateLimited = status === 429;
  return (
    <div
      role="alert"
      className="animate-fade-up mt-6 flex items-start gap-3.5 rounded-2xl border border-rose-200 bg-rose-50 p-5"
    >
      <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-rose-100 text-rose-600">
        <AlertIcon className="h-5 w-5" />
      </span>
      <div className="min-w-0">
        <h3 className="font-semibold text-rose-900">
          {rateLimited
            ? "Muitas consultas em pouco tempo"
            : "Não foi possível concluir a consulta"}
        </h3>
        <p className="mt-0.5 break-words text-sm text-rose-700">{message}</p>
        {rateLimited && (
          <p className="mt-1 text-xs text-rose-500">
            Dica: a API pública limita cada IP a 3 consultas por minuto — o
            contador reinicia automaticamente.
          </p>
        )}
      </div>
    </div>
  );
}

/* ----------------------------- Carregando -------------------------------- */

export function LoadingSkeleton() {
  return (
    <div className="mt-8 space-y-4" aria-live="polite" aria-busy="true">
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="w-full max-w-md space-y-3">
            <div className="flex gap-2">
              <div className="h-6 w-20 animate-pulse rounded-full bg-slate-200" />
              <div className="h-6 w-16 animate-pulse rounded-full bg-slate-200" />
            </div>
            <div className="h-7 w-3/4 animate-pulse rounded-lg bg-slate-200" />
            <div className="h-4 w-1/2 animate-pulse rounded bg-slate-100" />
          </div>
          <div className="space-y-2 text-right">
            <div className="ml-auto h-6 w-44 animate-pulse rounded bg-slate-200" />
            <div className="ml-auto h-5 w-32 animate-pulse rounded bg-slate-100" />
          </div>
        </div>
      </div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <div
            key={i}
            className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
          >
            <div className="mb-4 h-5 w-28 animate-pulse rounded bg-slate-200" />
            <div className="space-y-2.5">
              <div className="h-4 w-full animate-pulse rounded bg-slate-100" />
              <div className="h-4 w-5/6 animate-pulse rounded bg-slate-100" />
              <div className="h-4 w-2/3 animate-pulse rounded bg-slate-100" />
            </div>
          </div>
        ))}
      </div>
      <p className="flex items-center justify-center gap-2 pt-2 text-sm text-slate-400">
        <LoaderIcon className="h-4 w-4 animate-spin" />
        Consultando a base pública da Receita Federal…
      </p>
    </div>
  );
}

/* ----------------------------- Estado vazio ------------------------------ */

export function EmptyState() {
  return (
    <div className="animate-fade-up mt-6 rounded-2xl border-2 border-dashed border-slate-200 bg-white/60 p-10 text-center">
      <img
        src="/logo.png"
        alt="Logomarca do ConsultaCNPJ+"
        className="mx-auto mb-4 h-16 w-16 rounded-2xl shadow-md ring-1 ring-slate-200"
      />
      <h3 className="text-lg font-semibold text-slate-800">
        Bem-vindo ao ConsultaCNPJ+
      </h3>
      <p className="mx-auto mt-1 max-w-md text-sm text-slate-500">
        Digite um CNPJ válido no campo acima — a máscara é aplicada
        automaticamente. Você verá um resumo visual, todos os campos retornados
        pela API e o JSON bruto.
      </p>
      <p className="mx-auto mt-4 inline-flex max-w-lg items-start gap-2 rounded-xl bg-slate-50 px-4 py-3 text-left text-xs leading-relaxed text-slate-500">
        <InfoIcon className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
        Fonte: publica.cnpj.ws (dados públicos da Receita Federal). Limite de 3
        consultas por minuto por IP. Nada é armazenado neste aplicativo.
      </p>
    </div>
  );
}
