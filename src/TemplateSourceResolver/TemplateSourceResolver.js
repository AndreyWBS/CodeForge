import fs from "fs-extra";
import path from "path";
import { spawn } from "child_process";

export class TemplateSourceResolver {
  getCacheRoot(cwd) {
    return path.join(cwd, ".codeforge", "template-cache");
  }

  async listCache(cwd) {
    const cacheRoot = this.getCacheRoot(cwd);
    if (!(await fs.pathExists(cacheRoot))) {
      return [];
    }

    const entries = await fs.readdir(cacheRoot, { withFileTypes: true });
    return entries.filter((entry) => entry.isDirectory()).map((entry) => entry.name);
  }

  async clearCache(cwd) {
    const cacheRoot = this.getCacheRoot(cwd);
    if (!(await fs.pathExists(cacheRoot))) {
      return false;
    }

    await fs.remove(cacheRoot);
    return true;
  }

  async resolve(cwd, templateConfig, projectConfig = {}) {
    const source = this.normalizeTemplateSource(templateConfig);

    if (source.type === "local") {
      return path.resolve(cwd, source.path);
    }

    if (source.type === "github") {
      return this.resolveFromGitHub(cwd, source, projectConfig);
    }

    throw new Error("Fonte de template inválida em codeForge.config.json");
  }

  normalizeTemplateSource(templateConfig) {
    if (!templateConfig) {
      throw new Error("Campo 'template' não informado em codeForge.config.json");
    }

    if (typeof templateConfig === "string") {
      if (templateConfig.startsWith("https://github.com/")) {
        return this.parseGitHubUrl(templateConfig);
      }

      return { type: "local", path: templateConfig };
    }

    if (typeof templateConfig === "object" && templateConfig.github) {
      const github = templateConfig.github;
      if (!github.repo) {
        throw new Error("template.github.repo é obrigatório para template remoto");
      }

      return {
        type: "github",
        repo: this.normalizeRepo(github.repo),
        ref: github.ref,
        subdir: github.path,
        token: github.token,
        refresh: github.refresh === true,
      };
    }

    throw new Error("Formato de template não suportado em codeForge.config.json");
  }

  parseGitHubUrl(url) {
    const cleanUrl = url.replace(/\.git$/, "");
    const treeMatch = cleanUrl.match(
      /^https:\/\/github\.com\/([^/]+\/[^/]+)\/tree\/([^/]+)(?:\/(.+))?$/,
    );
    if (treeMatch) {
      return {
        type: "github",
        repo: treeMatch[1],
        ref: treeMatch[2],
        subdir: treeMatch[3],
      };
    }

    const repoMatch = cleanUrl.match(/^https:\/\/github\.com\/([^/]+\/[^/]+)$/);
    if (!repoMatch) {
      throw new Error("URL do GitHub inválida para template");
    }

    return {
      type: "github",
      repo: repoMatch[1],
    };
  }

  normalizeRepo(repo) {
    if (repo.startsWith("https://github.com/")) {
      return this.parseGitHubUrl(repo).repo;
    }
    return repo.replace(/\.git$/, "");
  }

  async resolveFromGitHub(cwd, source, projectConfig) {
    const cacheRoot = this.getCacheRoot(cwd);
    const ref = source.ref ?? "main";
    const repoKey = source.repo.replace(/[^a-zA-Z0-9_-]/g, "_");
    const checkoutDir = path.join(cacheRoot, `${repoKey}_${ref}`);

    await fs.ensureDir(cacheRoot);

    if (source.refresh && (await fs.pathExists(checkoutDir))) {
      await fs.remove(checkoutDir);
    }

    if (!(await fs.pathExists(checkoutDir))) {
      const token = this.resolveGitHubToken(source, projectConfig);
      const cloneUrl = this.buildCloneUrl(source.repo, token);
      await this.gitClone(cloneUrl, checkoutDir, ref);
    }

    const templateDir = source.subdir ? path.join(checkoutDir, source.subdir) : checkoutDir;

    if (!(await fs.pathExists(templateDir))) {
      throw new Error(
        `Template path '${source.subdir}' não encontrado no repositório ${source.repo}`,
      );
    }

    return templateDir;
  }

  resolveGitHubToken(source, projectConfig) {
    return (
      source.token ||
      projectConfig.githubToken ||
      process.env.CODEFORGE_GITHUB_TOKEN ||
      process.env.GITHUB_TOKEN
    );
  }

  buildCloneUrl(repo, token) {
    if (!token) return `https://github.com/${repo}.git`;

    const safeToken = encodeURIComponent(token);
    return `https://x-access-token:${safeToken}@github.com/${repo}.git`;
  }

  gitClone(cloneUrl, targetDir, ref) {
    return new Promise((resolve, reject) => {
      const args = ["clone", "--depth", "1", "--branch", ref, cloneUrl, targetDir];
      const proc = spawn("git", args, { stdio: "pipe" });

      let stderr = "";
      proc.stderr.on("data", (chunk) => {
        stderr += chunk.toString();
      });

      proc.on("error", () => {
        reject(
          new Error("Git não encontrado no sistema. Instale o Git para usar template remoto."),
        );
      });

      proc.on("close", (code) => {
        if (code === 0) {
          resolve();
          return;
        }

        const authHint =
          "Se o repositório for privado, configure template.github.token, githubToken, CODEFORGE_GITHUB_TOKEN ou GITHUB_TOKEN.";

        reject(new Error(`Falha ao baixar template do GitHub: ${stderr.trim()}\n${authHint}`));
      });
    });
  }
}
