import { Request, Response } from "express";
import { connection } from "../utils/db";
import { RowDataPacket } from "mysql2";
import mysql from 'mysql2';
import { ResultSetHeader } from 'mysql2';

//add una nuova prenotazione ristorante OK
export const createPrenotazioneRistorante = async(req: Request, res: Response) => {
    const { idtavolo, username, data, ora , ospiti} = req.body;
    const sql = "INSERT INTO prenotazioni_ristorante (username, data, ora , ospiti, idtavolo) VALUES (?, ?, ?, ?)";
      
    connection.execute(sql, [username, data, ora , ospiti], (err, results) => { 
        if (err) {
            console.error("Errore DB:", err);
            return res.status(500).send("Errore Server: " + err.message);
        }
        res.status(201).json({ 
            message: "Prenotazione creata con successo!",
            id: (results as any).insertId //id della nuova prenotazione
          });
    });
};
      

//deletePrenotazione -> elimina una prenotazione ristorante OK
export const deletePrenotazioneRistorante = async(req: Request, res: Response) => {
    const { idtavolo } = req.params;
  const sql = "DELETE FROM prenotazioni_ristorante WHERE idtavolo = ?";

  connection.execute(sql, [idtavolo], (err, results) => { 
    if (err) {
      console.error("Errore DB:", err);
      return res.status(500).send("Errore Server: " + err.message);
    }
    const info=results as any ;
    if (info.affectedRows === 0) {
      return res.status(404).json({ message: "Prenotazione non trovata" });
    }
    res.status(200).json({ message: "Prenotazione eliminata con successo!" });
  });
  };


//  get per lo staff: vede tutte le prenotazioni 
export const getTuttePrenotazioniRistorante = async (req: Request, res: Response) => {
    const sql = "SELECT * FROM prenotazioni_ristorante ORDER BY data DESC, ora DESC";

    connection.execute(sql, [], (err, results) => { 
        if (err) {
            console.error("Errore DB:", err);
            return res.status(500).send("Errore Server: " + err.message);
        }
        res.status(200).json(results);
    });
};

// get per il cliente: vede solo le sue prenotazioni
export const getMiePrenotazioniRistorante = async (req: Request, res: Response) => {
    const { username } = req.params; 

    const sql = "SELECT * FROM prenotazioni_ristorante WHERE username = ? ORDER BY data DESC";

    connection.execute(sql, [username], (err, results) => { 
        if (err) {
            console.error("Errore DB:", err);
            return res.status(500).send("Errore Server: " + err.message);
        }
        res.status(200).json(results);
    });
};