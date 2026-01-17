import { Request, Response } from "express";
import { connection } from "../utils/db";

//mostra recensioni -> getRecensioni 
export const getRecensioni = async(req: Request, res: Response) => {
    const sql = "SELECT * FROM recensioni";

  connection.execute(sql, [], (err, results) => { 
    if (err) {
      console.error("Errore DB:", err);
      return res.status(500).send("Errore Server: " + err.message);
    }
    res.status(200).json(results);
  });
};

//createRecensione -> add nuova recensione OK FUNZIONA
export const createRecensione = async(req: Request, res: Response) => {
  const { username, testo, voto } = req.body;
  const sql = 'INSERT INTO Recensioni (username, testo, voto) VALUES (?, ?, ?)';

  connection.execute(sql, [username, testo ,voto], (err, results) => {
    if (err){
      console.error("Errore", err);
      return res.status(500).send("Errore Server: " + err.message); //500 = errore server
    }
    res.status(201).json({ //201 = risorsa creata
      message: "Recensione creata con successo!",
      id: (results as any).insertId //id della nuova recensione
    });
  });
}