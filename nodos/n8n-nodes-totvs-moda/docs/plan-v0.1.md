# Totvs Moda Produto — Plano de Implementação (v0.1)

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Entregar o primeiro community node publicável do pacote `n8n-nodes-totvs-moda`: node `Totvs Moda Produto` com duas operações funcionais (Categorias — padrão GET+query; Buscar Produtos — padrão POST+body), mais toda a infraestrutura compartilhada (helpers, build, lint, ícone) pronta para adicionar as demais operações em iterações seguintes.

**Architecture:** Package npm independente em `nodos/n8n-nodes-totvs-moda/`. Node programático modular: entrypoint `TotvsModaProduto.node.ts` + descrição declarativa de parâmetros em `description.ts` + dispatcher em `execute.ts` que chama por operação. `shared/GenericFunctions.ts` centraliza request HTTP + duas estratégias de paginação (query-based e body-based) + projeção de campos. Autenticação não ocorre dentro do node — `accessToken` e `baseUrl` chegam como parâmetros via expressão.

**Tech Stack:** TypeScript, n8n-workflow, gulp (só para copiar SVG), eslint + eslint-plugin-n8n-nodes-base.

**Escopo explícito fora desta v0.1:** as outras ~22 operações do swagger de Product (serão adicionadas em iterações seguintes seguindo o padrão das duas de referência); testes automatizados; publicação no npm.

---

## Task 1: Scaffold do package

**Files:**
- Create: `nodos/n8n-nodes-totvs-moda/package.json`
- Create: `nodos/n8n-nodes-totvs-moda/tsconfig.json`
- Create: `nodos/n8n-nodes-totvs-moda/.eslintrc.js`
- Create: `nodos/n8n-nodes-totvs-moda/.eslintignore`
- Create: `nodos/n8n-nodes-totvs-moda/.gitignore`
- Create: `nodos/n8n-nodes-totvs-moda/.npmignore`
- Create: `nodos/n8n-nodes-totvs-moda/gulpfile.js`
- Create: `nodos/n8n-nodes-totvs-moda/index.js`

- [ ] **Step 1: Criar `package.json`**

```json
{
  "name": "n8n-nodes-totvs-moda",
  "version": "0.1.0",
  "description": "n8n community nodes para integração com as APIs Totvs Moda v2.",
  "keywords": [
    "n8n-community-node-package",
    "n8n",
    "totvs",
    "totvs-moda",
    "erp"
  ],
  "license": "MIT",
  "main": "index.js",
  "scripts": {
    "build": "tsc && gulp build:icons",
    "dev": "tsc --watch",
    "lint": "eslint nodes",
    "lintfix": "eslint nodes --fix",
    "prepublishOnly": "npm run lint && npm run build"
  },
  "files": [
    "dist"
  ],
  "n8n": {
    "n8nNodesApiVersion": 1,
    "nodes": [
      "dist/nodes/TotvsModaProduto/TotvsModaProduto.node.js"
    ]
  },
  "devDependencies": {
    "@types/node": "^20.11.0",
    "@typescript-eslint/parser": "^7.15.0",
    "eslint": "^8.57.0",
    "eslint-plugin-n8n-nodes-base": "^1.16.3",
    "gulp": "^4.0.2",
    "n8n-workflow": "^1.55.0",
    "typescript": "^5.5.2"
  },
  "peerDependencies": {
    "n8n-workflow": "*"
  }
}
```

- [ ] **Step 2: Criar `tsconfig.json`**

```json
{
  "compilerOptions": {
    "strict": true,
    "module": "commonjs",
    "moduleResolution": "node",
    "target": "es2019",
    "lib": ["es2019", "es2020", "es2022.error"],
    "removeComments": true,
    "useUnknownInCatchVariables": false,
    "forceConsistentCasingInFileNames": true,
    "noImplicitAny": true,
    "noImplicitReturns": true,
    "noUnusedLocals": true,
    "strictNullChecks": true,
    "preserveConstEnums": true,
    "esModuleInterop": true,
    "resolveJsonModule": true,
    "incremental": true,
    "declaration": true,
    "sourceMap": true,
    "skipLibCheck": true,
    "outDir": "./dist/"
  },
  "include": ["nodes/**/*", "nodes/**/*.json"],
  "exclude": ["node_modules", "dist"]
}
```

