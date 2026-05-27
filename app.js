import { Command } from "commander";
import { CodeForgeEngine } from "./src/CodeForgeEngine/CodeForgeEngine.js";
import { ProjectConfigLoader } from "./src/ProjectConfigLoader/ProjectConfigLoader.js";

const program = new Command();

program
  .name("codeforge")
  .description("Engine de scaffolding de código inteligente")
  .version("0.1.0");

program
  .command("generate")
  .description("Gera o código a partir de um arquivo de configuração")
  .argument("[configPath]", "Caminho para o template.config.json")
  .action(async (configPath) => {
    let outputDir, templateDir, keepPluginDependencies;
    if (!configPath) {
      const projectLoader = new ProjectConfigLoader();
      ({ configPath, outputDir, templateDir, keepPluginDependencies } =
        await projectLoader.resolve());
    }
    const engine = new CodeForgeEngine();
    engine.run(configPath, { outputDir, templateDir, keepPluginDependencies });
  });

program.parse(process.argv);
