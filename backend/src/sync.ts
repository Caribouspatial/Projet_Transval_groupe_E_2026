import sequelize from "./config/database";

/* MODELES */
import "./models/Utilisateur";
import "./models/ListeStat";
import "./models/Salon";
import "./models/Partie";
import "./models/Question";

/* ASSOCIATIONS */
import "./models/associations";

async function syncDB() {
    try {
        await sequelize.authenticate();
        console.log("✅ DB connectée");

        await sequelize.sync({ alter: true });
        console.log("✅ Tables créées / mises à jour");

    } catch (err) {
        console.error("❌ erreur :", err);
    }
}

syncDB();