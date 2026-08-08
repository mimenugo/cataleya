import { Router } from "express";
import { createOrderHandler } from "../controllers/orders.controller.js";

export const ordersRouter = Router();

ordersRouter.post("/", createOrderHandler);
