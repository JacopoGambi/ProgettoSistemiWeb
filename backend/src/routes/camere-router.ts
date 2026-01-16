import express, { Request, Response } from "express";
import { db } from "../app";

const router = express.Router();

//rotta per accedere alle camere (usa GET)
router.get("/camere", (req: Request, res: Response) => {
    console.log("Richiesta ricevuta: il frontend sta chiedendo la lista camere..."); //

    const query = "SELECT * FROM DettagliCamera";
    
    db.query(query, (err, results) => {
        if (err) {
            console.error("Errore query SQL:", err);
            return res.status(500).json({ error: "Errore database" });
        }
        
        console.log("Dati recuperati dal DB:", results); // Log per vedere se il DB risponde correttamente
        res.json(results); 
    });
});

// rotta per aggiornare le camere (PUT) 
// Questa rotta serve ai dipendenti per modificare le camere
router.put("/camere/:id", (req: Request, res: Response) => {
    const id = req.params.id;
    const { nomecamera, descrizionecamera, prezzocamera } = req.body;

    console.log(`Tentativo di modifica camera ID ${id} con i dati:`, req.body);

    const query = `
        UPDATE DettagliCamera 
        SET nomecamera = ?, descrizionecamera = ?, prezzocamera = ? 
        WHERE idcamera = ?
    `;

    db.query(query, [nomecamera, descrizionecamera, prezzocamera, id], (err, result) => {
        if (err) {
            console.error("Errore aggiornamento:", err);
            return res.status(500).json({ success: false, message: "Errore database" });
        }
        
        console.log("Modifica completata con successo nel DB.");
        res.json({ success: true, message: "Camera aggiornata con successo" });
    });
});

export default router;