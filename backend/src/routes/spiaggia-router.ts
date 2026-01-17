import express from "express";
import {
  createPrenotazioneSpiaggia,
  getOmbrelloniOccupati,
} from "../controllers/spiaggia-controller";

const router = express.Router();

/**
 * API SPIAGGIA
 *
 * Tabella attesa (MySQL): prenotazioni_spiaggia
 * - idprenotazione INT AI PK
 * - username VARCHAR(...)
 * - ombrellone VARCHAR(10)
 * - datainizio DATE
 * - datafine DATE
 */

// Ritorna la lista degli ombrelloni occupati in un intervallo date (overlap)
router.get("/spiaggia/occupati", getOmbrelloniOccupati);

// Salvataggio prenotazione spiaggia
router.post("/spiaggia/prenotazioni", createPrenotazioneSpiaggia);

export default router;
