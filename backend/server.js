import express from "express"
import path from "path"
import { fileURLToPath } from "url"
import routesV1 from "./routesV1.js"
import routesV2 from "./routesV2.js"
import authRouter from "./auth.js"
import { setupSwagger } from "./swagger.js"

const app = express()
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
app.use(express.json())

// Servir frontend estático (opcional): http://localhost:3000/app/
app.use("/app", express.static(path.join(__dirname, "..", "frontend")))

// Autenticación
app.use("/api/auth", authRouter)

// Usar rutas versionadas PRIMERO
app.use("/api/v1", routesV1)
app.use("/api/v2", routesV2)


setupSwagger(app)

app.get("/", (req, res) => {
    const protocol = req.protocol
    const host = req.get('host')
    const baseUrl = `${protocol}://${host}`
    
    res.json({
        mensaje: "Bienvenido a la API de Bancos",
        versiones: {
            v1: `${baseUrl}/api/v1`,
            v2: `${baseUrl}/api/v2`
        },
        
    })
})


app.get("/health", (req, res) => {
    res.json({ status: "ok" })
})

app.use((req, res) => {
    res.status(404).json({ 
        error: "No encontrado",
        path: req.path,
        method: req.method,
        disponibles: {
            v1: "/api/v1/banco",
            v2: "/api/v2/banco",
            docs: "/api-docs",
            health: "/health"
        }
    })
})

const PORT = process.env.PORT || 3000

app.listen(PORT, '0.0.0.0', () => {
    console.log(`✓ Servidor corriendo en puerto ${PORT}`)
    console.log(`✓ Documentación: http://localhost:${PORT}/api-docs`)
    console.log(`✓ API V1: http://localhost:${PORT}/api/v1`)
    console.log(`✓ API V2: http://localhost:${PORT}/api/v2`)
    console.log(`✓ Health: http://localhost:${PORT}/health`)
})
