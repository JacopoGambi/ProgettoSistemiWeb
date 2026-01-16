import express, { Request, Response } from "express";
import { db } from "../app"; // Verifica che il percorso verso app.ts sia corretto

const router = express.Router();

router.post("/login", (req: Request, res: Response) => {
    const { username, password, ruolo } = req.body;

    const query = "SELECT * FROM Utenti WHERE username = ? AND password = ? AND ruolo = ?";
    
    db.query(query, [username, password, ruolo], (err, results: any) => {
        if (err) return res.status(500).json({ success: false });

        if (results && results.length > 0) {
            res.json({ success: true, user: results[0] });
        } else {
            // Se i dati sono sbagliati, results.length sarà 0
            res.json({ success: false, message: "Credenziali errate" });
        }
    });
});

export default router;