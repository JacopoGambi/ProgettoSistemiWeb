import express, { Request, Response } from "express";
import { db } from "../app"; 

const router = express.Router();

// lettura prenotazioni 
router.get("/prenotazioni", (req: Request, res: Response) => {
    const { username, tipo } = req.query;
    
    console.log(`Richiesta prenotazioni: User=${username}, Tipo=${tipo}`);

    let sql = "SELECT * FROM prenotazioni";
    let params: any[] = [];

    // Se è un cliente, filtriamo per il suo username
    if (tipo === "cliente" && username) {
        sql += " WHERE username = ?";
        params.push(username);
    }

    db.query(sql, params, (err, results) => {
        if (err) {
            console.error("Errore SQL nella GET:", err.message);
            return res.status(500).json({ error: "Errore database" });
        }
        
        console.log("📦 Dati pronti per il frontend:", results);
        res.json(results);
    });
});

//salvataggio prenotazione
router.post("/prenotazioni", (req: Request, res: Response) => {
    const { idcamera, username, datainizio, datafine, ospiti } = req.body;

    const sql = "INSERT INTO prenotazioni (idcamera, username, datainizio, datafine, ospiti) VALUES (?, ?, ?, ?, ?)";
    
    db.query(sql, [
      Number(idcamera), 
      username, 
      datainizio, 
      datafine, 
      Number(ospiti)
    ], (err) => {
        if (err) {
            console.error("Errore SQL nella POST:", err.message);
            return res.status(500).json({ success: false, error: err.message });
        }
        res.json({ success: true });
    });
});

// cancellazione
router.delete("/prenotazioni/:id", (req: Request, res: Response) => {
    const sql = "DELETE FROM prenotazioni WHERE idprenotazione = ?";
    
    db.query(sql, [req.params.id], (err) => {
        if (err) {
            console.error("Errore SQL nella DELETE:", err.message);
            return res.status(500).json(err);
        }
        res.json({ success: true });
    });
});

export default router;