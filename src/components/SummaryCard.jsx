import {
  fmtBRL,
  fmtCEP,
  fmtCNPJ,
  fmtDate,
  fmtPhone,
} from "../lib/format.js";
import {
  BriefcaseIcon,
  ClockIcon,
  ExternalLinkIcon,
  HashIcon,
  LandmarkIcon,
  LayersIcon,
  MailIcon,
  MapPinIcon,
  PhoneIcon,
} from "./Icons.jsx";

/* Cores por situação cadastral */
const SITUACAO_STYLES = {
  Ativa: "bg-emerald-100 text-emerald-800 ring-emerald-600/20",
  "Ativa Não Regular": "bg-sky-100 text-sky-800 ring-sky-600/20",
  Baixada: "bg-rose-100 text-rose-800 ring-rose-600/20",
  Suspensa: "bg-amber-100 text-amber-800 ring-amber-600/20",
  Inapta: "bg-orange-100 text-orange-800 ring-orange-600/20",
  Nula: "bg-slate-200 text-slate-700 ring-slate-500/20",
  default: "bg-slate-100 text-slate-700 ring-slate-500/20",
};

function Badge({ children, className = "" }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-semibold ring-1 ${className}`}
    >
      {children}
    </span>
  );
}

const Dot = ({ color }) => (
  <span className={`h-1.5 w-1.5 rounded-full ${color}`} />
);

function Tile({ icon, title, children }) {
  return (
    <div className="bg-white p-5 print:break-inside-avoid">
      <div className="mb-3 flex items-center gap-2">
        <span className="grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-indigo-50 text-indigo-600">
          {icon}
        </span>
        <h4 className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
          {title}
        </h4>
      </div>
      {children}
    </div>
  );
}

const Row = ({ label, children }) => (
  <div className="flex items-baseline justify-between gap-3 py-1">
    <span className="shrink-0 text-xs text-slate-400">{label}</span>
    <span className="text-right text-sm font-medium text-slate-700">
      {children}
    </span>
  </div>
);

const Empty = ({ children = "Não informado" }) => (
  <p className="text-sm italic text-slate-300">{children}</p>
);

export default function SummaryCard({ data }) {
  const top = data ?? {};
  const est = top.estabelecimento ?? {};

  const razaoSocial = top.razao_social || est.nome_fantasia;
  const fantasia = est.nome_fantasia;
  const situacao = est.situacao_cadastral;
  const cnpj = fmtCNPJ(est.cnpj ?? "");
  const capital = Number(top.capital_social);

  const sim = (v) => v === "Sim" || v === true;
  const isSimples = sim(top.simples?.simples);
  const isMei = sim(top.simples?.mei);

  const tel1 =
    est.ddd1 && est.telefone1 ? `${est.ddd1}${est.telefone1}` : null;
  const tel2 =
    est.ddd2 && est.telefone2 ? `${est.ddd2}${est.telefone2}` : null;
  const fax =
    est.ddd_fax && est.fax ? `${est.ddd_fax}${est.fax}` : null;
  const email = est.email;

  const enderecoPartes = [
    [est.tipo_logradouro, est.logradouro].filter(Boolean).join(" "),
    est.numero ? `nº ${est.numero}` : null,
    est.complemento,
  ].filter(Boolean);
  const enderecoLinha1 = enderecoPartes.length
    ? enderecoPartes.join(", ")
    : null;
  const hasEndereco = Boolean(
    enderecoLinha1 || est.bairro || est.cep || est.nome_cidade_exterior
  );
  const mapsQuery = [
    enderecoLinha1,
    est.bairro,
    est.cidade?.nome,
    est.estado?.sigla,
    est.cep ? `CEP ${fmtCEP(est.cep)}` : null,
    est.pais?.nome,
  ]
    .filter(Boolean)
    .join(", ");

  const atividade = est.atividade_principal;
  const secundarias = est.atividades_secundarias ?? [];
  const ies = est.inscricoes_estaduais ?? [];

  return (
    <article className="animate-fade-up overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      {/* ---------- Cabeçalho ---------- */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-900 to-indigo-950 px-5 py-6 text-white print:border-b print:border-slate-300 print:bg-none print:bg-white print:text-slate-900 sm:px-7">
        <div className="flex flex-wrap items-start justify-between gap-x-8 gap-y-4">
          <div className="min-w-0 flex-1">
            <div className="mb-3 flex flex-wrap items-center gap-2">
              {situacao && (
                <Badge
                  className={
                    SITUACAO_STYLES[situacao] ?? SITUACAO_STYLES.default
                  }
                >
                  <Dot color="bg-current opacity-70" />
                  {situacao}
                </Badge>
              )}
              {est.tipo && (
                <Badge className="bg-white/10 text-slate-200 ring-white/15 print:bg-slate-100 print:text-slate-700 print:ring-slate-300">
                  {est.tipo}
                </Badge>
              )}
              {top.porte?.descricao && (
                <Badge className="bg-white/10 text-slate-200 ring-white/15 print:bg-slate-100 print:text-slate-700 print:ring-slate-300">
                  {top.porte.descricao}
                </Badge>
              )}
              {isSimples && (
                <Badge className="bg-teal-400/15 text-teal-300 ring-teal-300/25 print:bg-teal-50 print:text-teal-700 print:ring-teal-600/25">
                  Simples Nacional
                </Badge>
              )}
              {isMei && (
                <Badge className="bg-violet-400/15 text-violet-300 ring-violet-300/25 print:bg-violet-50 print:text-violet-700 print:ring-violet-600/25">
                  MEI
                </Badge>
              )}
            </div>

            <h2 className="break-words text-xl font-bold tracking-tight sm:text-2xl">
              {razaoSocial || "—"}
            </h2>
            {fantasia && (
              <p className="mt-1 break-words text-sm text-slate-300 print:text-slate-600">
                <span className="text-slate-500">Nome fantasia: </span>
                {fantasia}
              </p>
            )}
            {top.natureza_juridica?.descricao && (
              <p className="mt-2 text-xs text-slate-400 print:text-slate-600">
                {top.natureza_juridica.descricao}
                {top.qualificacao_do_responsavel?.descricao?.trim()
                  ? ` · ${top.qualificacao_do_responsavel.descricao.trim()}`
                  : ""}
              </p>
            )}
          </div>

          <div className="shrink-0 text-left sm:text-right">
            <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-500">
              CNPJ
            </p>
            <p className="font-mono text-xl font-semibold tracking-wide">
              {cnpj || "—"}
            </p>
            {!Number.isNaN(capital) && (
              <>
                <p className="mt-2 text-base font-semibold text-emerald-400 print:text-emerald-700">
                  {fmtBRL(capital)}
                </p>
                <p className="text-[10px] uppercase tracking-widest text-slate-500">
                  Capital social
                </p>
              </>
            )}
          </div>
        </div>
      </div>

      {/* ---------- Tiles ---------- */}
      <div className="grid grid-cols-1 gap-px border-t border-slate-200 bg-slate-200 sm:grid-cols-2 lg:grid-cols-3">
        {/* Endereço */}
        <Tile icon={<MapPinIcon className="h-4 w-4" />} title="Endereço">
          {hasEndereco ? (
            <div className="space-y-1 text-sm text-slate-700">
              {enderecoLinha1 && <p className="font-medium">{enderecoLinha1}</p>}
              {est.bairro && <p>{est.bairro}</p>}
              {est.cep && (
                <p>
                  CEP{" "}
                  <span className="font-mono font-medium">{fmtCEP(est.cep)}</span>
                </p>
              )}
              {est.nome_cidade_exterior && <p>{est.nome_cidade_exterior}</p>}
              {est.cidade?.nome && (
                <p className="text-slate-500">
                  {est.cidade.nome}
                  {est.estado?.sigla ? ` · ${est.estado.sigla}` : ""}
                </p>
              )}
              {mapsQuery && (
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(mapsQuery)}`}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-1.5 inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:text-indigo-800 hover:underline"
                >
                  Ver no mapa <ExternalLinkIcon className="h-3 w-3" />
                </a>
              )}
            </div>
          ) : (
            <Empty>Endereço não informado</Empty>
          )}
        </Tile>

        {/* Localização */}
        <Tile icon={<LandmarkIcon className="h-4 w-4" />} title="Cidade / UF">
          {est.cidade?.nome || est.estado?.sigla ? (
            <div className="space-y-1.5">
              <p className="text-lg font-bold text-slate-800">
                {est.cidade?.nome ?? "—"}
                {est.estado?.sigla && (
                  <span className="ml-1.5 text-indigo-600">
                    / {est.estado.sigla}
                  </span>
                )}
              </p>
              {est.estado?.nome && (
                <p className="text-sm text-slate-500">{est.estado.nome}</p>
              )}
              {est.pais?.nome && (
                <p className="text-xs text-slate-400">
                  País: {est.pais.nome}
                  {est.cidade?.ibge_id
                    ? ` · IBGE ${est.cidade.ibge_id}`
                    : ""}
                </p>
              )}
            </div>
          ) : (
            <Empty>Localização não informada</Empty>
          )}
        </Tile>

        {/* Contato */}
        <Tile icon={<PhoneIcon className="h-4 w-4" />} title="Contato">
          {tel1 || tel2 || email || fax ? (
            <div className="space-y-2">
              {tel1 && (
                <a
                  href={`tel:+55${tel1}`}
                  className="flex items-center gap-2 text-sm font-medium text-slate-700 hover:text-indigo-700"
                >
                  <PhoneIcon className="h-3.5 w-3.5 text-slate-400" />
                  <span className="font-mono">{fmtPhone(tel1)}</span>
                </a>
              )}
              {tel2 && (
                <a
                  href={`tel:+55${tel2}`}
                  className="flex items-center gap-2 text-sm font-medium text-slate-700 hover:text-indigo-700"
                >
                  <PhoneIcon className="h-3.5 w-3.5 text-slate-400" />
                  <span className="font-mono">{fmtPhone(tel2)}</span>
                </a>
              )}
              {fax && (
                <p className="flex items-center gap-2 text-sm text-slate-500">
                  <BriefcaseIcon className="h-3.5 w-3.5 text-slate-400" />
                  Fax <span className="font-mono">{fmtPhone(fax)}</span>
                </p>
              )}
              {email && (
                <a
                  href={`mailto:${email}`}
                  className="flex items-start gap-2 break-all text-sm font-medium text-indigo-600 hover:text-indigo-800 hover:underline"
                >
                  <MailIcon className="mt-0.5 h-3.5 w-3.5 shrink-0 text-slate-400" />
                  {email}
                </a>
              )}
            </div>
          ) : (
            <Empty>Nenhum contato informado</Empty>
          )}
        </Tile>

        {/* Atividade econômica */}
        <Tile icon={<LayersIcon className="h-4 w-4" />} title="Atividade Econômica (CNAE)">
          {atividade?.descricao ? (
            <div className="space-y-1.5">
              {atividade.subclasse && (
                <p className="font-mono text-xs font-semibold text-indigo-600">
                  {atividade.subclasse}
                </p>
              )}
              <p className="text-sm font-medium leading-snug text-slate-700">
                {atividade.descricao}
              </p>
              {secundarias.length > 0 ? (
                <p className="text-xs text-slate-400">
                  + {secundarias.length} atividade
                  {secundarias.length > 1 ? "s" : ""} secundária
                  {secundarias.length > 1 ? "s" : ""} (veja em “Todos os
                  dados”)
                </p>
              ) : (
                <p className="text-xs text-slate-400">
                  Sem atividades secundárias
                </p>
              )}
            </div>
          ) : (
            <Empty>CNAE não informado</Empty>
          )}
        </Tile>

        {/* Inscrições estaduais */}
        <Tile icon={<HashIcon className="h-4 w-4" />} title="Inscrições Estaduais">
          {ies.length > 0 ? (
            <ul className="divide-y divide-slate-100">
              {ies.map((ie, i) => (
                <li
                  key={i}
                  className="flex items-center justify-between gap-2 py-1.5"
                >
                  <span className="font-mono text-sm font-medium text-slate-700">
                    {ie.inscricao_estadual ?? "—"}
                  </span>
                  <span className="flex items-center gap-2">
                    {ie.estado?.sigla && (
                      <span className="text-xs font-semibold text-slate-400">
                        {ie.estado.sigla}
                      </span>
                    )}
                    <Badge
                      className={
                        ie.ativo
                          ? "bg-emerald-50 text-emerald-700 ring-emerald-600/15"
                          : "bg-slate-100 text-slate-500 ring-slate-400/20"
                      }
                    >
                      {ie.ativo ? "Ativa" : "Inativa"}
                    </Badge>
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <Empty>Nenhuma inscrição estadual</Empty>
          )}
        </Tile>

        {/* Datas & situação */}
        <Tile icon={<ClockIcon className="h-4 w-4" />} title="Datas & Regime">
          <div className="divide-y divide-slate-100">
            {est.data_inicio_atividade && (
              <Row label="Abertura">{fmtDate(est.data_inicio_atividade)}</Row>
            )}
            {situacao && (
              <Row label={`Situação ${est.data_situacao_cadastral ? `desde ${fmtDate(est.data_situacao_cadastral)}` : ""}`.trim()}>
                <span className="font-semibold">{situacao}</span>
              </Row>
            )}
            <Row label="Simples Nacional">
              {top.simples?.simples != null ? (
                <Badge
                  className={
                    isSimples
                      ? "bg-emerald-50 text-emerald-700 ring-emerald-600/15"
                      : "bg-slate-100 text-slate-500 ring-slate-400/20"
                  }
                >
                  {top.simples.simples}
                </Badge>
              ) : (
                "—"
              )}
            </Row>
            <Row label="MEI">
              {top.simples?.mei != null ? (
                <Badge
                  className={
                    isMei
                      ? "bg-violet-50 text-violet-700 ring-violet-600/15"
                      : "bg-slate-100 text-slate-500 ring-slate-400/20"
                  }
                >
                  {top.simples.mei}
                </Badge>
              ) : (
                "—"
              )}
            </Row>
            {top.atualizado_em && (
              <Row label="Registro atualizado em">
                {fmtDate(top.atualizado_em)}
              </Row>
            )}
          </div>
        </Tile>
      </div>
    </article>
  );
}
