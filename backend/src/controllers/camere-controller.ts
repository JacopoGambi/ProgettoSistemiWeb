import { connection } from "../utils/db";
import { Request, Response } from "express";

//visualizza camere OK FUNZIONA
export const getCamere = async (req: Request, res: Response) => {
  const sql = "SELECT * FROM dettaglicamera";

  connection.execute(sql, [], (err, results) => { 
    if (err) {
      console.error("Errore DB:", err);
      return res.status(500).send("Errore Server: " + err.message);
    }
    res.status(200).json(results);
  });
};


//aggiorna una camera OK FUNZIONA
export const updateCamera = async (req: Request, res: Response) => {
  const { id } = req.params; //id della camera da aggiornare
  const { nomecamera, descrizionecamera, prezzocamera } = req.body; //elementi da aggiornare
  const sql = `UPDATE dettaglicamera SET nomecamera = ?, descrizionecamera = ?, prezzocamera = ? WHERE idcamera = ?`;

  connection.execute(sql, [nomecamera, descrizionecamera, prezzocamera, id], (err, results) => {
    if (err) {
      console.error("Errore DB:", err);
      return res.status(500).send("Errore durante l'aggiornamento: " + err.message);
    }
    const info = results as any; //any = tipo generico
    if (info.affectedRows === 0) { //se nessuna riga è stata aggiornata
      return res.status(404).json({ message: "Nessuna modifica effettuata." }); //errore 404
    }
    res.status(200).json({ message: "Camera aggiornata con successo!" }); //successo 200
  });
};