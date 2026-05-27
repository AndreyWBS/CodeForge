# CodeForge

> Engine de scaffolding de código inteligente baseada em templates Handlebars.

**Versão:** `1.0.0`

---

## O que é

O CodeForge gera projetos completos a partir de templates `.hbs` e um arquivo de configuração `codeForge.config.json`.
Você descreve **o que gerar**, ele resolve o template (local ou do GitHub), executa os plugins e escreve os arquivos.

---

## Instalação

```bash
# Clone o repositório
git clone https://github.com/AndreyWBS/CodeForge.git
cd CodeForge

# Instale as dependências
npm install

# Registre o CLI globalmente
npm link
```

Após o `npm link`, o comando `codeforge` fica disponível em qualquer pasta do sistema.

---

## Como usar

### 1. Crie o arquivo de configuração no seu projeto

```json
// codeForge.config.json
{
  "template": "https://github.com/seu-usuario/seu-template",
  "output": "./dist"
}
```

Ou aponte para um template local:

```json
{
  "template": "./meu-template",
  "output": "./dist"
}
```

### 2. Execute a geração

```bash
codeforge generate
```

Os arquivos serão criados em `./dist` (ou no diretório configurado em `output`).

---

## Comandos disponíveis

| Comando                            | Descrição                                                |
| ---------------------------------- | -------------------------------------------------------- |
| `codeforge generate`               | Gera o projeto a partir do `codeForge.config.json` local |
| `codeforge template:create <nome>` | Cria a estrutura inicial de um novo template             |
| `codeforge cache:list`             | Lista os templates remotos em cache                      |
| `codeforge cache:clear`            | Remove todo o cache de templates                         |

---

## Templates

### Usando um template do GitHub

```json
{
  "template": "https://github.com/usuario/repo",
  "output": "./dist"
}
```

Também é possível apontar para uma branch, tag ou subpasta específica:

```json
{
  "template": {
    "github": {
      "repo": "usuario/repo",
      "ref": "v2.0.0",
      "path": "templates/node-api"
    }
  }
}
```

Para repositórios privados, use um token:

```json
{
  "template": {
    "github": {
      "repo": "usuario/repo-privado",
      "token": "ghp_..."
    }
  }
}
```

Ou defina a variável de ambiente `CODEFORGE_GITHUB_TOKEN` / `GITHUB_TOKEN`.

### Criando seu próprio template

Rode o comando abaixo para gerar a estrutura inicial:

```bash
codeforge template:create meu-template
```

Estrutura gerada:

```
meu-template/
  arquivos/        ← templates .hbs finais
  componentes/     ← partials reutilizáveis
  plugins/         ← enriquecem o contexto antes da geração
  template.config.json
  package.json
```

Para aprender a montar um template completo do zero, consulte o [guia de criação de templates](docs/templates/getStart.md).

---

## Estrutura do codeForge.config.json

| Campo                    | Tipo                 | Obrigatório | Descrição                                                   |
| ------------------------ | -------------------- | ----------- | ----------------------------------------------------------- |
| `template`               | `string` ou `object` | ✅          | Caminho local ou referência GitHub do template              |
| `output`                 | `string`             | ❌          | Diretório de saída (padrão: `./dist`)                       |
| `keepPluginDependencies` | `boolean`            | ❌          | Mantém dependências de plugins após gerar (padrão: `false`) |

Qualquer campo adicional é passado como contexto para os templates e plugins.

---

## Roadmap

- [x] Geração de projetos a partir de templates locais
- [x] Suporte a templates remotos via URL do GitHub
- [x] Suporte a branch, tag e subpasta no template remoto
- [x] Cache de templates remotos
- [x] CLI global via `npm link` / `npm install -g`
- [x] Comando `template:create` para scaffolding de novos templates
- [x] Plugins para enriquecimento de contexto
- [x] Partials (componentes reutilizáveis)
- [x] Geração dinâmica com `forEach`
- [ ] Tratamento de conflitos de arquivos já gerados — estratégias configuráveis: `overwrite`, `skip`, `ask` e `merge`
- [ ] Comando `codeforge diff` — exibe o que mudaria antes de sobrescrever arquivos existentes
- [ ] Dry run (`--dry-run`) — simula a geração sem escrever arquivos no disco
- [ ] Log de arquivos gerados em `.codeforge/last-run.json` para rastreamento e rollback
- [ ] Comando `codeforge rollback` — desfaz a última geração a partir do log
- [ ] Suporte a hooks no template (`beforeGenerate`, `afterGenerate`) para scripts pós-geração
- [ ] Herança de templates — um template pode estender outro e sobrescrever apenas partes
- [ ] Comando `codeforge template:publish` — empacota e publica o template no npm ou GitHub Releases
- [ ] Modo interativo para plugins — plugin pode fazer perguntas ao usuário durante a geração

---

## Licença

ISC
