import { Router } from "express";
import { getMenu, updateMenu } from "../controllers/menu-controller";

const router = Router();

router.get("/mostraMenu", getMenu);
router.put("/aggiornaMenu/:id", updateMenu);

export default router;