import path from "path";
import { ConfigLoader } from "../ConfigLoader/ConfigLoader.js";
import { HelperRegistry } from "../HelperRegistry/HelperRegistry.js";
import { PartialRegistry } from "../PartialRegistry/PartialRegistry.js";
import { PluginLoader } from "../PluginLoader/PluginLoader.js";
import { TemplateRenderer } from "../TemplateRenderer/TemplateRenderer.js";
import { FileWriter } from "../FileWriter/FileWriter.js";

export class CodeForgeEngine {
  constructor() {
    this.configLoader = new ConfigLoader();
    this.helperRegistry = new HelperRegistry();
    this.partialRegistry = new PartialRegistry();
    this.pluginLoader = new PluginLoader();
    this.renderer = new TemplateRenderer();
    this.writer = new FileWriter();
  }

  async run(configPath) {
    console.log(`🚀 Iniciando CodeForge... Lendo ${configPath}`);

    try {
      const config = await this.configLoader.load(configPath);
      console.log("📦 Contexto Global carregado:", Object.keys(config.globalContext));

      const configDir = path.dirname(path.resolve(configPath));

      this.helperRegistry.register();
      await this.partialRegistry.register(configDir);
      await this.pluginLoader.load(configDir);

      for (const fileDef of config.files) {
        const templatePath = path.resolve(configDir, fileDef.templatePath);
        const outputPath = path.resolve(configDir, fileDef.outputPath);
        const content = await this.renderer.render(templatePath, config.globalContext);
        await this.writer.write(outputPath, content);
      }

      console.log("✅ Geração concluída com sucesso!");
    } catch (error) {
      console.error("❌ Erro na execução:", error.message);
    }
  }
}
