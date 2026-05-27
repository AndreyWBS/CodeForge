import fs from "fs-extra";
import path from "path";

const TEMPLATE_CONFIG = `{
  "requiredConfig": {},
  "globalContext": {},
  "plugins": [],
  "files": []
}
`;

const PACKAGE_JSON = (name) => `{
  "name": "${name}",
  "version": "1.0.0",
  "type": "module",
  "dependencies": {},
  "devDependencies": {},
  "pluginDependencies": {}
}
`;

export class TemplateScaffolder {
  async create(cwd, templateName) {
    const templateDir = path.join(cwd, templateName);

    if (await fs.pathExists(templateDir)) {
      throw new Error(`Pasta '${templateName}' já existe.`);
    }

    await fs.ensureDir(path.join(templateDir, "arquivos"));
    await fs.ensureDir(path.join(templateDir, "componentes"));
    await fs.ensureDir(path.join(templateDir, "plugins"));

    await fs.writeFile(path.join(templateDir, "template.config.json"), TEMPLATE_CONFIG, "utf-8");

    await fs.writeFile(path.join(templateDir, "package.json"), PACKAGE_JSON(templateName), "utf-8");

    return templateDir;
  }
}
