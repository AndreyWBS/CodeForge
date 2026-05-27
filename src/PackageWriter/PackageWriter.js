import fs from "fs-extra";
import path from "path";

export class PackageWriter {
  async write(templateDir, outputDir) {
    const srcPackage = path.join(templateDir, "package.json");
    if (!(await fs.pathExists(srcPackage))) return;

    const templatePkg = await fs.readJson(srcPackage);
    const destPackage = path.join(outputDir, "package.json");

    await fs.ensureDir(outputDir);

    const { pluginDependencies: _omit, ...outputPkg } = templatePkg;

    if (await fs.pathExists(destPackage)) {
      const existingPkg = await fs.readJson(destPackage);
      existingPkg.dependencies = { ...existingPkg.dependencies, ...outputPkg.dependencies };
      existingPkg.devDependencies = {
        ...existingPkg.devDependencies,
        ...outputPkg.devDependencies,
      };
      await fs.writeJson(destPackage, existingPkg, { spaces: 2 });
    } else {
      await fs.writeJson(destPackage, outputPkg, { spaces: 2 });
    }

    console.log(`📦 package.json escrito em: ${destPackage}`);
  }
}
