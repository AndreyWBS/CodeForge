const DEFAULT_CRUD_STEPS = ["list", "getById", "create", "update", "remove"];

function toCamelCase(value) {
  return String(value)
    .replace(/[-_\s]+(.)/g, (_, char) => char.toUpperCase())
    .replace(/^([A-Z])/, (char) => char.toLowerCase());
}

function buildDefaultHandlerName(httpMethod, routePath) {
  const segments = routePath
    .split("/")
    .filter(Boolean)
    .map((segment) => segment.replace(/^:/, "by-"));

  if (segments.length === 0) return toCamelCase(`${httpMethod}-root`);
  return toCamelCase(`${httpMethod}-${segments.join("-")}`);
}

function parseRouteNotation(notation) {
  const pattern =
    /^\s*(GET|POST|PUT|PATCH|DELETE)\s+(\/[^\s]*)\s*(?:[-=]>{1}\s*([A-Za-z_][A-Za-z0-9_]*))?\s*$/i;
  const match = String(notation).match(pattern);
  if (!match) return null;

  const httpMethod = match[1].toUpperCase();
  const path = match[2];
  const handlerName = match[3] || buildDefaultHandlerName(httpMethod.toLowerCase(), path);

  return {
    notation,
    httpMethod,
    httpMethodLower: httpMethod.toLowerCase(),
    path,
    handlerName: toCamelCase(handlerName),
  };
}

function buildApiResources(tableSchemas, projectConfig) {
  const apiConfig = projectConfig.api ?? {};
  const tableConfigs = apiConfig.tables ?? {};
  const includeTables = Array.isArray(apiConfig.includeTables) ? apiConfig.includeTables : null;

  return tableSchemas
    .filter((tableSchema) => {
      if (includeTables && !includeTables.includes(tableSchema.name)) return false;
      const tableConfig = tableConfigs[tableSchema.name] ?? {};
      return tableConfig.enabled !== false;
    })
    .map((tableSchema) => {
      const tableConfig = tableConfigs[tableSchema.name] ?? {};
      const steps =
        Array.isArray(tableConfig.steps) && tableConfig.steps.length > 0
          ? tableConfig.steps
          : DEFAULT_CRUD_STEPS;

      const crud = {
        list: steps.includes("list"),
        getById: steps.includes("getById"),
        create: steps.includes("create"),
        update: steps.includes("update"),
        remove: steps.includes("remove"),
      };

      const customRouteNotations = Array.isArray(tableConfig.routes) ? tableConfig.routes : [];
      const customRoutes = customRouteNotations
        .map((notation) => parseRouteNotation(notation))
        .filter(Boolean);

      return {
        ...tableSchema,
        crud,
        customRoutes,
      };
    });
}

export default function () {
  // Plugin de api-resources não registra helpers, apenas enriquece contexto.
}

export async function enrichContext(context, projectConfig) {
  const tableSchemas = Array.isArray(context.tableSchemas) ? context.tableSchemas : [];
  const apiResources = buildApiResources(tableSchemas, projectConfig);
  return { apiResources };
}
