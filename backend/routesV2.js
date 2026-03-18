import express from "express"
import { leerDatos, guardarDatos } from "./utils.js"
import { verificarToken } from "./auth.js"

const router = express.Router()

/**
 * @swagger
 * /api/v2/banco:
 *   get:
 *     summary: Obtener todos los bancos (V2)
 *     tags:
 *       - V2 - Bancos
 *     responses:
 *       200:
 *         description: Lista de todos los bancos
 */
router.get("/banco", (req, res) => {
    const data = leerDatos()
    res.json({
        success: true,
        data: data.bancos,
        count: data.bancos.length
    })
})

/**
 * @swagger
 * /api/v2/banco/{id}:
 *   get:
 *     summary: Obtener un banco por ID (V2)
 *     tags:
 *       - V2 - Bancos
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Banco encontrado
 *       404:
 *         description: Banco no encontrado
 */
router.get("/banco/:id", (req, res) => {
    const data = leerDatos()
    const banco = data.bancos.find(b => b.id == req.params.id)
    if (!banco) {
        return res.status(404).json({success: false, error: "Banco no encontrado"})
    }
    res.json({success: true, data: banco})
})

/**
 * @swagger
 * /api/v2/banco/{id}/personas:
 *   get:
 *     summary: Obtener personas de un banco (V2)
 *     tags:
 *       - V2 - Personas
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Personas del banco
 */
router.get("/banco/:id/personas", (req, res) => {
    const data = leerDatos()
    const banco = data.bancos.find(b => b.id == req.params.id)
    if (!banco) {
        return res.status(404).json({success: false, error: "Banco no encontrado"})
    }
    res.json({success: true, data: banco.personas, count: banco.personas.length})
})

/**
 * @swagger
 * /api/v2/banco/{id}/personas/{pid}:
 *   get:
 *     summary: Obtener una persona de un banco (V2)
 *     tags:
 *       - V2 - Personas
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *       - in: path
 *         name: pid
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Persona encontrada
 */
router.get("/banco/:id/personas/:pid", (req, res) => {
    const data = leerDatos()
    const banco = data.bancos.find(b => b.id == req.params.id)
    if (!banco) {
        return res.status(404).json({success: false, error: "Banco no encontrado"})
    }
    const persona = banco.personas.find(p => p.id == req.params.pid)
    if (!persona) {
        return res.status(404).json({success: false, error: "Persona no encontrada"})
    }
    res.json({success: true, data: persona})
})

router.post("/banco", authenticateToken, (req, res) => {
    const data = leerDatos()
    const nuevoBanco = {
        id: data.bancos.length + 1,
        nombre: req.body.nombre,
        ciudad: req.body.ciudad || "",
        telefono: req.body.telefono || "",
        email: req.body.email || "",
        personas: []
    }
    data.bancos.push(nuevoBanco)
    guardarDatos(data)
    res.status(201).json({success: true, data: nuevoBanco})
})

router.post("/banco/:id/personas", authenticateToken, (req, res) => {
    const data = leerDatos()
    const banco = data.bancos.find(b => b.id == req.params.id)
    if (!banco) {
        return res.status(404).json({success: false, error: "Banco no encontrado"})
    }
    const nuevaPersona = {
        id: banco.personas.length + 1,
        nombre: req.body.nombre,
        cargo: req.body.cargo || "",
        email: req.body.email || ""
    }
    banco.personas.push(nuevaPersona)
    guardarDatos(data)
    res.status(201).json({success: true, data: nuevaPersona})
})

router.put("/banco/:id", authenticateToken, (req, res) => {
    const data = leerDatos()
    const banco = data.bancos.find(b => b.id == req.params.id)
    if (!banco) {
        return res.status(404).json({success: false, error: "Banco no encontrado"})
    }
    banco.nombre = req.body.nombre || banco.nombre
    banco.ciudad = req.body.ciudad || banco.ciudad
    banco.telefono = req.body.telefono || banco.telefono
    banco.email = req.body.email || banco.email
    guardarDatos(data)
    res.json({success: true, data: banco})
})

router.put("/banco/:id/personas/:pid", authenticateToken, (req, res) => {
    const data = leerDatos()
    const banco = data.bancos.find(b => b.id == req.params.id)
    if (!banco) {
        return res.status(404).json({success: false, error: "Banco no encontrado"})
    }
    const persona = banco.personas.find(p => p.id == req.params.pid)
    if (!persona) {
        return res.status(404).json({success: false, error: "Persona no encontrada"})
    }
    persona.nombre = req.body.nombre || persona.nombre
    persona.cargo = req.body.cargo || persona.cargo
    persona.email = req.body.email || persona.email
    guardarDatos(data)
    res.json({success: true, data: persona})
})

router.delete("/banco/:id/personas/:pid", authenticateToken, (req, res) => {
    const data = leerDatos()
    const banco = data.bancos.find(b => b.id == req.params.id)
    if (!banco) {
        return res.status(404).json({success: false, error: "Banco no encontrado"})
    }
    const index = banco.personas.findIndex(p => p.id == req.params.pid)
    if (index === -1) {
        return res.status(404).json({success: false, error: "Persona no encontrada"})
    }
    const eliminada = banco.personas.splice(index, 1)
    guardarDatos(data)
    res.json({success: true, mensaje: "Persona eliminada", data: eliminada})
})

export default router