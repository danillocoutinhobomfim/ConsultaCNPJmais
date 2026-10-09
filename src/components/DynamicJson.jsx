import { useState } from "react";
import {
  fmtBRL,
  fmtCEP,
  fmtDate,
  fmtPhone,
  isDateLike,
  isEmptyValue,
  isScalar,
  labelFor,
  maskCPF,
  maskCNPJ,
} from "../lib/format.js";
import {
  BracesIcon,
  ChevronDownIcon,
  FolderIcon,
  HashIcon,
  ListIcon,
} from "./Icons.jsx";

/* ==========================================================================
   Renderizador dinâmico: exibe TODOS os campos do JSON retornado pela API,
   percorrendo objetos, listas e listas de objetos recursivamente.
   ========================================================================== */

/* -------------------------- Valores primitivos --------------------------- */

export function BoolBadge({ value }) {
  return value ? (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-semibold text-emerald-700 ring-1 ring-emerald-600/20">
      <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
      Sim
    </span>
  ) : (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-500 ring-1 ring-slate-400/20">
      <span className="h-1.5 w-1.5 rounded-full bg-slate-400" />
      Não
    </span>
  );
}

/** Formata automaticamente CNPJ, CPF, CEP, telefone, datas, moeda e booleanos. */
export function PrimitiveValue({ k, v }) {
  if (typeof v === "boolean") return <BoolBadge value={v} />;

  const text = String(v);
  const digits = text.replace(/\D/g, "");
  const key = String(k).toLowerCase();
  let out = text;

  if (isDateLike(text)) {
    out = fmtDate(text);
  } else if (
    key.includes("capital") &&
    digits.length > 0 &&
    !Number.isNaN(Number(text))
  ) {
    out = fmtBRL(Number(text));
  } else if (
    /(^|_)cnpj(_|$)|cpf_cnpj/.test(key) &&
    digits.length === 14
  ) {
    out = maskCNPJ(digits);
  } else if (key.includes("cpf") && digits.length === 11) {
    out = /^0+$/.test(digits) ? "—" : maskCPF(digits);
  } else if (key === "cep" && digits.length === 8) {
    out = fmtCEP(digits);
  } else if (
    /(telefone|fax)/.test(key) &&
    digits.length >= 8 &&
    digits.length <= 11
  ) {
    out = fmtPhone(digits);
  }

  if (key.includes("email") && text.includes("@")) {
    return (
      <a
        href={`mailto:${text}`}
        className="break-all font-medium text-indigo-600 transition-colors hover:text-indigo-800 hover:underline"
      >
        {text}
      </a>
    );
  }
  if (/^https?:\/\//.test(text)) {
    return (
      <a
        href={text}
        target="_blank"
        rel="noreferrer"
        className="break-all font-medium text-indigo-600 hover:underline"
      >
        {text}
      </a>
    );
  }
  return <span className="break-words">{out}</span>;
}

/* Valor compacto para células de tabela / representação inline de objetos */
function InlineValue({ v }) {
  if (isEmptyValue(v)) return <span className="italic text-slate-300">—</span>;
  if (typeof v === "boolean") return <BoolBadge value={v} />;
  if (typeof v === "object") {
    if (Array.isArray(v)) {
      if (v.length === 0) return <span className="italic text-slate-300">—</span>;
      return (
        <span>
          {v.map((x, i) => (
            <span key={i}>
              {i > 0 && ", "}
              <InlineValue v={x} />
            </span>
          ))}
        </span>
      );
    }
    const nome = v.nome != null ? String(v.nome) : null;
    const geo = v.sigla != null ? v.sigla : v.iso2 != null ? v.iso2 : null;
    if (nome && geo) return <span className="font-medium">{`${nome} (${geo})`}</span>;
    if (v.descricao != null)
      return <span className="font-medium">{String(v.descricao).trim()}</span>;
    if (nome) return <span className="font-medium">{nome}</span>;
    const scalars = Object.entries(v).filter(
      ([, x]) => isScalar(x) && !isEmptyValue(x)
    );
    if (scalars.length > 0)
      return (
        <span>
          {scalars
            .slice(0, 3)
            .map(([k, x]) => `${labelFor(k)}: ${typeof x === "boolean" ? (x ? "Sim" : "Não") : x}`)
            .join(" · ")}
        </span>
      );
    return <span className="italic text-slate-300">—</span>;
  }
  return <PrimitiveValue k="" v={v} />;
}

/* ------------------------------- Campos ---------------------------------- */

