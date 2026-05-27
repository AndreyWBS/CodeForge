import path from "path";
import { ConfigLoader } from "../ConfigLoader/ConfigLoader.js";
import { HelperRegistry } from "../HelperRegistry/HelperRegistry.js";
import { PartialRegistry } from "../PartialRegistry/PartialRegistry.js";
import { PluginLoader } from "../PluginLoader/PluginLoader.js";
import { TemplateRenderer } from "../TemplateRenderer/TemplateRenderer.js";
import { FileWriter } from "../FileWriter/FileWriter.js";
import { PackageWriter } from "../PackageWriter/PackageWriter.js";
import { DependencyInstaller } from "../DependencyInstaller/DependencyInstaller.js";
import { ConfigValidator } from "../ConfigValidator/ConfigValidator.js";

export class CodeForgeEngine {
  constructor() {
    this.configLoader = new ConfigLoader();
    this.helperRegistry = new HelperRegistry();
    this.partialRegistry = new PartialRegistry();
    this.dependencyInstaller = new DependencyInstaller();
    this.pluginLoader = new PluginLoader();
    this.renderer = new TemplateRenderer();
    this.writer = new FileWriter();
    this.packageWriter = new PackageWriter();
    this.configValidator = new ConfigValidator();
  }

  async run(
    configPath,
    { outputDir, templateDir, keepPluginDependencies = false, projectConfig = {} } = {},
  ) {
    console.log(`🚀 Iniciando CodeForge... Lendo ${configPath}`);

    try {
      const config = await this.configLoader.load(configPath);
      console.log("📦 Contexto Global carregado:", Object.keys(config.globalContext));

      this.configValidator.validate(config.requiredConfig, projectConfig);

      const configDir = path.dirname(path.resolve(configPath));
      const resolvedTemplateDir = templateDir ?? configDir;
      const resolvedOutputDir = outputDir ?? path.resolve(configDir, "../dist");

      this.helperRegistry.register();
      await this.partialRegistry.register(configDir);
      await this.dependencyInstaller.install(resolvedTemplateDir);
      const enrichedContext = await this.pluginLoader.load(
        configDir,
        config.globalContext,
        projectConfig,
      );
      if (!keepPluginDependencies) {
        await this.dependencyInstaller.cleanup(resolvedTemplateDir);
      }

      for (const fileDef of config.files) {
        const tmplPath = path.resolve(configDir, fileDef.templatePath);
        const outPath = path.resolve(configDir, fileDef.outputPath);
        const content = await this.renderer.render(tmplPath, enrichedContext);
        await this.writer.write(outPath, content);
      }

      await this.packageWriter.write(resolvedTemplateDir, resolvedOutputDir);

      console.log("✅ Geração concluída com sucesso!");
    } catch (error) {
      console.error("❌ Erro na execução:", error.message);
    }
  }
}
