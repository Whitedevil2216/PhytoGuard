import path from 'path';
import { fileURLToPath } from 'url';
import express from 'express';
import { createServer as createViteServer } from 'vite';
import { connectDatabase } from './server/src/config/db.js';
import { applyCoreMiddleware } from './server/src/app.js';
import { errorHandler } from './server/src/middleware/errorHandler.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PORT = Number(process.env.PORT) || 3000;

async function startUnifiedServer() {
  await connectDatabase();

  const app = express();
  applyCoreMiddleware(app);

  // Express API & upload error handler runs before SPA fallback
  app.use(errorHandler);

  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`PhytoGuard full-stack server running on http://0.0.0.0:${PORT}`);
  });
}

startUnifiedServer().catch((err) => {
  console.error('Failed to start unified PhytoGuard server:', err);
  process.exit(1);
});
