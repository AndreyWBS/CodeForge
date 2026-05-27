import { Command } from "commander";
import { CodeForgeEngine } from "./src/CodeForgeEngine/CodeForgeEngine.js";

const program = new Command();

program
  .name("codeforge")
  .description("Engine de scaffolding de código inteligente")
  .version("0.1.0");

program
  .command("generate")
  .description("Gera o código a partir de um arquivo de configuração")
  .argument("<configPath>", "Caminho para o template.config.json")
  .action((configPath) => {
    const engine = new CodeForgeEngine();
    engine.run(configPath);
  });

program.parse(process.argv);

// Pega os argumentos do terminal e roda o comando
program.parse(process.argv);
