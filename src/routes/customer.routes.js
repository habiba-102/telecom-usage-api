import { Router } from "express";
import {
  createCustomer,
  getCustomers,
  getCustomer,
  updateCustomer,
  deleteCustomer,
} from "../controllers/customer.controller.js";

const router = Router();

router.route("/").post(createCustomer).get(getCustomers);
router.route("/:id").get(getCustomer).patch(updateCustomer).delete(deleteCustomer);

export default router;
