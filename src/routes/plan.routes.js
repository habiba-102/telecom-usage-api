import { Router } from "express";
import {
  createPlan,
  getPlans,
  getPlan,
  updatePlan,
  deletePlan,
} from "../controllers/plan.controller.js";

const router = Router();

router.route("/").post(createPlan).get(getPlans);
router.route("/:id").get(getPlan).patch(updatePlan).delete(deletePlan);

export default router;
