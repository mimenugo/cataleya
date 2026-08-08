import express from "express";
import cors from "cors";
import morgan from "morgan";
import { env } from "./config/env.js";
import { ordersRouter } from "./routes/orders.routes.js";
import { whatsappRouter } from "./routes/whatsapp.routes.js";

export const app = express();

app.use(cors({ origin: env.corsOrigin }));
app.use(morgan(env.nodeEnv === "development" ? "dev" : "combined"));
app.use(express.json());

app.get("/health", (req, res) => res.json({ status: "ok" }));

app.use("/api/orders", ordersRouter);
app.use("/api/whatsapp", whatsappRouter);

app.use((req, res) => res.status(404).json({ error: "No encontrado" }));

app.use((error, req, res, next) => {
  console.error(error);
  res.status(500).json({ error: "Error interno" });
});
