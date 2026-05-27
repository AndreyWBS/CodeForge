import Handlebars from "handlebars";
import fs from "fs-extra";
import path from "path";
import { pathToFileURL } from "url";

export class PluginLoader {
  async load(configDir, context = {}, projectConfig = {}, pluginDefinitions = []) {
    const pluginsDir = path.join(configDir, "plugins");
    if (!(await fs.pathExists(pluginsDir))) return context;

    const orderedPlugins = this.normalizePluginDefinitions(pluginDefinitions);
    if (orderedPlugins.length === 0) {
      console.log("ℹ️ Nenhum plugin configurado no template.config.json");
      return context;
    }

    let enrichedContext = { ...context };
    for (const pluginDef of orderedPlugins) {
      const file = pluginDef.name;
      const pluginPath = path.join(pluginsDir, file);
      if (!(await fs.pathExists(pluginPath))) {
        throw new Error(`Plugin não encontrado: ${file}`);
      }

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

  normalizePluginDefinitions(pluginDefinitions) {
    if (!Array.isArray(pluginDefinitions)) return [];

    return pluginDefinitions
      .map((definition) => {
        if (typeof definition === "string") {
          return { name: definition, enabled: true };
        }
        if (!definition || typeof definition !== "object") return null;
        return {
          name: definition.name,
          enabled: definition.enabled !== false,
        };
      })
      .filter((definition) => definition?.enabled && typeof definition.name === "string");
  }
}
