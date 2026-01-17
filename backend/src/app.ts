import express, { Express } from "express";
import cookieParser from "cookie-parser";
import autenticazioneRouter from "./routes/autenticazione-router";
import camereRouter from "./routes/camere-router";
import prenotazioniRouter from "./routes/prenotazioni-router";
import loginRouter from "./routes/login-router";
import recensioniRouter from "./routes/recensioni-router";
import spiaggiaRouter from "./routes/spiaggia-router";
import menuRouter from "./routes/menu-router";
import ristoranteRouter from "./routes/ristorante-router";
import { db } from "./utils/db";

const app: Express = express();
const port: number = 3000;

// middleware per i dati
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// rotte api
app.use("/api", autenticazioneRouter); // Sistema autenticazione NUOVO (con bcrypt)
app.use("/api", camereRouter);
app.use("/api", prenotazioniRouter);
// app.use("/api", loginRouter);        // DISABILITATO: vecchio sistema con password in chiaro
app.use("/api", recensioniRouter);
app.use("/api", spiaggiaRouter);
app.use("/api", menuRouter);          // AGGIUNTO: gestione menu
app.use("/api", ristoranteRouter);    // AGGIUNTO: gestione prenotazioni ristorante


// gestione file statici
app.use(express.static("public")); 

// avvio server
app.listen(port, () => {
  console.log(`Server attivo su http://localhost:${port}`);
});
