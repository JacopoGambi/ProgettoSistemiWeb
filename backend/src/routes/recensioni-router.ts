import express from "express";
import {
  createRecensione,
  getRecensioni,
} from "../controllers/recensioni-controller";

const router = express.Router();

router.get("/recensioni", getRecensioni);

// SOLO i clienti possono scrivere recensioni
router.post("/recensioni", createRecensione);

export default router;