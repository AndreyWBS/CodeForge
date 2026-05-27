#!/usr/bin/env node
import { Command } from "commander";
import { CodeForgeEngine } from "./src/CodeForgeEngine/CodeForgeEngine.js";
import { ProjectConfigLoader } from "./src/ProjectConfigLoader/ProjectConfigLoader.js";
import { TemplateSourceResolver } from "./src/TemplateSourceResolver/TemplateSourceResolver.js";
import { TemplateScaffolder } from "./src/TemplateScaffolder/TemplateScaffolder.js";

const program = new Command();
const templateSourceResolver = new TemplateSourceResolver();

program
  .name("codeforge")
  .description("Engine de scaffolding de código inteligente")
  .version("0.1.0");

program
  .command("generate")
  .description("Gera o código a partir de um arquivo de configuração")
  .argument("[configPath]", "Caminho para o template.config.json")
  .action(async (configPath) => {
    let outputDir, templateDir, keepPluginDependencies, projectConfig;
    if (!configPath) {
      const projectLoader = new ProjectConfigLoader();
      ({ configPath, outputDir, templateDir, keepPluginDependencies, projectConfig } =
        await projectLoader.resolve());
    }
    const engine = new CodeForgeEngine();
    await engine.run(configPath, {
      outputDir,
      templateDir,
      keepPluginDependencies,
      projectConfig,
    });
  });

program
  .command("cache:list")
  .description("Lista os templates atualmente armazenados em cache")
  .action(async () => {
    const cacheEntries = await templateSourceResolver.listCache(process.cwd());

    if (cacheEntries.length === 0) {
      console.log("📭 Nenhum template encontrado no cache.");
      return;
    }

    console.log("📚 Templates em cache:");
    for (const entry of cacheEntries) {
      console.log(` - ${entry}`);
    }
  });

program
  .command("cache:clear")
  .description("Remove todo o cache de templates")
  .action(async () => {
    const removed = await templateSourceResolver.clearCache(process.cwd());
    if (!removed) {
      console.log("📭 Cache inexistente. Nada para limpar.");
      return;
    }

    console.log("🧹 Cache de templates limpo com sucesso.");
  });

program
  .command("template:create <nome>")
  .description("Cria a estrutura inicial de um novo template")
  .action(async (nome) => {
    const scaffolder = new TemplateScaffolder();
    try {
      const templateDir = await scaffolder.create(process.cwd(), nome);
      console.log(`✅ Template '${nome}' criado em: ${templateDir}`);
      console.log("   arquivos/");
      console.log("   componentes/");
      console.log("   plugins/");
      console.log("   template.config.json");
      console.log("   package.json");
    } catch (error) {
      console.error(`❌ ${error.message}`);
      process.exit(1);
    }
  });

program.parse(process.argv);
