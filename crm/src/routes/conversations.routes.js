import { Router } from "express";
import { listConversationsHandler, getConversationHandler, sendMessageHandler } from "../controllers/conversations.controller.js";
import { requireAuth } from "../middleware/auth.js";
import { asyncHandler } from "../middleware/asyncHandler.js";

export const conversationsRouter = Router();

conversationsRouter.use(requireAuth);
conversationsRouter.get("/", asyncHandler(listConversationsHandler));
conversationsRouter.get("/:id", asyncHandler(getConversationHandler));
conversationsRouter.post("/:id/messages", sendMessageHandler);
