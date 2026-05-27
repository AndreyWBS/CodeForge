import fs from "fs-extra";
import path from "path";

export class FileWriter {
  async write(outputPath, content) {
    await fs.ensureDir(path.dirname(outputPath));
    await fs.writeFile(outputPath, content, "utf-8");
    console.log(`📄 Arquivo gerado: ${outputPath}`);
  }
}
