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

    console.log("\n📋 Tabelas encontradas no banco de dados:");
    tables.forEach((table) => console.log(`   - ${table}`));
    console.log("");

    return { tables };
  } catch (err) {
    console.error(`❌ db-mapper: falha ao conectar no banco — ${err.message}`);
    return {};
  } finally {
    if (connection) await connection.end();
  }
}