- [ ] **Step 3: Criar `.eslintrc.js`**

```javascript
module.exports = {
  parser: '@typescript-eslint/parser',
  parserOptions: {
    project: './tsconfig.json',
    sourceType: 'module',
    extraFileExtensions: ['.json'],
  },
  ignorePatterns: ['.eslintrc.js', '**/*.js', '**/node_modules/**', '**/dist/**'],
  overrides: [
    {
      files: ['nodes/**/*.ts'],
      plugins: ['eslint-plugin-n8n-nodes-base'],
      extends: ['plugin:n8n-nodes-base/nodes'],
      rules: {
        'n8n-nodes-base/node-execute-block-missing-continue-on-fail': 'off',
        'n8n-nodes-base/node-resource-description-filename-against-convention': 'off',
      },
    },
  ],
};
```

- [ ] **Step 4: Criar `.eslintignore`**

```
node_modules
dist
```

- [ ] **Step 5: Criar `.gitignore`**

```
node_modules
dist
*.tgz
.DS_Store
.env
tsconfig.tsbuildinfo
```

- [ ] **Step 6: Criar `.npmignore`**

```
.git
.github
node_modules
.vscode
tsconfig.json
gulpfile.js
.eslintrc.js
.eslintignore
nodes
docs
```

- [ ] **Step 7: Criar `gulpfile.js`** (copia SVGs de ícones para `dist/`)

```javascript
const { src, dest } = require('gulp');

function buildIcons() {
  return src('nodes/**/*.{png,svg}').pipe(dest('dist/nodes'));
}

exports['build:icons'] = buildIcons;
```

- [ ] **Step 8: Criar `index.js`** (entry vazio — n8n lê o campo `n8n` do `package.json`)

```javascript
module.exports = {};
```

- [ ] **Step 9: Instalar dependências**

Rodar na pasta `nodos/n8n-nodes-totvs-moda/`:

```bash
npm install
```

Esperado: `node_modules/` criado, sem erros de peer dependency.

---

## Task 2: Ícone SVG do node

**Files:**
- Create: `nodos/n8n-nodes-totvs-moda/nodes/TotvsModaProduto/totvs-moda-produto.svg`

- [ ] **Step 1: Criar o SVG do ícone**

SVG simples com a marca Totvs (vermelho `#E60014`) e rótulo "MP" (Moda Produto). 60x60 conforme convenção n8n.

```xml
<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="60" height="60" viewBox="0 0 60 60">
  <rect width="60" height="60" rx="8" fill="#E60014"/>
  <text x="30" y="38" font-family="Arial, sans-serif" font-size="20" font-weight="bold" fill="#ffffff" text-anchor="middle">MP</text>
</svg>
```

---

## Task 3: Types compartilhados

**Files:**
- Create: `nodos/n8n-nodes-totvs-moda/nodes/shared/types.ts`

- [ ] **Step 1: Criar `types.ts`**

```typescript
export interface TotvsModaPaginatedResponse<T> {
  items?: T[];
  page?: number;
  pageSize?: number;
  totalItems?: number;
  totalPages?: number;
}

export interface TotvsModaErrorBody {
  message?: string;
  detailedMessage?: string;
  code?: string | number;
  details?: unknown;
}

export const TOTVS_MODA_PRODUCT_BASE_PATH = '/api/totvsmoda/product/v2';

export const DEFAULT_PAGE_SIZE = 1000;
```

---

## Task 4: GenericFunctions — request helper

**Files:**
- Create: `nodos/n8n-nodes-totvs-moda/nodes/shared/GenericFunctions.ts`

- [ ] **Step 1: Criar `GenericFunctions.ts` com request helper**

