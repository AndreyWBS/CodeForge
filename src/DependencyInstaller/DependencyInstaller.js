import { spawn } from "child_process";
import fs from "fs-extra";
import path from "path";

export class DependencyInstaller {
  async install(templateDir) {
    const pkgPath = path.join(templateDir, "package.json");
    if (!(await fs.pathExists(pkgPath))) return;

    const pkg = await fs.readJson(pkgPath);
    const pluginDeps = pkg.pluginDependencies ?? {};

    if (Object.keys(pluginDeps).length === 0) return;

    console.log("📥 Instalando dependências de plugins:", Object.keys(pluginDeps).join(", "));
    const packages = Object.entries(pluginDeps).map(([name, version]) => `${name}@${version}`);
    await this._runNpmInstall(templateDir, packages);
    console.log("✅ Dependências de plugins instaladas.");
  }

  async cleanup(templateDir) {
    const nodeModulesPath = path.join(templateDir, "node_modules");
    if (!(await fs.pathExists(nodeModulesPath))) return;
    await fs.remove(nodeModulesPath);
    console.log("🧹 Limpeza concluída: template/node_modules removido.");
  }

  _runNpmInstall(cwd, packages = []) {
    return new Promise((resolve, reject) => {
      const args = ["install", ...packages];
      const proc = spawn("npm", args, {
        cwd,
        shell: true,
        stdio: "inherit",
      });
      proc.on("close", (code) => {
        if (code === 0) resolve();
        else reject(new Error(`npm install falhou com código ${code}`));
      });
    });
  }
}
