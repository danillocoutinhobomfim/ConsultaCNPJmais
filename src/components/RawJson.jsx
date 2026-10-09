import { useMemo, useState } from "react";
import { CheckIcon, BracesIcon, CopyIcon, ChevronDownIcon } from "./Icons.jsx";

/* Realça a sintaxe do JSON (chaves, strings, números, booleanos, null). */
function highlightJson(raw) {
  const escaped = raw
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
  return escaped.replace(
    /("(\\u[a-fA-F0-9]{4}|\\[^u]|[^\\"])*"(\s*:)?|\b(?:true|false|null)\b|-?\d+(?:\.\d*)?(?:[eE][+-]?\d+)?)/g,
    (match) => {
      let cls = "text-sky-300"; // números
      if (match.startsWith('"')) {
        cls = /:\s*$/.test(match) ? "text-violet-300" : "text-emerald-300";
      } else if (match === "true" || match === "false") {
        cls = "text-amber-300";
      } else if (match === "null") {
        cls = "text-slate-500";
      }
      return `<span class="${cls}">${match}</span>`;
    }
  );
}

export default function RawJson({ data }) {
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  const text = useMemo(() => JSON.stringify(data, null, 2), [data]);
  const html = useMemo(() => (open ? highlightJson(text) : ""), [open, text]);
  const sizeKb = useMemo(
    () => (new Blob([text]).size / 1024).toFixed(1),
    [text]
  );

  async function handleCopy() {
    let ok = false;
    try {
      await navigator.clipboard.writeText(text);
      ok = true;
    } catch {
      // Fallback para contextos sem Clipboard API
      try {
        const ta = document.createElement("textarea");
        ta.value = text;
        ta.style.position = "fixed";
        ta.style.opacity = "0";
        document.body.appendChild(ta);
        ta.select();
        ok = document.execCommand("copy");
        ta.remove();
      } catch {
        ok = false;
      }
    }
    if (ok) {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }

  return (
    <section className="no-print mt-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="flex items-center gap-2 text-lg font-bold tracking-tight text-slate-800">
            <BracesIcon className="h-5 w-5 text-indigo-600" />
            JSON bruto
          </h3>
          <p className="mt-0.5 text-sm text-slate-500">
            Resposta completa e original da API · {sizeKb} KB
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setOpen((o) => !o)}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition hover:border-slate-400 hover:bg-slate-50 focus:outline-none focus:ring-4 focus:ring-indigo-500/15"
          >
            {open ? (
              <>
                Ocultar JSON
                <ChevronDownIcon className="h-4 w-4" />
              </>
            ) : (
              <>
                Ver JSON bruto
                <ChevronDownIcon className="h-4 w-4 -rotate-90" />
              </>
            )}
          </button>
          <button
            type="button"
            onClick={handleCopy}
            className={`inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition focus:outline-none focus:ring-4 focus:ring-emerald-500/25 ${
              copied
                ? "bg-emerald-600 hover:bg-emerald-700"
                : "bg-indigo-600 hover:bg-indigo-700"
            }`}
          >
            {copied ? (
              <>
                <CheckIcon className="h-4 w-4" /> Copiado!
              </>
            ) : (
              <>
                <CopyIcon className="h-4 w-4" /> Copiar JSON
              </>
            )}
          </button>
        </div>
      </div>

      {open && (
        <pre className="json-scroll animate-fade-up mt-3 max-h-[32rem] overflow-auto rounded-2xl bg-slate-900 p-4 font-mono text-xs leading-relaxed text-slate-200 shadow-inner sm:p-5">
          <code dangerouslySetInnerHTML={{ __html: html }} />
        </pre>
      )}
    </section>
  );
}
