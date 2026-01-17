import mysql from "mysql2";

// connessione callback (per gli altri controller che usano (err, results) => ...)
const conn = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "Hotel",
});

export const connection = conn;

// connessione promise (per async/await)
export const db = conn.promise();
