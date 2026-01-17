import mysql from "mysql2";

/**
 * Connessione MySQL unica per tutto il backend.
 *
 * Nota: usiamo mysql2 in modalita' callback (db.query).
 * Se in futuro vuoi usare async/await, puoi creare anche db.promise().
 */
export const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "Hotel",
});
