import { Request, Response } from "express";
import { connection } from "../utils/db";
import { RowDataPacket, ResultSetHeader } from "mysql2";

//add di una nuova prenotazione OK 
export const createPrenotazione = async(req: Request, res: Response) =>{
  const { idcamera, username, datainizio, datafine, ospiti } = req.body;
  const sql = "INSERT INTO prenotazioni (idcamera, username, datainizio, datafine, ospiti) VALUES (?, ?, ?, ?, ?)"
      
    connection.execute(sql, [idcamera, username, datainizio, datafine, ospiti], (err, results) => { 
        if (err) {
            console.error("Errore DB:", err);
            return res.status(500).send("Errore Server: " + err.message);
        }
        res.status(201).json({ 
            message: "Prenotazione creata con successo!",
            id: (results as any).insertId //id nuova prenotazione
          });
    });
};


//getPrenotzioni -> vedere la lista delle prenotazioni  OK FUNZIONA
export const getPrenotazioni = async(req: Request, res: Response) =>{
    const sql = "SELECT * FROM prenotazioni";

  connection.execute(sql, [], (err, results) => { 
    if (err) {
      console.error("Errore DB:", err);
      return res.status(500).send("Errore Server: " + err.message);
    }
    res.status(200).json(results);
  });
};

//deletePrenotazione -> elimina una prenotazione OK FUNZIONA
export const deletePrenotazione = async (req: Request, res: Response) => {
  const { id } = req.params;
  const sql = "DELETE FROM prenotazioni WHERE idprenotazion = ?";

  connection.execute(sql, [id], (err, results) => { 
    if (err) {
      console.error("Errore DB:", err);
      return res.status(500).send("Errore Server: " + err.message);
    }
    const info=results as any ;
    if (info.affectedRows === 0) { //nessuna modifica (no riga eliminata)
      return res.status(404).json({ message: "Prenotazione non trovata" });
    }
    res.status(200).json({ message: "Prenotazione eliminata con successo!" });
  });
  };