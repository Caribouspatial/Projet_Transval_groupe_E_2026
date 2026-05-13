import express from "express";
import questionsRoutes from "./routes/questions.routes";

const app = express();

app.use(express.json());

app.use("/api", questionsRoutes);

export default app;