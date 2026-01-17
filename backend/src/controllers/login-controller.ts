import type { Request, Response } from "express";
import { connection } from "../utils/db";

export function login(req: Request, res: Response) {
  const { username, password, ruolo } = req.body;

  const query =
    "SELECT * FROM Utenti WHERE username = ? AND password = ? AND ruolo = ?";

  connection.query(query, [username, password, ruolo], (err, results: any) => {
    if (err) {
      console.error("Errore SQL nella POST /login:", (err as any).message);
      return res.status(500).json({ success: false });
    }

    if (results && results.length > 0) {
      return res.json({ success: true, user: results[0] });
    }

    return res.json({ success: false, message: "Credenziali errate" });
  });
}
