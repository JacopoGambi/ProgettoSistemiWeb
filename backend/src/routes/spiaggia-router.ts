import express from "express";
import {
  createPrenotazioneSpiaggia,
  getOmbrelloniOccupati,
} from "../controllers/spiaggia-controller";

const router = express.Router();

// Ritorna la lista degli ombrelloni occupati in un intervallo date (overlap)
router.get("/spiaggia/occupati", getOmbrelloniOccupati);

// Salvataggio prenotazione spiaggia
router.post("/spiaggia/prenotazioni", createPrenotazioneSpiaggia);

export default router;
