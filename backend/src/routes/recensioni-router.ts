import express, { Request, Response } from "express";
import { db } from "../app";

const router = express.Router();

router.get("/recensioni", (req, res) => {
    db.query("SELECT * FROM Recensioni ORDER BY idRecensione DESC", (err, results) => {
        if (err) return res.status(500).json(err);
        res.json(results);
    });
});

// SOLO i clienti possono scrivere recensioni
router.post("/recensioni", (req: Request, res: Response) => {
    const { username, testo, voto } = req.body;
    const query = "INSERT INTO Recensioni (username, testo, voto) VALUES (?, ?, ?)";
    
    db.query(query, [username, testo, voto], (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ success: true, message: "Recensione aggiunta!" });
    });
});

export default router;