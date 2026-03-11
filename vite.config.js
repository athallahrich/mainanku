import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import fs from 'fs'
import path from 'path'

// Custom plugin for Local File-based DB
const localDbPlugin = () => ({
  name: 'local-db',
  configureServer(server) {
    server.middlewares.use(async (req, res, next) => {
      if (req.url === '/api/cards') {
        const dbPath = path.resolve(__dirname, 'public/questions.json')

        if (req.method === 'GET') {
          const data = fs.readFileSync(dbPath, 'utf8')
          res.setHeader('Content-Type', 'application/json')
          res.end(data)
          return
        }

        if (req.method === 'POST') {
          let body = ''
          req.on('data', chunk => body += chunk)
          req.on('end', () => {
            fs.writeFileSync(dbPath, body, 'utf8')
            res.setHeader('Content-Type', 'application/json')
            res.end(JSON.stringify({ success: true }))
          })
          return
        }
      }
      next()
    })
  }
})

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), localDbPlugin()],
})