```typescript
import type {
  IDataObject,
  IExecuteFunctions,
  IHttpRequestMethods,
  IHttpRequestOptions,
  JsonObject,
} from 'n8n-workflow';
import { NodeApiError, NodeOperationError } from 'n8n-workflow';

import {
  DEFAULT_PAGE_SIZE,
  TOTVS_MODA_PRODUCT_BASE_PATH,
  type TotvsModaErrorBody,
  type TotvsModaPaginatedResponse,
} from './types';

function normalizeBaseUrl(baseUrl: string): string {
  if (!baseUrl) {
    throw new Error('Base URL vazio.');
  }
  return baseUrl.replace(/\/+$/, '');
}

export async function totvsModaApiRequest(
  this: IExecuteFunctions,
  baseUrl: string,
  accessToken: string,
  method: IHttpRequestMethods,
  endpoint: string,
  body?: IDataObject,
  qs?: IDataObject,
): Promise<IDataObject | IDataObject[]> {
  if (!accessToken) {
    throw new NodeOperationError(
      this.getNode(),
      'Access Token não informado. Preencha o campo "Access Token" com o token emitido pelo endpoint de autorização.',
    );
  }

  const url = `${normalizeBaseUrl(baseUrl)}${TOTVS_MODA_PRODUCT_BASE_PATH}${endpoint}`;

  const options: IHttpRequestOptions = {
    method,
    url,
    qs,
    body,
    headers: {
      Authorization: `Bearer ${accessToken}`,
      Accept: 'application/json',
    },
    json: true,
  };

  if (body === undefined) {
    delete options.body;
  }
  if (qs === undefined || Object.keys(qs).length === 0) {
    delete options.qs;
  }

  try {
    return (await this.helpers.httpRequest(options)) as IDataObject | IDataObject[];
  } catch (error) {
    const err = error as { statusCode?: number; response?: { body?: TotvsModaErrorBody } };
    if (err.statusCode === 401) {
      throw new NodeApiError(this.getNode(), error as JsonObject, {
        message: 'Token inválido ou expirado. Autentique novamente antes de chamar este node.',
        httpCode: '401',
      });
    }
    const apiMessage = err.response?.body?.detailedMessage ?? err.response?.body?.message;
    if (apiMessage) {
      throw new NodeApiError(this.getNode(), error as JsonObject, { message: apiMessage });
    }
    throw new NodeApiError(this.getNode(), error as JsonObject);
  }
}
```

- [ ] **Step 2: Adicionar auto-paginação query-based ao final do arquivo**

```typescript
export async function totvsModaApiRequestAllItemsQuery(
  this: IExecuteFunctions,
  baseUrl: string,
  accessToken: string,
  endpoint: string,
  qs: IDataObject,
  pageSize = DEFAULT_PAGE_SIZE,
): Promise<IDataObject[]> {
  const results: IDataObject[] = [];
  let page = 1;

  while (true) {
    const response = (await totvsModaApiRequest.call(
      this,
      baseUrl,
      accessToken,
      'GET',
      endpoint,
      undefined,
      { ...qs, Page: page, PageSize: pageSize },
    )) as TotvsModaPaginatedResponse<IDataObject> | IDataObject[];

    const items = Array.isArray(response) ? response : (response.items ?? []);
    results.push(...items);

    if (items.length < pageSize) break;
    page += 1;
  }

  return results;
}
```

- [ ] **Step 3: Adicionar auto-paginação body-based ao final do arquivo**

```typescript
export async function totvsModaApiRequestAllItemsBody(
  this: IExecuteFunctions,
  baseUrl: string,
  accessToken: string,
  endpoint: string,
  body: IDataObject,
  pageSize = DEFAULT_PAGE_SIZE,
): Promise<IDataObject[]> {
  const results: IDataObject[] = [];
  let page = 1;

  while (true) {
    const response = (await totvsModaApiRequest.call(
      this,
      baseUrl,
      accessToken,
      'POST',
      endpoint,
      { ...body, page, pageSize },
    )) as TotvsModaPaginatedResponse<IDataObject>;

    const items = response.items ?? [];
    results.push(...items);

    if (items.length < pageSize) break;
    page += 1;
  }

  return results;
}
```

