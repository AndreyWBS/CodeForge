import Handlebars from "handlebars";
import fs from "fs-extra";
import path from "path";

export class PartialRegistry {
  async register(configDir) {
    const componentsDir = path.join(configDir, "componentes");
    if (!(await fs.pathExists(componentsDir))) return;

    const files = await fs.readdir(componentsDir);
    for (const file of files) {
      if (!file.endsWith(".hbs")) continue;
      const partialName = path.basename(file, ".hbs");
      const content = await fs.readFile(path.join(componentsDir, file), "utf-8");
      Handlebars.registerPartial(partialName, content);
      console.log(`🧩 Partial registrado: {{> ${partialName}}}`);
    }
  }
}
