import type { Request, Response } from "express";
import { db } from "../utils/db";

export function getRecensioni(_req: Request, res: Response) {
  db.query("SELECT * FROM Recensioni ORDER BY idRecensione DESC", (err, results) => {
    if (err) {
      console.error("Errore SQL nella GET /recensioni:", (err as any).message);
      return res.status(500).json(err);
    }
    return res.json(results);
  });
}

// SOLO i clienti possono scrivere recensioni (la validazione del ruolo e' lato frontend)
export function createRecensione(req: Request, res: Response) {
  const { username, testo, voto } = req.body;
  const query = "INSERT INTO Recensioni (username, testo, voto) VALUES (?, ?, ?)";

  db.query(query, [username, testo, voto], (err) => {
    if (err) {
      return res.status(500).json({ error: (err as any).message });
    }
    return res.json({ success: true, message: "Recensione aggiunta!" });
  });
}