- [ ] **Step 4: Adicionar `pickFields` e `applyLimit`**

```typescript
export function pickFields(item: IDataObject, fields: string[]): IDataObject {
  if (!fields || fields.length === 0) return item;
  const out: IDataObject = {};
  for (const key of fields) {
    if (key in item) out[key] = item[key];
  }
  return out;
}

export function applyLimit<T>(items: T[], limit: number): T[] {
  if (limit <= 0) return items;
  return items.slice(0, limit);
}
```

- [ ] **Step 5: Compilar para verificar tipos**

Rodar na pasta `nodos/n8n-nodes-totvs-moda/`:

```bash
npx tsc --noEmit
```

Esperado: sem erros.

---

## Task 5: Descrição base do node (parâmetros globais e seletor de operação)

**Files:**
- Create: `nodos/n8n-nodes-totvs-moda/nodes/TotvsModaProduto/description.ts`

- [ ] **Step 1: Criar `description.ts` com parâmetros de topo e lista de operações**

```typescript
import type { INodeProperties } from 'n8n-workflow';

export const baseProperties: INodeProperties[] = [
  {
    displayName: 'Base URL',
    name: 'baseUrl',
    type: 'string',
    default: '',
    required: true,
    placeholder: 'https://www30.bhan.com.br:9443',
    description:
      'URL base do ambiente Totvs Moda, sem path. Geralmente vem por expressão de um node anterior (ex.: {{ $json.url }}).',
  },
  {
    displayName: 'Access Token',
    name: 'accessToken',
    type: 'string',
    typeOptions: { password: true },
    default: '',
    required: true,
    description:
      'Bearer token emitido pelo endpoint /api/totvsmoda/authorization/v2/token. Geralmente vem por expressão (ex.: {{ $json.access_token }}).',
  },
  {
    displayName: 'Operation',
    name: 'operation',
    type: 'options',
    noDataExpression: true,
    default: 'listCategories',
    options: [
      {
        name: 'Listar Categorias',
        value: 'listCategories',
        description: 'GET /category',
        action: 'Listar categorias de produto',
      },
      {
        name: 'Buscar Produtos',
        value: 'searchProducts',
        description: 'POST /products/search',
        action: 'Buscar produtos por filtro',
      },
    ],
  },
];
```

- [ ] **Step 2: Adicionar descrição da operação "Listar Categorias" ao final do arquivo**

```typescript
export const listCategoriesProperties: INodeProperties[] = [
  {
    displayName: 'Retornar Todos',
    name: 'returnAll',
    type: 'boolean',
    default: false,
    displayOptions: { show: { operation: ['listCategories'] } },
    description: 'Se ativado, busca todas as páginas até esgotar.',
  },
  {
    displayName: 'Limite',
    name: 'limit',
    type: 'number',
    typeOptions: { minValue: 1 },
    default: 50,
    displayOptions: { show: { operation: ['listCategories'], returnAll: [false] } },
    description: 'Máximo de itens a retornar.',
  },
  {
    displayName: 'Filtros',
    name: 'filters',
    type: 'collection',
    placeholder: 'Adicionar filtro',
    default: {},
    displayOptions: { show: { operation: ['listCategories'] } },
    options: [
      {
        displayName: 'Data de Alteração (Início)',
        name: 'StartChangeDate',
        type: 'dateTime',
        default: '',
        description: 'StartChangeDate — filtra registros alterados a partir desta data.',
      },
      {
        displayName: 'Data de Alteração (Fim)',
        name: 'EndChangeDate',
        type: 'dateTime',
        default: '',
        description: 'EndChangeDate — filtra registros alterados até esta data.',
      },
      {
        displayName: 'Ordenação',
        name: 'Order',
        type: 'string',
        default: '',
        placeholder: 'code asc',
        description: 'Order — campo e sentido da ordenação.',
      },
    ],
  },
  {
    displayName: 'Campos a Retornar',
    name: 'fields',
    type: 'multiOptions',
    default: [],
    displayOptions: { show: { operation: ['listCategories'] } },
    description:
      'Se vazio, retorna todos os campos. Caso contrário, apenas os selecionados são incluídos na saída.',
    options: [
      { name: 'code', value: 'code' },
      { name: 'description', value: 'description' },
      { name: 'parentCode', value: 'parentCode' },
      { name: 'level', value: 'level' },
      { name: 'changeDate', value: 'changeDate' },
      { name: 'insertDate', value: 'insertDate' },
    ],
  },
];
```

