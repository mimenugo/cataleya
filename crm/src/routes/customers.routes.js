import { Router } from "express";
import { listCustomersHandler, getCustomerHandler } from "../controllers/customers.controller.js";
import { requireAuth } from "../middleware/auth.js";
import { asyncHandler } from "../middleware/asyncHandler.js";

export const customersRouter = Router();

customersRouter.use(requireAuth);
customersRouter.get("/", asyncHandler(listCustomersHandler));
customersRouter.get("/:id", asyncHandler(getCustomerHandler));
