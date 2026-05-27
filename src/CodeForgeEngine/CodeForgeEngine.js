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
      const configuredPlugins = Array.isArray(config.plugins) ? config.plugins : [];

      this.helperRegistry.register();
      await this.partialRegistry.register(configDir);
      if (configuredPlugins.length > 0) {
        await this.dependencyInstaller.install(resolvedTemplateDir);
      }
      const enrichedContext = await this.pluginLoader.load(
        configDir,
        config.globalContext,
        projectConfig,
        configuredPlugins,
      );
      if (!keepPluginDependencies && configuredPlugins.length > 0) {
        await this.dependencyInstaller.cleanup(resolvedTemplateDir);
      }

      for (const fileDef of config.files) {
        await this.generateFromFileDef(fileDef, configDir, enrichedContext);
      }

      await this.packageWriter.write(resolvedTemplateDir, resolvedOutputDir);

      console.log("✅ Geração concluída com sucesso!");
    } catch (error) {
      console.error("❌ Erro na execução:", error.message);
    }
  }

  async generateFromFileDef(fileDef, configDir, baseContext) {
    if (fileDef.forEach) {
      const items = baseContext[fileDef.forEach];
      if (items === undefined || items === null) {
        console.log(
          `⏭️ Pulando '${fileDef.templatePath}': contexto '${fileDef.forEach}' não foi fornecido`,
        );
        return;
      }

      if (!Array.isArray(items)) {
        throw new Error(`forEach '${fileDef.forEach}' precisa ser um array no contexto`);
      }

      const itemAlias = fileDef.itemAlias ?? "item";
      for (const item of items) {
        const itemContext = { ...baseContext, [itemAlias]: item };
        await this.generateSingleFile(fileDef, configDir, itemContext);
      }
      return;
    }

    await this.generateSingleFile(fileDef, configDir, baseContext);
  }

  async generateSingleFile(fileDef, configDir, context) {
    const renderedTemplatePath = this.renderer.renderString(fileDef.templatePath, context);
    const renderedOutputPath = this.renderer.renderString(fileDef.outputPath, context);

    const tmplPath = path.resolve(configDir, renderedTemplatePath);
    const outPath = path.resolve(configDir, renderedOutputPath);
    const content = await this.renderer.render(tmplPath, context);
    await this.writer.write(outPath, content);
  }
}