- [ ] **Step 3: Adicionar descrição da operação "Buscar Produtos" ao final do arquivo**

```typescript
export const searchProductsProperties: INodeProperties[] = [
  {
    displayName: 'Retornar Todos',
    name: 'returnAll',
    type: 'boolean',
    default: false,
    displayOptions: { show: { operation: ['searchProducts'] } },
    description: 'Se ativado, busca todas as páginas até esgotar.',
  },
  {
    displayName: 'Limite',
    name: 'limit',
    type: 'number',
    typeOptions: { minValue: 1 },
    default: 50,
    displayOptions: { show: { operation: ['searchProducts'], returnAll: [false] } },
    description: 'Máximo de itens a retornar.',
  },
  {
    displayName: 'Filtros',
    name: 'filter',
    type: 'collection',
    placeholder: 'Adicionar filtro',
    default: {},
    displayOptions: { show: { operation: ['searchProducts'] } },
    options: [
      {
        displayName: 'Change Date (Início)',
        name: 'startChangeDate',
        type: 'dateTime',
        default: '',
        description: 'Filtrar produtos alterados a partir desta data.',
      },
      {
        displayName: 'Change Date (Fim)',
        name: 'endChangeDate',
        type: 'dateTime',
        default: '',
        description: 'Filtrar produtos alterados até esta data.',
      },
      {
        displayName: 'Lista de Códigos de Produto',
        name: 'productCodeList',
        type: 'string',
        default: '',
        placeholder: '12345,67890',
        description: 'Lista de códigos separados por vírgula.',
      },
      {
        displayName: 'Lista de Códigos de Referência',
        name: 'referenceCodeList',
        type: 'string',
        default: '',
        placeholder: 'REF001,REF002',
        description: 'Lista de referências separadas por vírgula.',
      },
      {
        displayName: 'Apenas Ativos',
        name: 'isActive',
        type: 'boolean',
        default: true,
        description: 'Se verdadeiro, retorna apenas produtos ativos.',
      },
    ],
  },
  {
    displayName: 'Expand',
    name: 'expand',
    type: 'multiOptions',
    default: [],
    displayOptions: { show: { operation: ['searchProducts'] } },
    description: 'Dados adicionais a expandir na resposta.',
    options: [
      { name: 'additionalVariations', value: 'additionalVariations' },
      { name: 'classifications', value: 'classifications' },
      { name: 'suppliers', value: 'suppliers' },
      { name: 'stocks', value: 'stocks' },
    ],
  },
  {
    displayName: 'Campos a Retornar',
    name: 'fields',
    type: 'multiOptions',
    default: [],
    displayOptions: { show: { operation: ['searchProducts'] } },
    description:
      'Se vazio, retorna todos os campos. Caso contrário, apenas os selecionados são incluídos na saída.',
    options: [
      { name: 'productCode', value: 'productCode' },
      { name: 'productName', value: 'productName' },
      { name: 'referenceCode', value: 'referenceCode' },
      { name: 'categoryCode', value: 'categoryCode' },
      { name: 'isActive', value: 'isActive' },
      { name: 'changeDate', value: 'changeDate' },
      { name: 'insertDate', value: 'insertDate' },
    ],
  },
];
```

- [ ] **Step 4: Exportar array agregado ao final do arquivo**

