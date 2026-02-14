/**
 * Standalone Remotion Render Server
 * 
 * Run this on a VPS or locally to handle video rendering.
 * The main app calls this server via RENDER_SERVER_URL.
 * 
 * Usage:
 *   npx ts-node scripts/render-server.ts
 * 
 * Or with environment variables:
 *   PORT=3001 RENDER_SERVER_SECRET=your-secret npx ts-node scripts/render-server.ts
 */

import express from 'express';
import cors from 'cors';
import { bundle } from '@remotion/bundler';
import { renderMedia, selectComposition } from '@remotion/renderer';
import path from 'path';
import fs from 'fs';

const app = express();
app.use(cors());
app.use(express.json({ limit: '50mb' }));

const PORT = process.env.PORT || 3001;
const SECRET = process.env.RENDER_SERVER_SECRET || '';
const OUTPUT_DIR = process.env.OUTPUT_DIR || './output';

// Ensure output directory exists
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

// Bundle Remotion project once at startup
let bundlePromise: Promise<string> | null = null;

async function getBundleUrl() {
  if (!bundlePromise) {
    console.log('Bundling Remotion project...');
    bundlePromise = bundle({
      entryPoint: path.resolve(__dirname, '../lib/remotion/index.tsx'),
      webpackOverride: (config) => config,
    });
    const url = await bundlePromise;
    console.log('Bundle ready:', url);
  }
  return bundlePromise;
}

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', bundled: !!bundlePromise });
});

// Render endpoint
app.post('/render', async (req, res) => {
  // Check auth
  const authHeader = req.headers.authorization;
  if (SECRET && authHeader !== `Bearer ${SECRET}`) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const { composition, inputProps, userId } = req.body;

  if (!composition || !inputProps) {
    return res.status(400).json({ error: 'Missing composition or inputProps' });
  }

  try {
    console.log(`Starting render for user ${userId}...`);
    const startTime = Date.now();

    // Get bundle URL
    const bundleUrl = await getBundleUrl();

    // Select composition
    const comp = await selectComposition({
      serveUrl: bundleUrl,
      id: composition,
      inputProps,
    });

    // Generate output filename
    const filename = `reel-${userId || 'anon'}-${Date.now()}.mp4`;
    const outputPath = path.join(OUTPUT_DIR, filename);

    // Render
    await renderMedia({
      composition: comp,
      serveUrl: bundleUrl,
      codec: 'h264',
      outputLocation: outputPath,
      inputProps,
      onProgress: ({ progress }) => {
        console.log(`Rendering: ${(progress * 100).toFixed(1)}%`);
      },
    });

    const duration = (Date.now() - startTime) / 1000;
    console.log(`Render complete in ${duration.toFixed(1)}s: ${outputPath}`);

    // Return video URL (you'd need to serve these files or upload to S3/R2)
    const videoUrl = `${req.protocol}://${req.get('host')}/videos/${filename}`;

    res.json({
      status: 'completed',
      videoUrl,
      outputPath,
      renderTime: duration,
    });
  } catch (error) {
    console.error('Render error:', error);
    res.status(500).json({ 
      error: 'Render failed',
      details: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

// Serve rendered videos
app.use('/videos', express.static(OUTPUT_DIR));

// Start server
app.listen(PORT, () => {
  console.log(`🎬 Remotion Render Server running on port ${PORT}`);
  console.log(`   Health: http://localhost:${PORT}/health`);
  console.log(`   Render: POST http://localhost:${PORT}/render`);
  
  // Pre-bundle on startup
  getBundleUrl().catch(console.error);
});
