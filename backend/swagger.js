import swaggerUi from "swagger-ui-express"
import swaggerJsdoc from "swagger-jsdoc"

const swaggerOptions = {
    definition: {
        openapi: "3.0.0",
        info: {
            title: "API de Bancos",
            version: "2.0.0",
            description: "API REST para gestionar bancos y personas - Versiones V1 y V2"
        },
        servers: [
            {
                url: "/api/v1",
                description: "Servidor V1"
            },
            {
                url: "/api/v2",
                description: "Servidor V2"
            }
        ],
        components: {
            securitySchemes: {
                bearerAuth: {
                    type: "http",
                    scheme: "bearer",
                    bearerFormat: "JWT"
                }
            }
        }
    },
    apis: ["./routesV1.js", "./routesV2.js", "./auth.js"]
}

const swaggerSpec = swaggerJsdoc(swaggerOptions)

export function setupSwagger(app) {
    app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec))
}
