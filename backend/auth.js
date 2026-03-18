import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { config } from 'dotenv';
import fs from 'fs';

config();

const app = express();
app.use(express.json());

const USERS_FILE = './users.json';

// 📌 Asegurar que el archivo existe
function ensureUsersFile() {
  if (!fs.existsSync(USERS_FILE)) {
    fs.writeFileSync(USERS_FILE, JSON.stringify({ users: [] }, null, 2));
  }
}

// 📌 Leer usuarios
function getUsers() {
  ensureUsersFile();
  const data = fs.readFileSync(USERS_FILE);
  return JSON.parse(data).users;
}

// 📌 Guardar usuarios
function saveUsers(users) {
  fs.writeFileSync(USERS_FILE, JSON.stringify({ users }, null, 2));
}

// 🔐 Middleware
export function verificarToken(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    return res.status(401).json({
      ok: false,
      mensaje: 'Token requerido'
    });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, process.env.TOKEN_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({
      ok: false,
      mensaje: 'Token inválido o expirado'
    });
  }
}

// 📝 REGISTRO
app.post('/register', async (req, res) => {
  try {
    const { username, password } = req.body;

    const users = getUsers();

    const userExists = users.find(u => u.username === username);
    if (userExists) {
      return res.status(400).json({
        ok: false,
        mensaje: 'El usuario ya existe'
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = { username, password: hashedPassword };
    users.push(newUser);

    saveUsers(users);

    res.status(201).json({
      ok: true,
      mensaje: 'Usuario registrado',
      user: { username }
    });

  } catch (error) {
    res.status(500).json({
      ok: false,
      mensaje: 'Error en el servidor'
    });
  }
});

// 🔑 LOGIN
app.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;

    const users = getUsers();

    const user = users.find(u => u.username === username);
    if (!user) {
      return res.status(400).json({
        ok: false,
        mensaje: 'Usuario no encontrado'
      });
    }

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(400).json({
        ok: false,
        mensaje: 'Contraseña incorrecta'
      });
    }

    const token = jwt.sign(
      { username: user.username },
      process.env.TOKEN_SECRET,
      { expiresIn: '1h' }
    );

    res.json({
      ok: true,
      mensaje: 'Login exitoso',
      token
    });

  } catch (error) {
    res.status(500).json({
      ok: false,
      mensaje: 'Error en el servidor'
    });
  }
});

// 🔒 Ruta protegida
app.get('/', verificarToken, (req, res) => {
  res.json({
    ok: true,
    mensaje: 'Acceso concedido',
    user: req.user
  });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Servidor corriendo en puerto ${PORT}`);
});