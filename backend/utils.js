import fs from "fs"

const FILE = "./bancos.json"

export function leerDatos() {
    const data = fs.readFileSync(FILE)
    return JSON.parse(data)
}

export function guardarDatos(data) {
    fs.writeFileSync(FILE, JSON.stringify(data, null, 2))
}
