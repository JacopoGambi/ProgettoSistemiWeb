import express from "express";
import {
  createPrenotazione,
  deletePrenotazione,
  getPrenotazioni,
} from "../controllers/prenotazioni-controller";

const router = express.Router();

// lettura prenotazioni
router.get("/prenotazioni", getPrenotazioni);

// salvataggio prenotazione
router.post("/prenotazioni", createPrenotazione);

// cancellazione
router.delete("/prenotazioni/:id", deletePrenotazione);

export default router;