import express from "express"
import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"
import { config } from "dotenv"
import fs from "fs"
import path from "path"
import { fileURLToPath } from "url"

config()

const router = express.Router()
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const USERS_FILE = path.join(__dirname, "users.json")

function ensureUsersFile() {
    if (!fs.existsSync(USERS_FILE)) {
        fs.writeFileSync(USERS_FILE, JSON.stringify({ users: [] }, null, 2))
    }
}

function getUsers() {
    ensureUsersFile()
    const data = fs.readFileSync(USERS_FILE, "utf-8")
    return JSON.parse(data).users
}

function saveUsers(users) {
    fs.writeFileSync(USERS_FILE, JSON.stringify({ users }, null, 2))
}

function getJwtSecret() {
    return process.env.TOKEN_SECRET
}

function requireCredentials(req, res) {
    const { username, password } = req.body

    if (!username || !password) {
        res.status(400).json({
            ok: false,
            mensaje: "username y password son requeridos"
        })
        return null
    }

    return { username: String(username).trim(), password: String(password) }
}

export function verificarToken(req, res, next) {
    const authHeader = req.headers.authorization
    const secret = getJwtSecret()

    if (!secret) {
        return res.status(500).json({
            ok: false,
            mensaje: "TOKEN_SECRET no esta configurado"
        })
    }

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({
            ok: false,
            mensaje: "Token requerido"
        })
    }

    const token = authHeader.split(" ")[1]

    try {
        const decoded = jwt.verify(token, secret)
        req.user = decoded
        next()
    } catch {
        return res.status(401).json({
            ok: false,
            mensaje: "Token invalido o expirado"
        })
    }
}

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Registrar un nuevo usuario
 *     tags:
 *       - Auth
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - password
 *             properties:
 *               username:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       201:
 *         description: Usuario registrado
 */
router.post("/register", async (req, res) => {
    try {
        const credentials = requireCredentials(req, res)
        if (!credentials) {
            return
        }

        const { username, password } = credentials
        const users = getUsers()

        const userExists = users.find((user) => user.username === username)
        if (userExists) {
            return res.status(400).json({
                ok: false,
                mensaje: "El usuario ya existe"
            })
        }

        const hashedPassword = await bcrypt.hash(password, 10)
        users.push({ username, password: hashedPassword })
        saveUsers(users)

        res.status(201).json({
            ok: true,
            mensaje: "Usuario registrado",
            user: { username }
        })
    } catch {
        res.status(500).json({
            ok: false,
            mensaje: "Error en el servidor"
        })
    }
})

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Iniciar sesion y obtener un JWT
 *     tags:
 *       - Auth
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - password
 *             properties:
 *               username:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Login exitoso
 */
router.post("/login", async (req, res) => {
    try {
        const secret = getJwtSecret()
        if (!secret) {
            return res.status(500).json({
                ok: false,
                mensaje: "TOKEN_SECRET no esta configurado"
            })
        }

        const credentials = requireCredentials(req, res)
        if (!credentials) {
            return
        }

        const { username, password } = credentials
        const users = getUsers()
        const user = users.find((savedUser) => savedUser.username === username)

        if (!user) {
            return res.status(400).json({
                ok: false,
                mensaje: "Usuario no encontrado"
            })
        }

        const validPassword = await bcrypt.compare(password, user.password)
        if (!validPassword) {
            return res.status(400).json({
                ok: false,
                mensaje: "Contrasena incorrecta"
            })
        }

        const token = jwt.sign({ username: user.username }, secret, { expiresIn: "1h" })

        res.json({
            ok: true,
            mensaje: "Login exitoso",
            token
        })
    } catch {
        res.status(500).json({
            ok: false,
            mensaje: "Error en el servidor"
        })
    }
})

/**
 * @swagger
 * /api/auth/me:
 *   get:
 *     summary: Validar el token actual
 *     tags:
 *       - Auth
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Token valido
 */
router.get("/me", verificarToken, (req, res) => {
    res.json({
        ok: true,
        mensaje: "Acceso concedido",
        user: req.user
    })
})

export default router
