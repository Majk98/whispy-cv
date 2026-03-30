import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    include: ["html2canvas", "jspdf"],
  },
  server: {
    proxy: {
      // Forward /api/* from the Vite dev server to the Express backend
      "/api": {
        target: "http://localhost:4242",
        changeOrigin: true,
        // Return a JSON error instead of an HTML Vite error page when backend is down
        configure: (proxy) => {
          proxy.on("error", (err, _req, res) => {
            console.error("[proxy] backend unavailable:", err.message);
            res.writeHead(503, { "Content-Type": "application/json" });
            res.end(JSON.stringify({ error: "Backend nedostupný — spusťte npm run server" }));
          });
        },
      },
    },
  },
})
