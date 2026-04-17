# Design — `n8n-nodes-totvs-moda`

Data: 2026-04-17

## 1. Visão geral

Pacote de community nodes para n8n que expõe as APIs REST do **Totvs Moda v2** como recursos de leitura dentro de workflows. O pacote é publicado no npm como `n8n-nodes-totvs-moda` e agrupa múltiplos nodes, um por recurso de negócio. A primeira entrega cobre apenas o módulo **Produto**.

## 2. Escopo da v1

- Um único pacote npm: `n8n-nodes-totvs-moda`.
- Sem tipo de credencial próprio. O `accessToken` e o `baseUrl` são recebidos como parâmetros do node, preenchidos por expressão a partir do output de um node anterior (tipicamente um HTTP Request que autenticou contra `/api/totvsmoda/authorization/v2/token`).
- Um node de recurso: `Totvs Moda Produto`, cobrindo todos os endpoints expostos em `/api/totvsmoda/product/v2/` (tags `Product` e `PriceTable` do swagger).
- Operações apenas de leitura/consulta (GET / POST de filtro). Nenhuma operação de escrita nesta versão.
- Cada operação permite:
  - selecionar quais **campos** do response serão retornados para o próximo node;
  - aplicar os **filtros** disponíveis no endpoint correspondente.

Fora do escopo da v1: outros módulos do Totvs Moda (Pedidos, Pessoas, Notas, Fiscal, Financeiro, Estoque), operações de escrita, testes automatizados de integração contra a API real.

## 3. Estrutura do monorepo

O diretório raiz `/nodos/` contém pacotes independentes. Sem workspace. Cada subpasta tem o próprio `node_modules`, `package.json` e pipeline de build.

```
/nodos/
  n8n-nodes-totvs-moda/
    package.json
    tsconfig.json
    gulpfile.js
    .eslintrc.js
    .eslintrc.prepublish.js
    nodes/
      shared/
        GenericFunctions.ts
        types.ts
      TotvsModaProduto/
        TotvsModaProduto.node.ts
        TotvsModaProduto.node.json
        totvs-moda-produto.svg
        description.ts
        execute.ts
    docs/
      design.md
```

`package.json` segue a convenção de community node do n8n, incluindo a seção `n8n` com `nodes` apontando para os arquivos compilados em `dist/`. A chave `credentials` não é declarada — o pacote não expõe tipos de credencial.

## 4. Entradas comuns do node

Todo node deste pacote recebe dois parâmetros no topo do formulário, antes do seletor de operação:

| Parâmetro      | Tipo   | Origem típica                                   | Observação                                                          |
|----------------|--------|-------------------------------------------------|---------------------------------------------------------------------|
| `Base URL`     | string | expressão, ex: `{{ $json.url }}`                | Sem path, ex: `https://www30.bhan.com.br:9443`. Validado não-vazio. |
| `Access Token` | string | expressão, ex: `{{ $json.access_token }}`       | Bearer token já emitido por um node anterior.                       |

Responsabilidades:

- O node **não autentica**. Assume que o token recebido é válido.
- Todas as chamadas à API Totvs Moda usam header `Authorization: Bearer <accessToken>` e prefixam a URL com `{baseUrl}/api/totvsmoda/product/v2`.
- Se a API retornar `401 Unauthorized`, o node lança `NodeApiError` com mensagem indicando que o token é inválido ou expirou — cabe ao workflow autenticar de novo antes.

Essa divisão permite que o workflow controle o ciclo do token: autentica uma vez num HTTP Request node e reutiliza o mesmo token em várias chamadas aos nodes Totvs Moda em sequência.

## 5. Node `TotvsModaProduto`

### 5.1 Entrypoint — `TotvsModaProduto.node.ts`

Classe implementando `INodeType`. A `description` é composta a partir de `description.ts`. O método `execute` delega para `execute.ts`, que faz o dispatch por `operation`.

### 5.2 Operações

Derivadas dos tags `Product` e `PriceTable` do swagger v2.8.25. Cada item vira uma `operation` com seu próprio bloco de filtros e campos.

Lista inicial (confirmar contra o swagger no momento da implementação):

