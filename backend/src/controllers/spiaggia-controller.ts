import type { Request, Response } from "express";
import { db } from "../utils/db";

// Ritorna la lista degli ombrelloni occupati in un intervallo date (overlap)
export function getOmbrelloniOccupati(req: Request, res: Response) {
  const { datainizio, datafine } = req.query;

  if (!datainizio || !datafine) {
    return res.status(400).json({ error: "Parametri richiesti: datainizio, datafine" });
  }

  // Overlap: due periodi si sovrappongono se NON (fine < start OR inizio > end)
  const sql = `
    SELECT DISTINCT ombrellone
    FROM prenotazioni_spiaggia
    WHERE NOT (datafine < ? OR datainizio > ?)
  `;

  db.query(sql, [String(datainizio), String(datafine)], (err, results: any) => {
    if (err) {
      console.error("Errore SQL nella GET /spiaggia/occupati:", (err as any).message);
      return res.status(500).json({ error: "Errore database" });
    }

    const occupied = (results || []).map((r: any) => r.ombrellone);
    return res.json(occupied);
  });
}

// Salvataggio prenotazione spiaggia
export function createPrenotazioneSpiaggia(req: Request, res: Response) {
  const { username, ombrellone, datainizio, datafine } = req.body;

  if (!username || !ombrellone || !datainizio || !datafine) {
    return res
      .status(400)
      .json({ success: false, error: "Campi richiesti: username, ombrellone, datainizio, datafine" });
  }
  if (datafine < datainizio) {
    return res.status(400).json({ success: false, error: "Intervallo date non valido" });
  }

  // 1) controllo conflitto
  const conflictSql = `
    SELECT COUNT(*) as cnt
    FROM prenotazioni_spiaggia
    WHERE ombrellone = ?
      AND NOT (datafine < ? OR datainizio > ?)
  `;

  db.query(conflictSql, [String(ombrellone), String(datainizio), String(datafine)], (err, results: any) => {
    if (err) {
      console.error("Errore SQL nel controllo conflitto:", (err as any).message);
      return res.status(500).json({ success: false, error: "Errore database" });
    }

    const cnt = results?.[0]?.cnt ?? 0;
    if (cnt > 0) {
      return res.status(409).json({ success: false, error: "Ombrellone gia' prenotato per il periodo selezionato" });
    }

    // 2) inserimento
    const insertSql = `
      INSERT INTO prenotazioni_spiaggia (username, ombrellone, datainizio, datafine)
      VALUES (?, ?, ?, ?)
    `;

    db.query(insertSql, [String(username), String(ombrellone), String(datainizio), String(datafine)], (err2) => {
      if (err2) {
        console.error("Errore SQL nella POST /spiaggia/prenotazioni:", (err2 as any).message);
        return res.status(500).json({ success: false, error: (err2 as any).message });
      }
      return res.json({ success: true });
    });
  });
}
