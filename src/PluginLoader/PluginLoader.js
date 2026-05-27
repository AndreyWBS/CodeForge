import Handlebars from "handlebars";
import fs from "fs-extra";
import path from "path";
import { pathToFileURL } from "url";

export class PluginLoader {
  async load(configDir) {
    const pluginsDir = path.join(configDir, "plugins");
    if (!(await fs.pathExists(pluginsDir))) return;

    const files = await fs.readdir(pluginsDir);
    for (const file of files) {
      if (!file.endsWith(".js")) continue;
      const pluginPath = path.join(pluginsDir, file);
      const plugin = await import(pathToFileURL(pluginPath).href);
      if (typeof plugin.default === "function") {
        plugin.default(Handlebars);
        console.log(`🔌 Plugin carregado: ${file}`);
      }
    }
  }
}