```typescript
export const totvsModaProdutoProperties: INodeProperties[] = [
  ...baseProperties,
  ...listCategoriesProperties,
  ...searchProductsProperties,
];
```

- [ ] **Step 5: Compilar**

Rodar na pasta do pacote:

```bash
npx tsc --noEmit
```

Esperado: sem erros.

---

## Task 6: Handlers de execução das operações

**Files:**
- Create: `nodos/n8n-nodes-totvs-moda/nodes/TotvsModaProduto/execute.ts`

- [ ] **Step 1: Criar `execute.ts` com handler de "Listar Categorias"**

```typescript
import type { IDataObject, IExecuteFunctions } from 'n8n-workflow';

import {
  applyLimit,
  pickFields,
  totvsModaApiRequest,
  totvsModaApiRequestAllItemsQuery,
} from '../shared/GenericFunctions';

async function executeListCategories(
  this: IExecuteFunctions,
  itemIndex: number,
  baseUrl: string,
  accessToken: string,
): Promise<IDataObject[]> {
  const returnAll = this.getNodeParameter('returnAll', itemIndex) as boolean;
  const filters = this.getNodeParameter('filters', itemIndex, {}) as IDataObject;
  const fields = this.getNodeParameter('fields', itemIndex, []) as string[];

  const qs: IDataObject = {};
  if (filters.StartChangeDate) qs.StartChangeDate = filters.StartChangeDate;
  if (filters.EndChangeDate) qs.EndChangeDate = filters.EndChangeDate;
  if (filters.Order) qs.Order = filters.Order;

  let items: IDataObject[];
  if (returnAll) {
    items = await totvsModaApiRequestAllItemsQuery.call(
      this,
      baseUrl,
      accessToken,
      '/category',
      qs,
    );
  } else {
    const limit = this.getNodeParameter('limit', itemIndex) as number;
    const response = (await totvsModaApiRequest.call(
      this,
      baseUrl,
      accessToken,
      'GET',
      '/category',
      undefined,
      { ...qs, Page: 1, PageSize: limit },
    )) as { items?: IDataObject[] } | IDataObject[];
    const rawItems = Array.isArray(response) ? response : (response.items ?? []);
    items = applyLimit(rawItems, limit);
  }

  return items.map((it) => pickFields(it, fields));
}
```

- [ ] **Step 2: Adicionar handler de "Buscar Produtos"**

```typescript
import { totvsModaApiRequestAllItemsBody } from '../shared/GenericFunctions';

async function executeSearchProducts(
  this: IExecuteFunctions,
  itemIndex: number,
  baseUrl: string,
  accessToken: string,
): Promise<IDataObject[]> {
  const returnAll = this.getNodeParameter('returnAll', itemIndex) as boolean;
  const filter = this.getNodeParameter('filter', itemIndex, {}) as IDataObject;
  const expand = this.getNodeParameter('expand', itemIndex, []) as string[];
  const fields = this.getNodeParameter('fields', itemIndex, []) as string[];

  const body: IDataObject = { filter };
  if (expand.length > 0) body.expand = expand;

  let items: IDataObject[];
  if (returnAll) {
    items = await totvsModaApiRequestAllItemsBody.call(
      this,
      baseUrl,
      accessToken,
      '/products/search',
      body,
    );
  } else {
    const limit = this.getNodeParameter('limit', itemIndex) as number;
    const response = (await totvsModaApiRequest.call(
      this,
      baseUrl,
      accessToken,
      'POST',
      '/products/search',
      { ...body, page: 1, pageSize: limit },
    )) as { items?: IDataObject[] };
    items = applyLimit(response.items ?? [], limit);
  }

  return items.map((it) => pickFields(it, fields));
}
```

- [ ] **Step 3: Adicionar o dispatcher exportado**

```typescript
export async function executeOperation(
  this: IExecuteFunctions,
  operation: string,
  itemIndex: number,
  baseUrl: string,
  accessToken: string,
): Promise<IDataObject[]> {
  switch (operation) {
    case 'listCategories':
      return executeListCategories.call(this, itemIndex, baseUrl, accessToken);
    case 'searchProducts':
      return executeSearchProducts.call(this, itemIndex, baseUrl, accessToken);
    default:
      throw new Error(`Operação não suportada: ${operation}`);
  }
}
```

