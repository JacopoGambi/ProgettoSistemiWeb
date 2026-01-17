import { connection } from "../utils/db";
import { Request, Response } from "express";

//visualizzare menu
export const getMenu = async (req: Request, res: Response) => {
  const sql = "SELECT * FROM Menu";

  connection.execute(sql, [], (err, results) => { 
    if (err) {
      console.error("Errore DB:", err);
      return res.status(500).send("Errore Server: " + err.message);
    }
    res.status(200).json(results);
  });
};

//aggiornare un piatto del menu
export const updateMenu = async (req: Request, res: Response) => {
    const { id } = req.params;
    const { piatto, descrizionepiatto, prezzopiatto } = req.body;
    const sql = "UPDATE menu SET descrizionepiatto = ?, prezzopiatto = ? WHERE idpiatto = ?";

    connection.execute(sql, [descrizionepiatto, prezzopiatto, id], (err, results) => {
      if (err) {
        console.error("Errore DB:", err);
        return res.status(500).send("Errore durante l'aggiornamento: " + err.message);
      }
  
      const info = results as any;
  
      if (info.affectedRows === 0) {
        return res.status(404).json({ message: "Piatto non trovato, nessuna modifica effettuata." });
      }
  
      res.status(200).json({ message: "Piatto aggiornato con successo!" });
    });
  };