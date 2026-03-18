import fs from "fs"
import path from "path"
import { fileURLToPath } from "url"

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const FILE = path.join(__dirname, "bancos.json")

export function leerDatos() {
    const data = fs.readFileSync(FILE, "utf-8")
    return JSON.parse(data)
}

export function guardarDatos(data) {
    fs.writeFileSync(FILE, JSON.stringify(data, null, 2))
}
