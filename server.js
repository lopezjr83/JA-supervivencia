/**
 * Servidor Node.js personalizado para Socket.io
 * Ejecutar: node server.js (en desarrollo)
 * Vercel ignora este archivo y usa Next.js built-in (sin WebSockets)
 */

const { createServer } = require("http")
const { parse } = require("url")
const next = require("next")
const { initializeSocket } = require("./lib/socket")

const dev = process.env.NODE_ENV !== "production"
const hostname = "localhost"
const port = parseInt(process.env.PORT || "3000", 10)

const app = next({ dev, hostname, port })
const handle = app.getRequestHandler()

app.prepare().then(() => {
  const httpServer = createServer((req, res) => {
    const parsedUrl = parse(req.url, true)
    handle(req, res, parsedUrl)
  })

  // Inicializar Socket.io
  initializeSocket(httpServer)
  console.log("[Socket.io] Initialized on http://localhost:3000")

  httpServer.listen(port, (err) => {
    if (err) throw err
    console.log(
      `> Ready on http://${hostname}:${port} with WebSocket support (Socket.io)`
    )
  })
})
