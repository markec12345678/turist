import { createServer } from "http"
import { parse } from "url"
import next from "next"
import { Server } from "socket.io"

const dev = process.env.NODE_ENV !== "production"
const hostname = "0.0.0.0"
const port = parseInt(process.env.PORT || "3000", 10)

const app = next({ dev, hostname, port })
const handle = app.getRequestHandler()

app.prepare().then(() => {
  const httpServer = createServer((req, res) => {
    const parsedUrl = parse(req.url!, true)
    handle(req, res, parsedUrl)
  })

  const io = new Server(httpServer, {
    path: "/api/socketio",
    cors: { origin: "*" },
  })

  io.on("connection", (socket) => {
    console.log("🔌 Client connected:", socket.id)

    socket.on("join:property", (propertyId: string) => {
      socket.join(`property:${propertyId}`)
    })

    socket.on("order:status", (data: { orderId: string; status: string; propertyId: string }) => {
      io.to(`property:${data.propertyId}`).emit("order:updated", data)
    })

    socket.on("table:status", (data: { tableId: string; status: string; propertyId: string }) => {
      io.to(`property:${data.propertyId}`).emit("table:updated", data)
    })

    socket.on("notification", (data: { userId: string; title: string; message: string }) => {
      socket.to(`user:${data.userId}`).emit("notification:new", data)
    })

    socket.on("disconnect", () => {
      console.log("🔌 Client disconnected:", socket.id)
    })
  })

  httpServer.listen(port, hostname, () => {
    console.log(`> Ready on http://${hostname}:${port}`)
    console.log(`> Socket.io running on /api/socketio`)
  })
})
