import { Command } from "commander";
import Handlebars from "handlebars";
import fs from "fs-extra";
import path from "path";

// A Engine Principal
class CodeForgeEngine {
  async run(configPath) {
    console.log(`🚀 Iniciando CodeForge... Lendo ${configPath}`);

    try {
      // Passo A: Ler a configuração do JSON
      const configRaw = await fs.readFile(configPath, "utf-8");
      const config = JSON.parse(configRaw);

      console.log("📦 Contexto Global carregado:", Object.keys(config.globalContext));

      // Passo B: Processar cada arquivo definido na configuração
      const configDir = path.dirname(path.resolve(configPath));
      for (const fileDef of config.files) {
        const templatePath = path.resolve(configDir, fileDef.templatePath);
        const outputPath = path.resolve(configDir, fileDef.outputPath);
        await this.generateFile(templatePath, outputPath, config.globalContext);
      }

      console.log("✅ Geração concluída com sucesso!");
    } catch (error) {
      console.error("❌ Erro na execução:", error.message);
    }
  }

  async generateFile(templatePath, outputPath, context) {
    // 1. Ler o arquivo HBS do disco
    const templateString = await fs.readFile(templatePath, "utf-8");

    // 2. Compilar com Handlebars e injetar o contexto
    const compiledTemplate = Handlebars.compile(templateString);
    const finalCode = compiledTemplate(context);

    // 3. Garantir que a pasta de destino existe e salvar o arquivo
    await fs.ensureDir(path.dirname(outputPath));
    await fs.writeFile(outputPath, finalCode, "utf-8");

    console.log(`📄 Arquivo gerado: ${outputPath}`);
  }
}

// Configuração da CLI usando Commander
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

// Pega os argumentos do terminal e roda o comando
program.parse(process.argv);
