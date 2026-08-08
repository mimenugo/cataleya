import { Router } from "express";
import { getSettingsHandler, updateSettingsHandler } from "../controllers/settings.controller.js";
import { requireAuth } from "../middleware/auth.js";
import { asyncHandler } from "../middleware/asyncHandler.js";

export const settingsRouter = Router();

settingsRouter.use(requireAuth);
settingsRouter.get("/", asyncHandler(getSettingsHandler));
settingsRouter.put("/", asyncHandler(updateSettingsHandler));
