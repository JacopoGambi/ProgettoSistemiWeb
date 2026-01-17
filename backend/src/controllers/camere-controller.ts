import type { Request, Response } from "express";
import { db } from "../utils/db";

export function getCamere(req: Request, res: Response) {
  console.log("Richiesta ricevuta: il frontend sta chiedendo la lista camere...");

  const query = "SELECT * FROM DettagliCamera";
  db.query(query, (err, results) => {
    if (err) {
      console.error("Errore query SQL:", err);
      return res.status(500).json({ error: "Errore database" });
    }

    console.log("Dati recuperati dal DB:", results);
    return res.json(results);
  });
}

export function updateCamera(req: Request, res: Response) {
  const id = req.params.id;
  const { nomecamera, descrizionecamera, prezzocamera } = req.body;

  console.log(`Tentativo di modifica camera ID ${id} con i dati:`, req.body);

  const query = `
    UPDATE DettagliCamera
    SET nomecamera = ?, descrizionecamera = ?, prezzocamera = ?
    WHERE idcamera = ?
  `;

  db.query(query, [nomecamera, descrizionecamera, prezzocamera, id], (err) => {
    if (err) {
      console.error("Errore aggiornamento:", err);
      return res
        .status(500)
        .json({ success: false, message: "Errore database" });
    }

    console.log("Modifica completata con successo nel DB.");
    return res.json({ success: true, message: "Camera aggiornata con successo" });
  });
}