function Field({ k, v, compact = false }) {
  const empty = isEmptyValue(v);
  return (
    <div className="min-w-0">
      <dt
        className={`font-medium uppercase tracking-wider text-slate-400 ${
          compact ? "text-[10px] mb-0.5" : "text-[11px] mb-1"
        }`}
      >
        {labelFor(k)}
      </dt>
      <dd
        className={`break-words ${compact ? "text-[13px]" : "text-sm"} ${
          empty ? "italic text-slate-300" : "font-medium text-slate-700"
        }`}
      >
        {empty ? "não informado" : <PrimitiveValue k={k} v={v} />}
      </dd>
    </div>
  );
}

/* --------------------------- Seção retrátil ------------------------------ */

function Section({ title, icon, badge, defaultOpen = true, children }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="animate-fade-up overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="flex w-full items-center gap-3 px-4 py-3.5 text-left transition-colors hover:bg-slate-50 sm:px-5"
      >
        {icon && (
          <span className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-indigo-50 text-indigo-600">
            {icon}
          </span>
        )}
        <span className="min-w-0 flex-1 truncate text-sm font-semibold text-slate-800 sm:text-[15px]">
          {title}
        </span>
        {badge != null && (
          <span className="shrink-0 rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-semibold text-slate-500">
            {badge}
          </span>
        )}
        <ChevronDownIcon
          className={`h-4 w-4 shrink-0 text-slate-400 transition-transform duration-200 ${
            open ? "" : "-rotate-90"
          }`}
        />
      </button>
      {open && (
        <div className="border-t border-slate-100 px-4 py-4 sm:px-5">
          {children}
        </div>
      )}
    </div>
  );
}

/* ------------------------ Tabela (lista simples) ------------------------- */

