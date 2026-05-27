export class ConfigValidator {
  validate(requiredConfig, projectConfig) {
    if (!requiredConfig || Object.keys(requiredConfig).length === 0) return;

    const missing = [];

    for (const [key, description] of Object.entries(requiredConfig)) {
      const value = key.split(".").reduce((obj, part) => obj?.[part], projectConfig);
      if (value === undefined || value === null) {
        missing.push({ key, description });
      }
    }

    if (missing.length === 0) return;

    const lines = missing.map(({ key, description }) => `  - "${key}": ${description}`).join("\n");
    throw new Error(`❌ Configurações obrigatórias ausentes no codeForge.config.json:\n${lines}`);
  }
}
