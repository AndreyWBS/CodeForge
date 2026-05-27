import fs from "fs-extra";
import path from "path";

export class ProjectConfigLoader {
  async resolve(cwd = process.cwd()) {
    const projectConfigPath = path.join(cwd, "codeForge.config.json");
    const raw = await fs.readFile(projectConfigPath, "utf-8");
    const config = JSON.parse(raw);
    return {
      configPath: path.join(cwd, config.template, "template.config.json"),
      outputDir: path.resolve(cwd, config.output ?? "./dist"),
      templateDir: path.resolve(cwd, config.template),
      keepPluginDependencies: config.keepPluginDependencies ?? false,
    };
  }
}
