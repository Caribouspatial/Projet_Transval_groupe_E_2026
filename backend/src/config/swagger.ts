import swaggerJsdoc from "swagger-jsdoc";

const swaggerOptions = {
    definition: {
        openapi: "3.0.0",
        info: {
            title: "Mon API Géniale",
            version: "1.0.0",
            description: "Documentation générée automatiquement via Swagger",
        },
    },
    apis: ["./src/routes/*.ts"], 
};

export const swaggerSpec = swaggerJsdoc(swaggerOptions);