Observação: unificar os `import` duplicados no topo do arquivo em um único bloco antes de compilar.

- [ ] **Step 4: Compilar**

```bash
npx tsc --noEmit
```

Esperado: sem erros.

---

## Task 7: Entrypoint do node

**Files:**
- Create: `nodos/n8n-nodes-totvs-moda/nodes/TotvsModaProduto/TotvsModaProduto.node.ts`
- Create: `nodos/n8n-nodes-totvs-moda/nodes/TotvsModaProduto/TotvsModaProduto.node.json`

- [ ] **Step 1: Criar `TotvsModaProduto.node.ts`**

```typescript
import type {
  IExecuteFunctions,
  INodeExecutionData,
  INodeType,
  INodeTypeDescription,
} from 'n8n-workflow';
import { NodeConnectionType } from 'n8n-workflow';

import { totvsModaProdutoProperties } from './description';
import { executeOperation } from './execute';

export class TotvsModaProduto implements INodeType {
  description: INodeTypeDescription = {
    displayName: 'Totvs Moda Produto',
    name: 'totvsModaProduto',
    icon: 'file:totvs-moda-produto.svg',
    group: ['transform'],
    version: 1,
    subtitle: '={{$parameter["operation"]}}',
    description: 'Consulta dados do módulo Produto do Totvs Moda v2.',
    defaults: {
      name: 'Totvs Moda Produto',
    },
    inputs: [NodeConnectionType.Main],
    outputs: [NodeConnectionType.Main],
    properties: totvsModaProdutoProperties,
  };

  async execute(this: IExecuteFunctions): Promise<INodeExecutionData[][]> {
    const items = this.getInputData();
    const returnData: INodeExecutionData[] = [];

    for (let i = 0; i < items.length; i += 1) {
      try {
        const baseUrl = this.getNodeParameter('baseUrl', i) as string;
        const accessToken = this.getNodeParameter('accessToken', i) as string;
        const operation = this.getNodeParameter('operation', i) as string;

        const results = await executeOperation.call(this, operation, i, baseUrl, accessToken);

        for (const row of results) {
          returnData.push({ json: row, pairedItem: { item: i } });
        }
      } catch (error) {
        if (this.continueOnFail()) {
          returnData.push({
            json: { error: (error as Error).message },
            pairedItem: { item: i },
          });
          continue;
        }
        throw error;
      }
    }

    return [returnData];
  }
}
```

- [ ] **Step 2: Criar `TotvsModaProduto.node.json`** (metadata pro catálogo do n8n)

```json
{
  "node": "n8n-nodes-base.totvsModaProduto",
  "nodeVersion": "1.0",
  "codexVersion": "1.0",
  "categories": ["Data & Storage", "Productivity"],
  "resources": {
    "primaryDocumentation": [
      {
        "url": "https://github.com/"
      }
    ]
  }
}
```

- [ ] **Step 3: Compilar full build**

```bash
npm run build
```

Esperado:
- pasta `dist/` criada
- `dist/nodes/TotvsModaProduto/TotvsModaProduto.node.js` existe
- `dist/nodes/TotvsModaProduto/totvs-moda-produto.svg` existe (copiado pelo gulp)

---

## Task 8: Lint

**Files:** (nenhum novo — apenas validação)

- [ ] **Step 1: Rodar lint**

```bash
npm run lint
```

Esperado: saída limpa, sem erros. Se houver avisos do `eslint-plugin-n8n-nodes-base`, corrigir ou adicionar à exceção em `.eslintrc.js`.

- [ ] **Step 2: Commit (ou snapshot manual da pasta)**

Como o diretório raiz não é repo git (conforme environment), pular commit. Garantir que `dist/` está presente e o build é reprodutível com `npm run build`.

---

