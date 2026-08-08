import { Router } from "express";
import { verifyWebhookHandler, receiveWebhookHandler } from "../controllers/whatsapp.controller.js";

export const whatsappRouter = Router();

whatsappRouter.get("/webhook", verifyWebhookHandler);
whatsappRouter.post("/webhook", receiveWebhookHandler);
