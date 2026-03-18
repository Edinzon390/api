import express from "express"
import { leerDatos, guardarDatos } from "./utils.js"

const router = express.Router()

function siguienteId(items) {
    return items.reduce((max, item) => Math.max(max, Number(item.id) || 0), 0) + 1
}

/**
 * @swagger
 * /api/v1/banco:
 *   get:
 *     summary: Obtener todos los bancos (V1)
 *     tags:
 *       - V1 - Bancos
 *     responses:
 *       200:
 *         description: Lista de todos los bancos
 */
router.get("/banco", (req, res) => {
    const data = leerDatos()
    res.json(data.bancos)
})

/**
 * @swagger
 * /api/v1/banco/{id}:
 *   get:
 *     summary: Obtener un banco por ID (V1)
 *     tags:
 *       - V1 - Bancos
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
        return res.status(404).json({mensaje: "Banco no encontrado"})
    }
    res.json(banco)
})

/**
 * @swagger
 * /api/v1/banco/{id}/personas:
 *   get:
 *     summary: Obtener personas de un banco (V1)
 *     tags:
 *       - V1 - Personas
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Personas del banco
 *       404:
 *         description: Banco no encontrado
 */
router.get("/banco/:id/personas", (req, res) => {
    const data = leerDatos()
    const banco = data.bancos.find(b => b.id == req.params.id)
    if (!banco) {
        return res.status(404).json({mensaje: "Banco no encontrado"})
    }
    res.json(banco.personas)
})

/**
 * @swagger
 * /api/v1/banco/{id}/personas/{pid}:
 *   get:
 *     summary: Obtener una persona de un banco (V1)
 *     tags:
 *       - V1 - Personas
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
        return res.status(404).json({mensaje: "Banco no encontrado"})
    }
    const persona = banco.personas.find(p => p.id == req.params.pid)
    if (!persona) {
        return res.status(404).json({mensaje: "Persona no encontrada"})
    }
    res.json(persona)
})

/**
 * @swagger
 * /api/v1/banco:
 *   post:
 *     summary: Crear un nuevo banco (V1)
 *     tags:
 *       - V1 - Bancos
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nombre:
 *                 type: string
 *               ciudad:
 *                 type: string
 *               telefono:
 *                 type: string
 *               email:
 *                 type: string
 *     responses:
 *       201:
 *         description: Banco creado exitosamente
 */
router.post("/banco", (req, res) => {
    const data = leerDatos()
    if (!req.body.nombre) {
        return res.status(400).json({ mensaje: "El nombre del banco es requerido" })
    }
    const nuevoBanco = {
        id: siguienteId(data.bancos),
        nombre: req.body.nombre,
        ciudad: req.body.ciudad || "",
        telefono: req.body.telefono || "",
        email: req.body.email || "",
        personas: []
    }
    data.bancos.push(nuevoBanco)
    guardarDatos(data)
    res.status(201).json(nuevoBanco)
})

/**
 * @swagger
 * /api/v1/banco/{id}/personas:
 *   post:
 *     summary: Agregar una persona a un banco (V1)
 *     tags:
 *       - V1 - Personas
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nombre:
 *                 type: string
 *               cargo:
 *                 type: string
 *               email:
 *                 type: string
 *     responses:
 *       201:
 *         description: Persona agregada exitosamente
 */
router.post("/banco/:id/personas", (req, res) => {
    const data = leerDatos()
    const banco = data.bancos.find(b => b.id == req.params.id)
    if (!banco) {
        return res.status(404).json({mensaje: "Banco no encontrado"})
    }
    if (!req.body.nombre) {
        return res.status(400).json({ mensaje: "El nombre de la persona es requerido" })
    }
    const nuevaPersona = {
        id: siguienteId(banco.personas),
        nombre: req.body.nombre,
        cargo: req.body.cargo || "",
        email: req.body.email || ""
    }
    banco.personas.push(nuevaPersona)
    guardarDatos(data)
    res.status(201).json(nuevaPersona)
})

/**
 * @swagger
 * /api/v1/banco/{id}:
 *   put:
 *     summary: Actualizar datos de un banco (V1)
 *     tags:
 *       - V1 - Bancos
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Banco actualizado
 */
router.put("/banco/:id", (req, res) => {
    const data = leerDatos()
    const banco = data.bancos.find(b => b.id == req.params.id)
    if (!banco) {
        return res.status(404).json({mensaje: "Banco no encontrado"})
    }
    banco.nombre = req.body.nombre || banco.nombre
    banco.ciudad = req.body.ciudad || banco.ciudad
    banco.telefono = req.body.telefono || banco.telefono
    banco.email = req.body.email || banco.email
    guardarDatos(data)
    res.json(banco)
})

/**
 * @swagger
 * /api/v1/banco/{id}/personas/{pid}:
 *   put:
 *     summary: Actualizar una persona (V1)
 *     tags:
 *       - V1 - Personas
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
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Persona actualizada
 */
router.put("/banco/:id/personas/:pid", (req, res) => {
    const data = leerDatos()
    const banco = data.bancos.find(b => b.id == req.params.id)
    if (!banco) {
        return res.status(404).json({mensaje: "Banco no encontrado"})
    }
    const persona = banco.personas.find(p => p.id == req.params.pid)
    if (!persona) {
        return res.status(404).json({mensaje: "Persona no encontrada"})
    }
    persona.nombre = req.body.nombre || persona.nombre
    persona.cargo = req.body.cargo || persona.cargo
    persona.email = req.body.email || persona.email
    guardarDatos(data)
    res.json(persona)
})

/**
 * @swagger
 * /api/v1/banco/{id}/personas/{pid}:
 *   delete:
 *     summary: Eliminar una persona (V1)
 *     tags:
 *       - V1 - Personas
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
 *         description: Persona eliminada
 */
router.delete("/banco/:id/personas/:pid", (req, res) => {
    const data = leerDatos()
    const banco = data.bancos.find(b => b.id == req.params.id)
    if (!banco) {
        return res.status(404).json({mensaje: "Banco no encontrado"})
    }
    const index = banco.personas.findIndex(p => p.id == req.params.pid)
    if (index === -1) {
        return res.status(404).json({mensaje: "Persona no encontrada"})
    }
    const eliminada = banco.personas.splice(index, 1)
    guardarDatos(data)
    res.json({
        mensaje: "Persona eliminada",
        persona: eliminada
    })
})

export default router
