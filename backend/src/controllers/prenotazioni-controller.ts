import type { Request, Response } from "express";
import { db } from "../utils/db";

export function getPrenotazioni(req: Request, res: Response) {
  const { username, tipo } = req.query;

  console.log(`Richiesta prenotazioni: User=${username}, Tipo=${tipo}`);

  let sql = "SELECT * FROM prenotazioni";
  const params: any[] = [];

  // Se e' un cliente, filtriamo per il suo username
  if (tipo === "cliente" && username) {
    sql += " WHERE username = ?";
    params.push(username);
  }

  db.query(sql, params, (err, results) => {
    if (err) {
      console.error("Errore SQL nella GET:", (err as any).message);
      return res.status(500).json({ error: "Errore database" });
    }
    console.log("📦 Dati pronti per il frontend:", results);
    return res.json(results);
  });
}

export function createPrenotazione(req: Request, res: Response) {
  const { idcamera, username, datainizio, datafine, ospiti } = req.body;

  const sql =
    "INSERT INTO prenotazioni (idcamera, username, datainizio, datafine, ospiti) VALUES (?, ?, ?, ?, ?)";

  db.query(
    sql,
    [Number(idcamera), username, datainizio, datafine, Number(ospiti)],
    (err) => {
      if (err) {
        console.error("Errore SQL nella POST:", (err as any).message);
        return res
          .status(500)
          .json({ success: false, error: (err as any).message });
      }
      return res.json({ success: true });
    }
  );
}

export function deletePrenotazione(req: Request, res: Response) {
  const sql = "DELETE FROM prenotazioni WHERE idprenotazione = ?";

  db.query(sql, [req.params.id], (err) => {
    if (err) {
      console.error("Errore SQL nella DELETE:", (err as any).message);
      return res.status(500).json(err);
    }
    return res.json({ success: true });
  });
}
