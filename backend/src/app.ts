import express, { Express } from "express";
import mysql from "mysql2"; 

import camereRouter from "./routes/camere-router";
import prenotazioniRouter from "./routes/prenotazioni-router";
import loginRouter from "./routes/login-router";
import recensioniRouter from "./routes/recensioni-router";
import spiaggiaRouter from "./routes/spiaggia-router";

const app: Express = express();
const port: number = 3000;

// middleware per i dati
app.use(express.json()); 
app.use(express.urlencoded({ extended: true }));

// rotte api
app.use("/api", camereRouter);       
app.use("/api", prenotazioniRouter); 
app.use("/api", loginRouter);        
app.use("/api", recensioniRouter);
app.use("/api", spiaggiaRouter);

// gestione file statici
app.use(express.static("public")); 

// connessione ad database
export const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "Hotel",
});

// test della connessione
db.connect((err) => {
  if (err) {
    console.error("Errore di connessione al database:", err.message);
    return;
  }
  console.log("Connessione al database stabilita correttamente.");
});

// avvio server
app.listen(port, () => {
  console.log(`Server attivo su http://localhost:${port}`);
});