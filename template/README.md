# Template REST SOLID - Especificacao do Template Atual

Este arquivo documenta somente o template atual em [template](template), com foco no que ele gera, como decide o que gerar e quais configuracoes suporta.

## 1. Objetivo

Este template gera uma API REST em JavaScript (Node + Express) com organizacao em camadas:

- config
- infra/database
- models
- services
- controllers
- routers
- app

Ele usa plugins para montar contexto dinamico com base no banco e nas configuracoes de API.

## 2. Estrutura do Template

```text
template/
  arquivos/
    apps/
    config/
    infra/database/
    models/
    services/
    controllers/
    routers/
    legacy/
  componentes/
  plugins/
    db-schema.js
    api-resources.js
  template.config.json
  package.json
```

## 3. Pipeline de Plugins (ordem obrigatoria)

Definido em [template/template.config.json](template/template.config.json):

1. `db-schema.js`
2. `api-resources.js`

### 3.1 db-schema.js (responsabilidade unica)

- conecta no banco com `projectConfig.database`
- coleta:
  - `tables`
  - `tableSchemas` (`name`, `primaryKey`, `columns`)

Nao decide regras de CRUD nem rotas customizadas.

### 3.2 api-resources.js (responsabilidade unica)

- recebe `tableSchemas`
- aplica regras de `projectConfig.api`
- gera `apiResources` com:
  - tabela alvo
  - flags CRUD (`list`, `getById`, `create`, `update`, `remove`)
  - `customRoutes` parseadas de notacao curta

Nao conecta no banco.

## 4. Contexto Principal Usado na Geracao

Campos de contexto mais importantes:

- `tables`
- `tableSchemas`
- `apiResources`
- `globalContext` do template

A maior parte dos arquivos dinamicos usa `forEach: "apiResources"`.

## 5. O que este template gera

Arquivos base:

- `src/config/env.js`
- `.env.example`
- `src/infra/database/connection.js`
- `src/models/base.model.js`
- `src/services/base.service.js`
- `src/app.solid.js`

Arquivos por recurso (por tabela selecionada):

- `src/models/<resource>.model.js`
- `src/services/<resource>.service.js`
- `src/controllers/<resource>.controller.js`
- `src/routers/<resource>.router.js`

## 6. Configuracoes suportadas no codeForge.config.json

### 6.1 Obrigatoria para este template

- `database`

### 6.2 Opcional para comportamento dinamico

- `api.includeTables`: limita quais tabelas entram na geracao
- `api.tables.<nome>.enabled`: habilita/desabilita recurso
- `api.tables.<nome>.steps`: CRUD parcial
- `api.tables.<nome>.routes`: rotas customizadas

### Exemplo

```json
{
  "template": "./template",
  "output": "./dist",
  "keepPluginDependencies": true,
  "database": {
    "host": "localhost",
    "port": 3306,
    "user": "root",
    "password": "senha",
    "database": "sistema"
  },
  "api": {
    "includeTables": ["usuarios", "categorias"],
    "tables": {
      "usuarios": {
        "steps": ["list", "getById"],
        "routes": ["GET /search/by-email => findByEmail", "POST /:id/activate => activate"]
      },
      "categorias": {
        "steps": ["list"]
      }
    }
  }
}
```

## 7. Notacao curta de rotas customizadas

Formato:

```text
METHOD /path => handlerName
```

Exemplos validos:

- `GET /search/by-email => findByEmail`
- `POST /:id/activate => activate`
- `PATCH /:id/archive`

Se `handlerName` nao vier, e gerado automaticamente.

## 8. Regras de CRUD parcial

`steps` aceitos:

- `list`
- `getById`
- `create`
- `update`
- `remove`

Sem `steps`, o padrao e CRUD completo.

## 9. Componentes (partials) importantes

Este template usa componentes para evitar repeticao.

Exemplos:

- metodos CRUD de controller
- declaracao de rotas customizadas
- imports e binds de routers no app

Pasta: [template/componentes](template/componentes)

## 10. Dependencias

`template/package.json` define:

- `dependencies` e `devDependencies` do projeto gerado
- `pluginDependencies` usadas para executar plugins do template

## 11. Comportamento quando plugins nao estao configurados

Se `plugins` nao for informado em `template.config.json`:

- nenhum plugin e executado
- arquivos com `forEach` dependente de contexto ausente sao pulados com aviso
- a geracao nao quebra por esse motivo

## 12. Convencoes deste template

- nomes de arquivos por recurso em camelCase
- classes em PascalCase
- organizacao por camada em `src`
- model acessa banco, service orquestra, controller responde HTTP, router mapeia rotas

## 13. Limites atuais

- rotas customizadas geram metodos base no model/service/controller; implementacao de negocio fina fica para customizacao manual
- validacao de payload ainda nao e gerada automaticamente
- autorizacao/autenticacao nao e gerada por padrao

## 14. Extensao recomendada

Para evoluir sem quebrar o template:

1. adicionar novos plugins pequenos no pipeline
2. adicionar componentes antes de duplicar bloco em templates
3. manter cada plugin com responsabilidade unica
4. evitar que templates de camada HTTP conhecam detalhes de banco

## 15. Arquivos-chave para manutencao

- [template/template.config.json](template/template.config.json)
- [template/plugins/db-schema.js](template/plugins/db-schema.js)
- [template/plugins/api-resources.js](template/plugins/api-resources.js)
- [template/arquivos/models/base.model.hbs](template/arquivos/models/base.model.hbs)
- [template/arquivos/services/base.service.hbs](template/arquivos/services/base.service.hbs)
- [template/arquivos/apps/app.solid.hbs](template/arquivos/apps/app.solid.hbs)
