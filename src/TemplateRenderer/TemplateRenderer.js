import Handlebars from "handlebars";
import fs from "fs-extra";

export class TemplateRenderer {
  async render(templatePath, context) {
    const templateString = await fs.readFile(templatePath, "utf-8");
    const compiled = Handlebars.compile(templateString);
    return compiled(context);
  }
}
