import Handlebars from "handlebars";
import fs from "fs-extra";
import path from "path";
import { pathToFileURL } from "url";

export class PluginLoader {
  async load(configDir, context = {}, projectConfig = {}) {
    const pluginsDir = path.join(configDir, "plugins");
    if (!(await fs.pathExists(pluginsDir))) return context;

    let enrichedContext = { ...context };
    const files = await fs.readdir(pluginsDir);

    for (const file of files) {
      if (!file.endsWith(".js")) continue;
      const pluginPath = path.join(pluginsDir, file);
      const plugin = await import(pathToFileURL(pluginPath).href);

      if (typeof plugin.default === "function") {
        plugin.default(Handlebars);
        console.log(`🔌 Plugin carregado: ${file}`);
      }

      if (typeof plugin.enrichContext === "function") {
        const additions = await plugin.enrichContext(enrichedContext, projectConfig);
        enrichedContext = { ...enrichedContext, ...additions };
        console.log(`🔄 Contexto enriquecido por: ${file}`);
      }
    }

    return enrichedContext;
  }
}
