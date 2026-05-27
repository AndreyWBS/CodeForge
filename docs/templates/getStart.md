# CodeForge - Como Criar um Template do Zero

Este guia e 100% generico. O objetivo e ensinar como criar qualquer template customizado no CodeForge, sem depender de um template especifico.

## 1. O Que e um Template

Um template no CodeForge e um pacote que descreve:

- quais arquivos serao gerados
- quais dados entram no processo de geracao
- quais transformacoes sao aplicadas antes de renderizar os arquivos

Um template costuma ter 5 partes:

1. `arquivos/`: templates `.hbs` finais
2. `componentes/`: partials reutilizaveis
3. `plugins/`: enriquecem ou transformam contexto
4. `template.config.json`: contrato de geracao
5. `package.json`: dependencias do template e do projeto gerado

## 2. Estrutura Minima Recomendada

```text
template/
  arquivos/
  componentes/
  plugins/
  template.config.json
  package.json
```

Sugestao quando o template cresce:

```text
template/
  arquivos/
    apps/
    config/
    infra/
    models/
    services/
    controllers/
    routers/
  componentes/
  plugins/
  template.config.json
  package.json
```

## 3. Ciclo de Execucao do Template

Fluxo mental da engine:

1. Le `codeForge.config.json` (projeto consumidor)
2. Le `template.config.json` (contrato do template)
3. Registra partials de `componentes/`
4. Executa plugins na ordem declarada em `template.config.json`
5. Renderiza cada item de `files`

Se um item de `files` usa `forEach`, ele gera uma copia para cada elemento do array.

## 4. Arquivo Principal: template.config.json

Exemplo generico:

```json
{
  "requiredConfig": {
    "projectName": "Nome do projeto consumidor"
  },
  "globalContext": {
    "author": "Default Author"
  },
  "plugins": [{ "name": "collect-data.js" }, { "name": "build-resources.js" }],
  "files": [
    {
      "templatePath": "./arquivos/apps/main.hbs",
      "outputPath": "../dist/src/main.js"
    },
    {
      "templatePath": "./arquivos/services/resource.hbs",
      "outputPath": "../dist/src/services/{{resource.fileName}}.js",
      "forEach": "resources",
      "itemAlias": "resource"
    }
  ]
}
```

Campos essenciais:

- `requiredConfig`: campos obrigatorios do `codeForge.config.json`
- `globalContext`: valores iniciais
- `plugins`: pipeline ordenado de plugins
- `files`: o que gerar
- `forEach`: nome de um array no contexto
- `itemAlias`: nome da variavel por item

## 5. Como Criar Plugins

### 5.1 Contrato

Plugin pode ter duas funcoes:

```js
export default function (Handlebars) {
  // opcional: registrar helpers
}

export async function enrichContext(context, projectConfig) {
  // opcional: retornar dados adicionais para contexto
  return {
    newField: "value",
  };
}
```

### 5.2 Regra de Ouro: Responsabilidade Unica

Cada plugin deve resolver apenas um problema.

Exemplos de responsabilidades validas:

- plugin A: coletar dados de uma API
- plugin B: normalizar dados
- plugin C: transformar dados em recursos de geracao

Evite plugin que:

- coleta dados
- transforma dados
- valida politicas
- escreve arquivo

tudo no mesmo arquivo.

### 5.3 Ordem de Execucao

A ordem em `plugins` e a ordem real de execucao. Isso define dependencias entre plugins.

Se plugin B depende de um campo criado por A, A deve vir antes.

## 6. Como Criar Componentes (partials)

Componentes sao blocos `.hbs` reutilizaveis em varios templates.

Quando extrair para componente:

- bloco repetido em 2+ arquivos
- bloco que muda junto em varios lugares

Exemplo de uso:

```hbs
{{> route-method}}
{{> class-header name=resource.className}}
```

Boas praticas:

- componentes pequenos
- nome objetivo
- sem logica complexa demais dentro do partial

## 7. Dependencias: Onde Declarar Cada Tipo

No `template/package.json`, voce pode separar dependencias por finalidade.

### 7.1 dependencies

Pacotes que o projeto gerado vai usar em runtime.

### 7.2 devDependencies

Pacotes de build, lint, testes e tipagem do projeto gerado.

### 7.3 pluginDependencies

Pacotes necessarios para os plugins rodarem durante a geracao.

Exemplo generico:

```json
{
  "name": "my-template",
  "version": "1.0.0",
  "type": "module",
  "dependencies": {
    "framework-x": "^1.0.0"
  },
  "devDependencies": {
    "tool-y": "^2.0.0"
  },
  "pluginDependencies": {
    "client-z": "^3.0.0"
  }
}
```

Resumo rapido:

- usa no app final? `dependencies`
- usa para desenvolvimento do app final? `devDependencies`
- usa so no plugin durante geracao? `pluginDependencies`

## 8. Configuracao do Projeto Consumidor

`codeForge.config.json` pertence ao projeto que vai consumir o template.

Ele deve apontar para o template e fornecer entradas de contexto.

Exemplo generico:

```json
{
  "template": "./template",
  "output": "./dist",
  "keepPluginDependencies": false,
  "projectName": "Meu Projeto",
  "features": {
    "auth": true
  }
}
```

## 9. Geracao Dinamica com forEach

Use `forEach` para gerar N arquivos a partir de um array do contexto.

Exemplo:

```json
{
  "templatePath": "./arquivos/resource.hbs",
  "outputPath": "../dist/src/resources/{{resource.name}}.js",
  "forEach": "resources",
  "itemAlias": "resource"
}
```

Se o array nao existir, a engine pode pular o arquivo com aviso (dependendo da configuracao atual da engine).

## 10. Criacao do Zero: Passo a Passo

1. Crie a estrutura de pastas do template
2. Escreva `template.config.json` com `requiredConfig`, `plugins` e `files`
3. Crie o primeiro plugin de dados
4. Crie o segundo plugin para transformar dados em recursos
5. Crie templates em `arquivos/`
6. Extraia repeticoes para `componentes/`
7. Configure `package.json` com dependencias corretas
8. Rode `node . generate`
9. Inspecione `dist/`
10. Refatore componentes/plugins conforme necessario

## 11. Erros Comuns

### 11.1 Plugin nao executa

- verifique se esta em `plugins` no `template.config.json`
- verifique nome exato do arquivo

### 11.2 Variavel nao aparece no template

- verifique se algum plugin adiciona a variavel
- confirme ordem dos plugins

### 11.3 Arquivo nao gerado com forEach

- verifique se o array existe no contexto
- verifique `forEach` e `itemAlias`

### 11.4 Dependencia faltando no plugin

- coloque em `pluginDependencies`

## 12. Checklist Final de Qualidade

- plugins com responsabilidade unica
- ordem do pipeline documentada
- componentes para blocos repetidos
- nenhum caminho hardcoded desnecessario
- `requiredConfig` cobrindo entradas obrigatorias
- `template.package.json` separado por tipo de dependencia
- geracao funcionando sem erro

## 13. O Que Documentar no README do Template

Sempre crie tambem um `README.md` dentro da pasta do template com:

- objetivo do template
- o que gera
- quais chaves aceita no `codeForge.config.json`
- quais plugins compoem o pipeline
- quais convencoes de naming ele usa
- quais limitacoes conhecidas existem

Esse arquivo (`getStart.md`) ensina o metodo. O README do template explica a implementacao concreta.
