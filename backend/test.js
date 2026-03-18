import express from "express"
import routesV1 from "./routesV1.js"
import routesV2 from "./routesV2.js"

const app = express()
app.use(express.json())

// Test básico
app.get("/test", (req, res) => {
    res.json({ message: "Server works" })
})

// Rutas
app.use("/api/v1", routesV1)
app.use("/api/v2", routesV2)

const PORT = 3000
app.listen(PORT, '0.0.0.0', () => {
    console.log(`Test server running on port ${PORT}`)
    console.log(`Test: http://localhost:${PORT}/test`)
    console.log(`V1: http://localhost:${PORT}/api/v1/banco`)
    console.log(`V2: http://localhost:${PORT}/api/v2/banco`)
})
