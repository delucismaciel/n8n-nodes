# Community Nodes n8n

> Coleção de community nodes para [n8n](https://n8n.io) focada em integrações com sistemas usados no Brasil — ERPs, plataformas de varejo, SaaS locais.

![status](https://img.shields.io/badge/status-early%20development-orange)
![license](https://img.shields.io/badge/license-MIT-blue)
![n8n](https://img.shields.io/badge/n8n-community%20node-ea4b71)

Cada pasta em [`nodos/`](nodos/) é um **pacote npm independente**, publicável no [npm](https://www.npmjs.com/) e instalável em qualquer instância self-hosted do n8n.

---

## Sumário

- [Filosofia](#filosofia)
- [Pacotes](#pacotes)
- [Instalação](#instalação)
- [Uso rápido](#uso-rápido)
- [Desenvolvimento local](#desenvolvimento-local)
- [Criando um novo pacote](#criando-um-novo-pacote)
- [Arquitetura](#arquitetura)
- [Contribuindo](#contribuindo)
- [Roadmap](#roadmap)
- [Licença](#licença)

---

## Filosofia

- **Pacotes pequenos e focados.** Cada integração é seu próprio npm package. Sem monorepo com workspaces — cada pasta em `nodos/` vive sozinha, com suas dependências, seu ciclo de release e sua documentação.
- **Read-first.** A primeira versão de cada integração cobre apenas consultas (`GET` / `search`). Escrita entra em versões seguintes, depois que o uso real mostrar o que faz sentido expor.
- **Sem acoplamento com credenciais n8n quando possível.** Em muitos casos, a autenticação já é feita por um node anterior do workflow (HTTP Request + OAuth). Os nodes deste repositório aceitam `Base URL` e `Access Token` como parâmetros vindos por expressão — isso facilita rotação de tokens, múltiplos tenants e reutilização de token entre chamadas.
- **Seletor de campos por padrão.** Toda operação de listagem expõe um multi-select "Campos a Retornar" para você decidir, no fluxo, o que deve ser emitido. Reduz payload, reduz ruído em nodes seguintes.
- **Paginação automática opcional.** `Retornar Todos` itera a API até esgotar; `Limite` busca só os primeiros N.

## Pacotes

| Pacote | Versão | Status | Descrição |
|--------|--------|--------|-----------|
| [`n8n-nodes-totvs-moda`](nodos/n8n-nodes-totvs-moda/) | `0.1.0` | em desenvolvimento | Consultas ao módulo **Produto** do Totvs Moda v2 (categorias, produtos — mais operações sendo adicionadas). |

Cada pacote é versionado individualmente em seu próprio `package.json`.

## Instalação

### Em um n8n self-hosted

No diretório onde o n8n está instalado:

```bash
npm install n8n-nodes-totvs-moda
```

Reinicie o n8n. O node aparece na paleta.

### Via configuração de "Community Nodes" do n8n

Interface web do n8n → `Settings` → `Community Nodes` → `Install` → digite o nome do pacote (ex.: `n8n-nodes-totvs-moda`) → `Install`.

> Requer que a instância tenha community nodes habilitados (`N8N_COMMUNITY_PACKAGES_ENABLED=true`).

## Uso rápido

Exemplo de workflow com o node `Totvs Moda Produto`:

```
HTTP Request (token)  ─►  Totvs Moda Produto (consulta)
```

1. **HTTP Request** autentica contra `https://<host>/api/totvsmoda/authorization/v2/token` com `grant_type=password` e retorna `access_token`.
2. **Totvs Moda Produto** recebe:
   - `Base URL`: `={{ $json.url }}` (ou valor fixo do ambiente)
   - `Access Token`: `={{ $json.access_token }}`
   - `Operation`: `Listar Categorias` ou `Buscar Produtos`
   - Filtros + Campos a Retornar + Paginação

Documentação detalhada de cada node fica no README do próprio pacote.

## Desenvolvimento local

### Pré-requisitos

- Node.js **≥ 18.17** (recomendado 20.x)
- npm **≥ 9**
- n8n **self-hosted** rodando localmente para testes (`npx n8n start`)

### Clonar e buildar um pacote

```bash
git clone <url-do-repo>
cd "Teste n8n node/nodos/n8n-nodes-totvs-moda"
npm install
npm run build
```

Scripts disponíveis em cada pacote:

| Script | Faz |
|--------|-----|
| `npm run build` | Compila TypeScript para `dist/` e copia ícones |
| `npm run dev` | `tsc --watch` para desenvolvimento |
| `npm run lint` | Roda ESLint com regras do `eslint-plugin-n8n-nodes-base` |
| `npm run lintfix` | ESLint com `--fix` |
| `npm run prepublishOnly` | Lint + build (gatilho automático antes de `npm publish`) |

### Testar num n8n local

Na pasta do pacote:

```bash
npm link
```

Num diretório com n8n instalado:

```bash
npm link n8n-nodes-totvs-moda
npx n8n start
```

Alternativa: copiar `dist/` para `~/.n8n/custom/node_modules/n8n-nodes-<nome>/`.

Abra `http://localhost:5678`, procure o node na paleta, monte o workflow de teste.

## Criando um novo pacote

O template de pacote segue convenções do n8n. Estrutura mínima:

```
nodos/n8n-nodes-<nome>/
├── package.json          # com campo `n8n` apontando para dist/
├── tsconfig.json         # rootDir: "./"
├── gulpfile.js           # copia SVGs de ícone para dist/
├── .eslintrc.js          # regras do eslint-plugin-n8n-nodes-base
├── index.js              # module.exports = {}
├── nodes/
│   ├── shared/           # helpers compartilhados entre nodes do pacote
│   │   └── GenericFunctions.ts
│   └── <NomeDoNode>/
│       ├── <NomeDoNode>.node.ts
│       ├── <NomeDoNode>.node.json
│       ├── description.ts
│       ├── execute.ts
│       └── <icon>.svg
└── docs/
    └── design.md         # decisões de design do pacote
```

Use o pacote [`n8n-nodes-totvs-moda`](nodos/n8n-nodes-totvs-moda/) como referência — ele estabelece o padrão arquitetural (dispatcher por operation, helpers de request + paginação query/body, seletor de campos pós-processado).

### Convenções

- Nome do pacote: `n8n-nodes-<slug>` (ex.: `n8n-nodes-totvs-moda`).
- Classe do node em PascalCase, nome do arquivo igual à classe (`TotvsModaProduto.node.ts`).
- Operações em camelCase nos valores internos (`listCategories`, `searchProducts`); rótulos amigáveis em português.
- Parâmetros técnicos da API (`productCode`, `changeDate`, etc.) mantêm o nome original do swagger.
- SVG do ícone 60×60, localizado na mesma pasta do `.node.ts`.

## Arquitetura

Cada community node segue o **padrão programático modular**:

```
Node.ts              ← classe INodeType, delega para execute.ts
  ├─ description.ts  ← INodeProperties[] (UI declarativa)
  └─ execute.ts      ← handlers por operation + dispatcher
shared/
  ├─ GenericFunctions.ts  ← request + paginação + utilitários
  └─ types.ts             ← tipos de resposta da API
```

**Por que não o node declarativo (`routing`)?** Ele é ótimo para wrappers REST simples, mas amarra demais quando a operação precisa de pós-processamento (seleção de campos, auto-paginação custom, transformação de filtros). O padrão programático dá liberdade sem muito boilerplate.

## Contribuindo

Contribuições são bem-vindas. Padrão de trabalho:

1. Abra uma **issue** descrevendo a integração ou operação que quer adicionar.
2. Se for novo pacote: siga [Criando um novo pacote](#criando-um-novo-pacote) e espelhe a estrutura do Totvs Moda.
3. Se for nova operação num pacote existente: adicione a entrada em `description.ts`, o handler em `execute.ts`, e o case no dispatcher. Sem mudanças em `GenericFunctions` na maioria dos casos.
4. Rode `npm run lint` e `npm run build` antes de abrir o PR.
5. Teste manualmente num n8n local com credenciais reais.
6. Descreva no PR o que foi testado (endpoints chamados, filtros usados, casos de borda).

### Padrões de código

- TypeScript estrito (`strict: true` no `tsconfig`).
- Sem `any` fora de interfaces explicitamente tipadas para parser de erro.
- Descrições de campos `boolean` começam com `Whether` (exigência do lint do n8n).
- Descrições de `returnAll` e `limit` seguem os templates do lint (`Whether to return all results or only up to a given limit`, `Max number of results to return`).

## Roadmap

### Totvs Moda

- [x] Scaffold do pacote + infraestrutura de build
- [x] Operações de referência (Listar Categorias, Buscar Produtos)
- [ ] Demais operações do módulo Product v2 (balances, prices, costs, references, kardex, barcodes, price tables, etc.)
- [ ] Node `Totvs Moda Pedidos` (módulo Order)
- [ ] Node `Totvs Moda Pessoas` (módulo Person)
- [ ] Operações de escrita (POST/PUT) nos módulos existentes

### Infraestrutura

- [ ] Publicar o primeiro pacote no npm
- [ ] CI (GitHub Actions) rodando lint + build a cada PR
- [ ] Geração automática de CHANGELOG por pacote
- [ ] Testes de integração com ambiente sandbox (quando disponível)

### Ideias de próximos pacotes

- Omie (ERP)
- Bling (ERP/e-commerce)
- Tiny ERP
- VTEX
- Nuvemshop

Abra uma issue se tiver interesse em qualquer um — prioridade é direcionada por demanda.

## Licença

[MIT](LICENSE) © contribuidores.
