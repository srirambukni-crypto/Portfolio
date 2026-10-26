import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;
const distPath = path.join(__dirname, 'dist');

// Serve static build assets with caching
app.use(
  express.static(distPath, {
    maxAge: '1h',
    setHeaders: (res, filePath) => {
      if (filePath.endsWith('.html')) {
        // Prevent stale caching for HTML
        res.setHeader('Cache-Control', 'no-cache');
      }
    },
  })
);

// Simple healthcheck for deployment monitors
app.get('/healthz', (req, res) => {
  res.status(200).send('OK');
});

// Single Page Application fallback to index.html
app.get('*', (req, res) => {
  res.sendFile(path.join(distPath, 'index.html'), (err) => {
    if (err) {
      res.status(500).send('Error loading application');
    }
  });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server listening on port ${PORT}`);
});
