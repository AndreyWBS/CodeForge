import fs from "fs-extra";
import path from "path";
import { TemplateSourceResolver } from "../TemplateSourceResolver/TemplateSourceResolver.js";

export class ProjectConfigLoader {
  constructor() {
    this.templateSourceResolver = new TemplateSourceResolver();
  }

  async resolve(cwd = process.cwd()) {
    const projectConfigPath = path.join(cwd, "codeForge.config.json");
    const raw = await fs.readFile(projectConfigPath, "utf-8");
    const config = JSON.parse(raw);

    const templateDir = await this.templateSourceResolver.resolve(cwd, config.template, config);

    return {
      configPath: path.join(templateDir, "template.config.json"),
      outputDir: path.resolve(cwd, config.output ?? "./dist"),
      templateDir,
      keepPluginDependencies: config.keepPluginDependencies ?? false,
      projectConfig: config,
    };
  }
}
