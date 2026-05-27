import mysql from "mysql2/promise";

export default function (Handlebars) {
  // helpers específicos de banco podem ser registrados aqui futuramente
}

export async function enrichContext(context, projectConfig) {
  const dbConfig = projectConfig.database;

  if (!dbConfig) {
    console.warn(
      "⚠️  db-mapper: nenhuma configuração de banco encontrada em codeForge.config.json",
    );
    return {};
  }

  let connection;
  try {
    connection = await mysql.createConnection(dbConfig);
    const [rows] = await connection.query("SHOW TABLES");

    const dbKey = `Tables_in_${dbConfig.database}`;
    const tables = rows.map((row) => row[dbKey] ?? Object.values(row)[0]);
    const tableSchemas = [];

    for (const table of tables) {
      const [columnsRows] = await connection.query(`SHOW COLUMNS FROM \`${table}\``);
      const [primaryRows] = await connection.query(
        `SHOW KEYS FROM \`${table}\` WHERE Key_name = 'PRIMARY'`,
      );
      const columns = columnsRows.map((column) => column.Field);
      const primaryKey = primaryRows[0]?.Column_name ?? "id";
      tableSchemas.push({
        name: table,
        primaryKey,
        columns,
      });
    }

    console.log("\n📋 Tabelas encontradas no banco de dados:");
    tables.forEach((table) => console.log(`   - ${table}`));
    console.log("");

    return { tables, tableSchemas };
  } catch (err) {
    console.error(`❌ db-mapper: falha ao conectar no banco — ${err.message}`);
    return {};
  } finally {
    if (connection) await connection.end();
  }
}