- **Produto**
  - Listar códigos de produto
  - Consultar saldos
  - Consultar preços
  - Consultar custos
  - Listar referências
  - Listar unidades de medida
  - Listar categorias
  - Listar grades
  - Listar códigos de barras
  - Listar classificações
  - Listar cores
  - Listar composições
  - Consultar kardex (movimentações)
- **Tabelas de preço**
  - Consultar preço por tabela
  - Consultar escala de preço

Se o swagger expuser endpoints adicionais no momento da implementação, eles entram na mesma estrutura.

### 5.3 UI de cada operação

Topo do formulário (mesmos campos para toda operação):

- `Base URL` (string, obrigatório, expressão habilitada)
- `Access Token` (string, obrigatório, expressão habilitada)
- `Operação` (options)

Três blocos específicos da operação, abaixo do seletor:

1. **Filtros** — coleção `fixedCollection` ou `collection` com os parâmetros do endpoint (query, body filter). Cada filtro é tipado conforme o swagger (string, number, date, boolean, enum). Filtros opcionais aparecem numa `collection` "Filtros adicionais" para manter o formulário enxuto.
2. **Campos a retornar** — `multiOptions` com todos os campos do schema de resposta daquela operação. Default: todos marcados. Pós-processamento client-side: o node recebe o response completo da API e projeta somente as chaves selecionadas em cada item antes de emitir.
3. **Paginação** — toggle `Retornar todos` (auto-pagina até esgotar) vs `Limite` (int, default 50). A API usa page/pageSize, default 1000 / max 1000. Auto-paginação itera até `items.length < pageSize` ou até atingir o limite.

### 5.4 Output

Cada item retornado pela API vira um `INodeExecutionData` no output. Erros da API (`DomainNotificationMessage`) são lançados como `NodeApiError` com o `message` da Totvs, respeitando o `continueOnFail()` do n8n.

## 6. `shared/GenericFunctions.ts`

Funções comuns a todos os nodes do pacote. Nenhuma delas lida com obtenção de token.

- `totvsModaApiRequest(this, baseUrl, accessToken, method, endpoint, body?, qs?)` — monta a URL (`{baseUrl}/api/totvsmoda/product/v2{endpoint}`), aplica header `Authorization: Bearer <accessToken>`, dispara via `this.helpers.httpRequest`.
- `totvsModaApiRequestAllItems(this, baseUrl, accessToken, method, endpoint, body, qs, propertyName)` — auto-paginação baseada em `page`/`pageSize`.
- `pickFields(item, fields)` — projeta um item para apenas as chaves selecionadas.

## 7. Tratamento de erros

- Token ausente/vazio nos parâmetros → erro de validação antes de chamar a API.
- HTTP 401 da API → `NodeApiError` com mensagem dizendo que o token é inválido ou expirou; o workflow deve autenticar de novo.
- HTTP 4xx/5xx da API → `NodeApiError` usando a mensagem do `DomainNotificationMessage` quando presente.
- Rate limit / timeout → propaga como erro, sem retry automático na v1.
- `continueOnFail()` respeitado em cada item.

## 8. Build e publicação

- TypeScript compilado para `dist/`.
- `gulpfile.js` copia SVGs de ícone para `dist/`.
- Scripts: `build`, `dev` (tsc --watch), `lint`, `lintfix`, `prepublishOnly` (lint + build).
- Publicação: `npm publish` manual. Versionamento semver; v1 sai como `0.1.0`.

## 9. Testes

V1 prioriza verificação manual num n8n local:

1. `npm run build` no pacote.
2. `npm link` dentro do pacote; `npm link n8n-nodes-totvs-moda` num n8n self-hosted (ou copiar para `~/.n8n/custom/`).
3. Montar workflow de teste: um HTTP Request node autentica contra `{host}/api/totvsmoda/authorization/v2/token` e passa `access_token` + `url` adiante. Rodar cada operação do node Totvs Moda Produto contra `https://www30.bhan.com.br:9443`, validar output, filtros e paginação.

Sem testes unitários nesta entrega. Adicionar em release futura se a complexidade de `GenericFunctions` crescer.

## 10. Questões em aberto

Nenhuma bloqueante. Itens a resolver durante a implementação:

- Lista final de operações e campos derivada do swagger ao vivo no momento de codar.
- Nomes exatos dos parâmetros de filtro por endpoint (serão tirados do swagger).
