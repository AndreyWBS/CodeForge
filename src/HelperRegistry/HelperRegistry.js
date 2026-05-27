import Handlebars from "handlebars";

export class HelperRegistry {
  register() {
    const toCamelCase = (str) => String(str).replace(/_([a-z])/g, (_, c) => c.toUpperCase());

    const toPascalCase = (str) => {
      const camel = toCamelCase(str);
      return camel.charAt(0).toUpperCase() + camel.slice(1);
    };

    Handlebars.registerHelper("toCamelCase", (str) => toCamelCase(str));
    Handlebars.registerHelper("toPascalCase", (str) => toPascalCase(str));
    Handlebars.registerHelper("toUpperCase", (str) => String(str).toUpperCase());
    Handlebars.registerHelper("toLowerCase", (str) => String(str).toLowerCase());
    Handlebars.registerHelper("toKebabCase", (str) =>
      String(str)
        .replace(/([A-Z])/g, (c) => `-${c.toLowerCase()}`)
        .replace(/^-/, "")
        .replace(/_/g, "-"),
    );
  }
}
