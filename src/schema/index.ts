const initSchemaSql = await Bun.file(import.meta.dir + "/initSchema.sql").text();

export const initSchemaStatements = initSchemaSql
  .split(";")
  .map((stmt) => stmt.trim())
  .filter((stmt) => stmt.length > 0);
