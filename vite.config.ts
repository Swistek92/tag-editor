import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    {
      name: 'save-gallery-api',
      configureServer(server: any) {
        return () => {
          server.middlewares.use((req: any, res: any, next: any) => {
            if (req.url === '/save-gallery' && req.method === 'POST') {
              let body = ''
              req.on('data', (chunk: any) => {
                body += chunk
              })
              req.on('end', () => {
                try {
                  const filePath = path.join(__dirname, 'src/Data/gallery.json')
                  const parsed = JSON.parse(body)
                  const formatted = JSON.stringify(parsed, null, 2)
                  fs.writeFileSync(filePath, formatted, 'utf-8')
                  res.statusCode = 200
                  res.setHeader('Content-Type', 'text/plain')
                  res.end('saved')
                } catch (err) {
                  res.statusCode = 500
                  res.setHeader('Content-Type', 'text/plain')
                  res.end(String(err))
                }
              })
            } else {
              next()
            }
          })
        }
      },
    },
  ],
})
