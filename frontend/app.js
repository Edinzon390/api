const output = document.getElementById("output")
const btnFetch = document.getElementById("btnFetch")
const btnCreate = document.getElementById("btnCreate")
const btnLogin = document.getElementById("btnLogin")
const btnRegister = document.getElementById("btnRegister")
const btnLogout = document.getElementById("btnLogout")
const inputEmail = document.getElementById("inputEmail")
const inputPassword = document.getElementById("inputPassword")
const inputName = document.getElementById("inputName")
const authStatus = document.getElementById("authStatus")
const tokenDisplay = document.getElementById("tokenDisplay")

const apiBase = window.location.origin + "/api/v2"
const authBase = window.location.origin + "/api/auth"
const storageKey = "apiToken"

function setOutput(content) {
  output.innerHTML = ""
  const pre = document.createElement("pre")
  pre.textContent = JSON.stringify(content, null, 2)
  output.appendChild(pre)
}

function getStoredToken() {
  return localStorage.getItem(storageKey)
}

function setStoredToken(token) {
  if (token) {
    localStorage.setItem(storageKey, token)
  } else {
    localStorage.removeItem(storageKey)
  }
  updateAuthUI()
}

function getAuthHeaders() {
  const token = getStoredToken()
  if (!token) return {}
  return {
    Authorization: `Bearer ${token}`
  }
}

function updateAuthUI() {
  const token = getStoredToken()
  const isLoggedIn = !!token

  btnLogout.disabled = !isLoggedIn
  btnCreate.disabled = !isLoggedIn
  tokenDisplay.textContent = isLoggedIn ? token : "(ninguno)"
  authStatus.textContent = isLoggedIn ? "Usuario autenticado" : "No autenticado"
}

async function makeRequest(url, options = {}) {
  const response = await fetch(url, {
    headers: {
      "Content-Type": "application/json",
      ...options.headers
    },
    ...options
  })
  const body = await response.json().catch(() => null)
  return { status: response.status, body }
}

btnFetch.addEventListener("click", async () => {
  btnFetch.disabled = true
  btnFetch.textContent = "Cargando..."

  try {
    const data = await makeRequest(`${apiBase}/banco`)
    setOutput(data)
  } catch (err) {
    setOutput({ error: String(err) })
  } finally {
    btnFetch.disabled = false
    btnFetch.textContent = "Obtener bancos (v2)"
  }
})

btnCreate.addEventListener("click", async () => {
  const nombre = prompt("Nombre del banco:")
  if (!nombre) return

  btnCreate.disabled = true
  btnCreate.textContent = "Creando..."

  try {
    const data = await makeRequest(`${apiBase}/banco`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify({ nombre })
    })
    setOutput(data)
  } catch (err) {
    setOutput({ error: String(err) })
  } finally {
    btnCreate.disabled = false
    btnCreate.textContent = "Crear banco (protegido)"
  }
})

btnLogin.addEventListener("click", async () => {
  const email = inputEmail.value.trim()
  const password = inputPassword.value.trim()
  if (!email || !password) {
    authStatus.textContent = "Email y password son obligatorios"
    return
  }

  btnLogin.disabled = true
  btnLogin.textContent = "Ingresando..."

  try {
    const data = await makeRequest(`${authBase}/login`, {
      method: "POST",
      body: JSON.stringify({ email, password })
    })

    if (data.status === 200 && data.body?.data?.token) {
      setStoredToken(data.body.data.token)
      setOutput({ message: "Login exitoso", token: data.body.data.token })
    } else {
      setOutput(data)
    }
  } catch (err) {
    setOutput({ error: String(err) })
  } finally {
    btnLogin.disabled = false
    btnLogin.textContent = "Iniciar sesión"
  }
})

btnRegister.addEventListener("click", async () => {
  const email = inputEmail.value.trim()
  const password = inputPassword.value.trim()
  const name = inputName.value.trim()
  if (!email || !password) {
    authStatus.textContent = "Email y password son obligatorios"
    return
  }

  btnRegister.disabled = true
  btnRegister.textContent = "Registrando..."

  try {
    const data = await makeRequest(`${authBase}/register`, {
      method: "POST",
      body: JSON.stringify({ email, password, name })
    })
    setOutput(data)
  } catch (err) {
    setOutput({ error: String(err) })
  } finally {
    btnRegister.disabled = false
    btnRegister.textContent = "Registrar"
  }
})

btnLogout.addEventListener("click", () => {
  setStoredToken(null)
  setOutput({ message: "Sesión cerrada" })
})

updateAuthUI()
