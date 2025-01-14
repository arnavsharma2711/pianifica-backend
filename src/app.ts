import express from "express";
import path from "node:path";
process.env.NODE_CONFIG_DIR = path.join(path.resolve("./"), "config");
import morganLogger from "morgan";
import helmetSecurity from "helmet";
import corsMiddleware from "cors";
import cookieParserMiddleware from "cookie-parser";
import responseMiddleware from "./middlewares/response";

import { handleError, handleNotFound } from "./middlewares/middlewares";

import dotenv from "dotenv";
dotenv.config();

const expressApp = express();
expressApp.use(morganLogger("dev"));
expressApp.use(helmetSecurity());
expressApp.use(corsMiddleware());
expressApp.use(express.json());
expressApp.use(cookieParserMiddleware());
expressApp.use(responseMiddleware);

// Define root route
expressApp.get("/", (_req, res) => {
  res.sendFile(path.join(__dirname, "../public", "index.html"));
});

// Importing API routes
import apiRoutes from "./routes";
expressApp.use("/api", apiRoutes);

// Use custom middlewares for handling 404 and errors
expressApp.use(handleNotFound);
expressApp.use(handleError);

export default expressApp;
