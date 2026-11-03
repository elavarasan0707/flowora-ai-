import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { apiRouter } from './apiRouter.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Mount API routes
app.use('/api', apiRouter);

// Serve static frontend in production
const distPath = path.resolve(__dirname, '../dist');
app.use(express.static(distPath));

app.get('*', (_req, res) => {
  res.sendFile(path.join(distPath, 'index.html'));
});

if (process.env.NODE_ENV === 'production' || process.argv.includes('--standalone')) {
  app.listen(PORT, () => {
    console.log(`Flowora AI production server listening on port ${PORT}`);
  });
}

export { app };
