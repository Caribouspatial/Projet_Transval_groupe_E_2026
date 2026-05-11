import express, { type Request, type Response } from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import sequelize from './config/database';

import questionRouter from './routes/questionRoutes';

// 🔥 IMPORTANT : charge les models
import './models/Question';

import { requestLogger } from './middlewares/logger';
import { errorHandler } from './middlewares/errorHandler';

import swaggerUi from "swagger-ui-express";
import { swaggerSpec } from "./config/swagger";

import 'dotenv/config';

// ---------------------
// ES MODULES __dirname
// ---------------------
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ---------------------
// APP INIT
// ---------------------
const app = express();
const port = 3000;

// ---------------------
// MIDDLEWARES
// ---------------------
app.use(cors());
app.use(express.json());
app.use(requestLogger);

// ---------------------
// STATIC FRONTEND
// ---------------------
app.use(express.static(path.join(__dirname, "../public")));

// ---------------------
// SWAGGER
// ---------------------
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// ---------------------
// ROUTE FRONT
// ---------------------
app.get("/", (req: Request, res: Response) => {
    res.sendFile(path.join(__dirname, "../public/index.html"));
});

// ---------------------
// API ROUTES
// ---------------------
app.use('/api/questions', questionRouter);

// ---------------------
// ERROR HANDLER
// ---------------------
app.use(errorHandler);

// ---------------------
// DB CONNECTION
// ---------------------
sequelize.authenticate()
    .then(() => console.log('✅ Connexion DB réussie'))
    .catch(err => console.error('❌ Erreur connexion DB :', err));

// ---------------------
// SYNC + START SERVER
// ---------------------
sequelize.sync()
    .then(() => {
        console.log("📦 Base de données synchronisée");

        app.listen(port, '0.0.0.0', () => {
            console.log(`🚀 Serveur lancé sur http://localhost:${port}`);
        });
    })
    .catch(err => {
        console.error("❌ Erreur sync DB :", err);
    });

// ---------------------
// ENV DEBUG
// ---------------------
console.log("DATABASE_URL =", process.env.DATABASE_URL);