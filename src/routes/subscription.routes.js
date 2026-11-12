import { Router } from "express";
import {
  subscribe,
  getSubscriptions,
  getSubscription,
  cancelSubscription,
} from "../controllers/subscription.controller.js";
import { recordUsage, getUsage, getUsageSummary } from "../controllers/usage.controller.js";

const router = Router();

router.route("/").post(subscribe).get(getSubscriptions);
router.get("/:id", getSubscription);
router.patch("/:id/cancel", cancelSubscription);

router.route("/:id/usage").post(recordUsage).get(getUsage);
router.get("/:id/usage/summary", getUsageSummary);

export default router;
