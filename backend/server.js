require('dotenv').config()

const fs = require('node:fs')
const path = require('node:path')
const express = require('express')
const cors = require('cors')
const sqlite3 = require('sqlite3').verbose()

const app = express()

const PORT = process.env.PORT || 4000
const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN || 'http://localhost:5173'
const DB_FILE = process.env.DB_FILE || path.join(__dirname, 'data', 'contacts.sqlite')
const ADMIN_TOKEN = process.env.ADMIN_TOKEN || ''

const dbPath = path.isAbsolute(DB_FILE) ? DB_FILE : path.join(__dirname, DB_FILE)
fs.mkdirSync(path.dirname(dbPath), { recursive: true })

const db = new sqlite3.Database(dbPath)

db.serialize(() => {
  db.run(`
    CREATE TABLE IF NOT EXISTS contacts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      email TEXT NOT NULL,
      phone TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    )
  `)
})

app.use(cors({ origin: CLIENT_ORIGIN }))
app.use(express.json({ limit: '32kb' }))

function run(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function callback(error) {
      if (error) reject(error)
      else resolve({ id: this.lastID, changes: this.changes })
    })
  })
}

function all(sql, params = []) {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (error, rows) => {
      if (error) reject(error)
      else resolve(rows)
    })
  })
}

function clean(value) {
  return String(value || '').trim().replace(/\s+/g, ' ')
}

function isEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
}

function requireAdmin(req, res, next) {
  if (!ADMIN_TOKEN) {
    return res.status(403).json({
      message: 'Defina ADMIN_TOKEN no .env para liberar a listagem de contatos.',
    })
  }

  const token = req.header('x-admin-token')
  if (token !== ADMIN_TOKEN) {
    return res.status(401).json({ message: 'Token administrativo inválido.' })
  }

  next()
}

app.get('/api/health', (req, res) => {
  res.json({ ok: true, database: path.basename(dbPath) })
})

app.post('/api/contacts', async (req, res) => {
  try {
    const name = clean(req.body.name)
    const email = clean(req.body.email).toLowerCase()
    const phone = clean(req.body.phone)

    if (name.length < 2) {
      return res.status(400).json({ message: 'Informe um nome válido.' })
    }

    if (!isEmail(email)) {
      return res.status(400).json({ message: 'Informe um e-mail válido.' })
    }

    if (phone.replace(/\D/g, '').length < 10) {
      return res.status(400).json({ message: 'Informe um telefone com DDD.' })
    }

    const result = await run(
      'INSERT INTO contacts (name, email, phone) VALUES (?, ?, ?)',
      [name, email, phone]
    )

    return res.status(201).json({
      message: 'Contato cadastrado com sucesso.',
      id: result.id,
    })
  } catch (error) {
    console.error(error)
    return res.status(500).json({ message: 'Erro ao salvar contato.' })
  }
})

app.get('/api/contacts', requireAdmin, async (req, res) => {
  try {
    const contacts = await all(
      'SELECT id, name, email, phone, created_at FROM contacts ORDER BY id DESC'
    )

    return res.json({ contacts })
  } catch (error) {
    console.error(error)
    return res.status(500).json({ message: 'Erro ao listar contatos.' })
  }
})

app.use((req, res) => {
  res.status(404).json({ message: 'Rota não encontrada.' })
})

process.on('SIGINT', () => {
  db.close(() => {
    console.log('Banco fechado.')
    process.exit(0)
  })
})

app.listen(PORT, () => {
  console.log(`API rodando em http://localhost:${PORT}`)
  console.log(`Banco SQLite em ${dbPath}`)
})