function ArrayTable({ columns, items }) {
  return (
    <div className="overflow-x-auto rounded-xl border border-slate-200">
      <table className="w-full text-sm">
        <thead>
          <tr className="bg-slate-50 text-left">
            <th className="px-3 py-2.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">
              #
            </th>
            {columns.map((c) => (
              <th
                key={c}
                className="whitespace-nowrap px-3 py-2.5 text-[10px] font-bold uppercase tracking-wider text-slate-500"
              >
                {labelFor(c)}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {items.map((it, i) => (
            <tr key={i} className="transition-colors hover:bg-indigo-50/40">
              <td className="px-3 py-2.5 text-xs text-slate-400">{i + 1}</td>
              {columns.map((c) => (
                <td key={c} className="px-3 py-2.5 align-top text-slate-700">
                  <InlineValue v={it[c]} />
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/* ------------------ Cartão (lista com objetos aninhados) ----------------- */

function ItemCard({ item, index }) {
  const entries = Object.entries(item);
  const title =
    (item.nome != null && String(item.nome)) ||
    (item.descricao != null && String(item.descricao).trim()) ||
    `Registro ${index + 1}`;
  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50/60 p-4">
      <div className="mb-3 flex items-center gap-2">
        <span className="grid h-5 w-5 shrink-0 place-items-center rounded-md bg-indigo-100 text-[10px] font-bold text-indigo-700">
          {index + 1}
        </span>
        <span className="min-w-0 truncate text-sm font-semibold text-slate-700">
          {title}
        </span>
      </div>
      <dl className="grid grid-cols-1 gap-x-4 gap-y-2.5 sm:grid-cols-2">
        {entries.map(([k, v]) => (
          <div key={k} className="min-w-0">
            <dt className="mb-0.5 text-[10px] font-medium uppercase tracking-wider text-slate-400">
              {labelFor(k)}
            </dt>
            <dd className="break-words text-[13px] font-medium text-slate-700">
              <InlineValue v={v} />
            </dd>
          </div>
        ))}
      </dl>
    </div>
  );
}

/* ------------------------- Blocos recursivos ------------------------------ */

function ObjectBlock({ name, value, depth }) {
  const entries = Object.entries(value ?? {});
  const scalars = entries.filter(([, v]) => isScalar(v));
  const nested = entries.filter(([, v]) => !isScalar(v));
  const filled = entries.filter(([, v]) => !isEmptyValue(v)).length;
  return (
    <Section
      title={name}
      icon={<FolderIcon className="h-4 w-4" />}
      badge={`${filled}/${entries.length}`}
      defaultOpen={depth < 3}
    >
      {scalars.length > 0 && (
        <dl className="grid grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-2 lg:grid-cols-3">
          {scalars.map(([k, v]) => (
            <Field key={k} k={k} v={v} />
          ))}
        </dl>
      )}
      {nested.length > 0 && (
        <div className={`space-y-3 ${scalars.length > 0 ? "mt-4" : ""}`}>
          {nested.map(([k, v]) => (
            <Node key={k} name={labelFor(k)} value={v} depth={depth + 1} />
          ))}
        </div>
      )}
    </Section>
  );
}

function ArrayBlock({ name, value }) {
  const items = value;

  if (items.length === 0) {
    return (
      <Section title={name} icon={<ListIcon className="h-4 w-4" />} badge="vazio">
        <p className="text-sm italic text-slate-400">
          Nenhum registro retornado pela API.
        </p>
      </Section>
    );
  }

  const allObjects = items.every(
    (it) => it !== null && typeof it === "object" && !Array.isArray(it)
  );

  // Lista de valores simples → chips
  if (!allObjects) {
    return (
      <Section
        title={name}
        icon={<ListIcon className="h-4 w-4" />}
        badge={`${items.length} ${items.length === 1 ? "item" : "itens"}`}
      >
        <div className="flex flex-wrap gap-2">
          {items.map((it, i) => (
            <span
              key={i}
              className="rounded-lg bg-slate-100 px-2.5 py-1 text-sm font-medium text-slate-700"
            >
              <PrimitiveValue k={name} v={it} />
            </span>
          ))}
        </div>
      </Section>
    );
  }

  // Lista de objetos → tabela (colunas simples) ou cartões (dados aninhados)
  const columns = [];
  for (const it of items) {
    for (const c of Object.keys(it)) {
      if (!columns.includes(c)) columns.push(c);
    }
  }
  const useTable = columns.length <= 7;

  return (
    <Section
      title={name}
      icon={<ListIcon className="h-4 w-4" />}
      badge={`${items.length} ${items.length === 1 ? "registro" : "registros"}`}
    >
      {useTable ? (
        <ArrayTable columns={columns} items={items} />
      ) : (
        <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
          {items.map((it, i) => (
            <ItemCard key={i} item={it} index={i} />
          ))}
        </div>
      )}
    </Section>
  );
}

function Node({ name, value, depth = 0 }) {
  if (Array.isArray(value)) return <ArrayBlock name={name} value={value} />;
  if (value !== null && typeof value === "object")
    return <ObjectBlock name={name} value={value} depth={depth} />;
  return (
    <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
      <Field k={name} v={value} />
    </div>
  );
}

/* ------------------------------ Raiz -------------------------------------- */

export default function DynamicData({ data, stats }) {
  const scalarEntries = [];
  const complexEntries = [];
  for (const [k, v] of Object.entries(data ?? {})) {
    (isScalar(v) ? scalarEntries : complexEntries).push([k, v]);
  }

  const pct = stats.total ? Math.round((stats.filled / stats.total) * 100) : 0;
  const vazios = stats.total - stats.filled;

  return (
    <section className="mt-8">
      <div className="mb-4">
        <h3 className="flex items-center gap-2 text-lg font-bold tracking-tight text-slate-800">
          <BracesIcon className="h-5 w-5 text-indigo-600" />
          Todos os dados retornados
        </h3>
        <p className="mt-0.5 text-sm text-slate-500">
          Renderização automática de todo o JSON — objetos, listas e listas de
          objetos. Cada CNPJ pode trazer campos diferentes.
        </p>
      </div>

      {/* Contador de campos preenchidos */}
      <div className="mb-4 rounded-2xl bg-gradient-to-r from-indigo-600 via-indigo-600 to-violet-600 px-5 py-4 text-white shadow-sm print:border print:border-slate-300 print:bg-none print:bg-white print:text-slate-900">
        <div className="flex flex-wrap items-center justify-between gap-x-8 gap-y-3">
          <div>
            <p className="text-sm font-semibold">
              <span className="text-xl font-bold">{stats.filled}</span>
              <span className="text-indigo-200 print:text-slate-500"> de {stats.total} campos preenchidos</span>
            </p>
            <p className="text-xs text-indigo-200 print:text-slate-500">
              {vazios} {vazios === 1 ? "campo vazio/nulo" : "campos vazios/nulos"} ·{" "}
              {pct}% de completude do registro
            </p>
          </div>
          <div className="w-full max-w-56">
            <div className="h-2 overflow-hidden rounded-full bg-white/25 print:bg-slate-200">
              <div
                className="h-full rounded-full bg-white transition-all duration-700 print:bg-indigo-600"
                style={{ width: `${pct}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {scalarEntries.length > 0 && (
          <Section
            title="Dados Gerais"
            icon={<HashIcon className="h-4 w-4" />}
            badge={`${scalarEntries.length} ${scalarEntries.length === 1 ? "campo" : "campos"}`}
          >
            <dl className="grid grid-cols-1 gap-x-6 gap-y-4 sm:grid-cols-2 lg:grid-cols-3">
              {scalarEntries.map(([k, v]) => (
                <Field key={k} k={k} v={v} />
              ))}
            </dl>
          </Section>
        )}
        {complexEntries.map(([k, v]) => (
          <Node key={k} name={labelFor(k)} value={v} depth={1} />
        ))}
      </div>
    </section>
  );
}
