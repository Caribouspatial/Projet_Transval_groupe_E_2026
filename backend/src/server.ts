import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";

import pendingRoutes from "./routes/pending.routes";

const app = express();
const PORT = 3000;

// ES MODULE FIX
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.use(cors());
app.use(express.json());

// FRONT
app.use(express.static(path.join(__dirname, "..", "public")));

app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "..", "public", "index.html"));
});

// 🔥 API ROUTES (IMPORTANT)
app.use("/api/questions", pendingRoutes);

app.listen(PORT, () => {
    console.log(`🚀 http://localhost:${PORT}`);
});