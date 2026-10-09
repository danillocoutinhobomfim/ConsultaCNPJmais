# <img src="public/logo.png" width="28" align="top" alt="logo"/> Consulta+ CNPJ

Frontend React moderno para consulta de CNPJ na API pública
[publica.cnpj.ws](https://publica.cnpj.ws/cnpj/{cnpj}) (dados públicos da Receita Federal).

## 🖨️ Impressão / PDF

- Botão flutuante **“Imprimir / PDF”** (canto inferior direito) abre a impressão do navegador.
- Folha de estilos `@media print` dedicada: relatório limpo em **A4** — cabeçalho com logo,
  nome do sistema e data/hora de emissão; formulário, botões, rodapé e JSON bruto ocultos;
  **todas as seções expansíveis saem abertas**; fundos escuros convertidos para branco;
  tiles e linhas de tabela sem quebras de página.

## 🚀 Publicação (GitHub + Render)

### 1. Subir para o GitHub

**Opção A — pelo site (mais fácil, sem instalar nada):**
1. Crie uma conta em [github.com](https://github.com) e clique em **New repository**.
2. Nome: `consulta-mais-cnpj` · Visibilidade: **Public** · **não** marque “Add a README”.
3. Na página do repositório vazio, clique em **“uploading an existing file”**.
4. Arraste **todo o conteúdo da pasta `cnpj-app`** (menos `node_modules` e `dist`) e clique em **Commit changes**.

**Opção B — pelo Git (terminal, dentro da pasta do projeto):**
```bash
git init
git add .
git commit -m "Consulta+ CNPJ — primeira versão"
git branch -M main
git remote add origin https://github.com/SEU-USUARIO/consulta-mais-cnpj.git
git push -u origin main
```

### 2. Publicar no Render (grátis)

1. Acesse [render.com](https://render.com) e entre com **Sign in with GitHub**.
2. **New +** → **Static Site**.
3. Selecione o repositório `consulta-mais-cnpj` (autorize o acesso se pedir).
4. Confirme as configurações (já garantidas pelo `render.yaml`):
   - **Build command:** `npm install && npm run build`
   - **Publish directory:** `dist`
5. Clique em **Deploy**. Em poucos minutos o site fica no ar em
   `https://consulta-mais-cnpj.onrender.com` — com **HTTPS** incluso.

✨ A cada `git push` no GitHub, o Render **recompila e publica sozinho** (deploy automático).

> O app funciona 100% no navegador: a chamada à API `publica.cnpj.ws` é direta do cliente
> (a API libera CORS), então **não há backend nem variáveis de ambiente** para configurar.

## ▶️ Como rodar

```bash
npm install
npm run dev      # abre em http://localhost:5173
```

Build de produção: `npm run build` (saída em `dist/`) e `npm run preview` para servir o build.

## ✨ Funcionalidades

- **Campo de CNPJ com máscara automática** (`00.000.000/0000-00`) enquanto digita,
  com validação dos **dígitos verificadores** antes de chamar a API.
- **Botão Consultar** com estado de **loading** (spinner no botão + skeleton animado).
- **Tratamento de erros**: CNPJ inexistente (404), limite de 3 consultas/minuto (429),
  falha de rede/CORS e respostas inválidas — cada caso com mensagem amigável.
- **Resumo visual** do CNPJ: razão social, nome fantasia, situação cadastral (com cor),
  matriz/filial, porte, Simples/MEI, capital social, endereço (com link p/ mapa),
  cidade/UF, CNAE principal, telefones, e-mail e **inscrições estaduais** com status.
- **Seção dinâmica "Todos os dados retornados"**: renderiza automaticamente TODO o
  JSON da API recursivamente — objetos, listas, listas de objetos (tabela quando as
  colunas são simples, cartões quando há objetos aninhados), com seções retráteis.
- **Contador de campos preenchidos** (`X de Y · Z% de completude`) com barra de progresso.
- **JSON bruto**: visualização com syntax highlight, botão copiar (com feedback) e tamanho.
- **Formatação automática**: CNPJ, CPF, CEP, telefone, datas ISO (`dd/mm/aaaa`),
  booleanos (Sim/Não com badge) e capital social (R$).
- **Layout profissional e responsivo** (mobile-first, grid adaptativo), sem nenhuma
  biblioteca de ícones — todos os ícones são SVG inline próprios.
- Chamada direta ao navegador (a API libera CORS) com **fallback automático** para o
  proxy do Vite (`/api/cnpj`) caso a rede/CORS bloqueie.

## 🗂 Estrutura

```
src/
├── App.jsx                    # Orquestra busca, estados e layout
├── index.css                  # Tailwind + animações/scrollbar
├── lib/
│   ├── api.js                 # fetch com fallback (direta → proxy) e erros tipados
│   └── format.js              # máscaras, validação, formatação, labels, contagem
└── components/
    ├── Icons.jsx              # ícones SVG inline (sem lib externa)
    ├── States.jsx             # formulário de busca, skeleton, erro, estado vazio
    ├── SummaryCard.jsx        # resumo bonito do CNPJ
    ├── DynamicJson.jsx        # renderizador recursivo de TODO o JSON
    └── RawJson.jsx            # JSON bruto + copiar
```

## ⚠️ Limites da API

A API pública permite **3 consultas por minuto por IP** (responde HTTP 429 além disso).
O app detecta o erro e orienta o usuário a aguardar.