## Task 9: Verificação manual end-to-end em n8n local

**Files:** (nenhum — teste manual)

- [ ] **Step 1: Link do pacote**

Na pasta `nodos/n8n-nodes-totvs-moda/`:

```bash
npm link
```

Num diretório temporário com n8n self-hosted (ex.: `mkdir -p ~/n8n-test && cd ~/n8n-test && npm init -y && npm install n8n`):

```bash
npm link n8n-nodes-totvs-moda
```

Ou, alternativamente, copiar `dist/` para `~/.n8n/custom/node_modules/n8n-nodes-totvs-moda/`.

- [ ] **Step 2: Subir o n8n**

```bash
npx n8n start
```

Abrir `http://localhost:5678`.

- [ ] **Step 3: Montar workflow de teste**

1. **HTTP Request** node:
   - Method: POST
   - URL: `https://www30.bhan.com.br:9443/api/totvsmoda/authorization/v2/token`
   - Body Content Type: Form-Urlencoded
   - Body fields: `grant_type=password`, `client_id`, `client_secret`, `username`, `password` (credenciais reais)
   - Saída esperada: `{ access_token, expires_in, ... }`

2. **Set** node (opcional, para reorganizar):
   - `url` = `https://www30.bhan.com.br:9443`
   - `access_token` = `={{ $json.access_token }}`

3. **Totvs Moda Produto** node:
   - Base URL: `={{ $json.url }}`
   - Access Token: `={{ $json.access_token }}`
   - Operation: `Listar Categorias`
   - Retornar Todos: off
   - Limite: 5
   - Campos a Retornar: `code`, `description`
   - Executar.

- [ ] **Step 4: Validar saída da operação "Listar Categorias"**

Esperado:
- até 5 items
- cada item contém apenas as chaves `code` e `description`
- nenhum erro no node

- [ ] **Step 5: Testar a operação "Buscar Produtos"**

Trocar operation para `Buscar Produtos`, preencher `filter.isActive = true`, `limit = 3`, expand vazio, campos `productCode` e `productName`. Executar.

Esperado:
- até 3 produtos
- cada item com apenas `productCode` e `productName`

- [ ] **Step 6: Testar falha de token**

Trocar o `Access Token` para uma string inválida (ex.: `"abc"`) e reexecutar. Esperado: erro com mensagem `Token inválido ou expirado. Autentique novamente antes de chamar este node.`.

- [ ] **Step 7: Testar paginação completa**

Operation `Listar Categorias`, `Retornar Todos = true`, sem filtros. Esperado: retorna todas as categorias sem erro de timeout.

- [ ] **Step 8: Documentar descobertas**

Anotar em `nodos/n8n-nodes-totvs-moda/docs/verification-v0.1.md` quaisquer divergências observadas entre o design e o comportamento real (nomes de campos diferentes na resposta real, filtros extras úteis, etc.) para alimentar as iterações seguintes.

---

## Próximas iterações (fora desta v0.1)

Para cada operação restante do swagger (ordem sugerida por uso mais comum primeiro):

- `/products/{code}/{branchCode}` (GET) — buscar produto por código
- `/balances/search` (POST) — saldos
- `/prices/search` (POST) — preços
- `/costs/search` (POST) — custos
- `/references/search` (POST) — referências
- `/product-codes/search` (POST) — lista de códigos
- `/kardex-movement` (GET) — kardex
- `/price-tables/search` (POST) — preço por tabela
- `/price-tables-headers` (GET) — cabeçalhos de tabela
- `/price-table-scales` (GET) — escalas
- demais GETs de cadastros (grid, measurement-unit, classifications, classificationType, additional-fields-types, product-grouper-configuration, instruction-items, composition-group-product, composition-product)
- POSTs de consulta (omni-changed-balances, batch/search, colors/search, compositions)

Cada uma replica o padrão de Task 5 (entrada na `options` de `operation` + bloco de filtros/campos) + Task 6 (handler novo + case no dispatcher). Sem mudanças em GenericFunctions.
