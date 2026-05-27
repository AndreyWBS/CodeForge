import fs from "fs-extra";

export class ConfigLoader {
  async load(configPath) {
    const raw = await fs.readFile(configPath, "utf-8");
    return JSON.parse(raw);
  }
}
