import { Router } from "express";
import { createOrderHandler, listOrdersHandler, updateOrderStatusHandler } from "../controllers/orders.controller.js";
import { requireAuth } from "../middleware/auth.js";
import { asyncHandler } from "../middleware/asyncHandler.js";

export const ordersRouter = Router();

// Público: lo usa Cataleya para crear pedidos.
ordersRouter.post("/", createOrderHandler);

// Panel CRM: requiere sesión.
ordersRouter.get("/", requireAuth, asyncHandler(listOrdersHandler));
ordersRouter.patch("/:id/status", requireAuth, updateOrderStatusHandler);
