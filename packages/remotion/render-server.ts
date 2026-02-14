/**
 * Simple Remotion Render Server
 * 
 * Run with: npx tsx render-server.ts
 * 
 * Endpoints:
 *   POST /render - Render a video
 *   GET /health - Health check
 */

import { bundle } from '@remotion/bundler';
import { renderMedia, selectComposition } from '@remotion/renderer';
import { createServer } from 'http';
import { parse } from 'url';
import path from 'path';
import fs from 'fs';

const PORT = process.env.RENDER_PORT || 3333;
const OUTPUT_DIR = process.env.OUTPUT_DIR || './output';

// Ensure output directory exists
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

let bundleLocation: string | null = null;

async function ensureBundle() {
  if (bundleLocation) return bundleLocation;
  
  console.log('📦 Creating Remotion bundle...');
  bundleLocation = await bundle({
    entryPoint: path.resolve(__dirname, './src/index.ts'),
    webpackOverride: (config) => config,
  });
  console.log('✅ Bundle created at:', bundleLocation);
  
  return bundleLocation;
}

const server = createServer(async (req, res) => {
  const { pathname } = parse(req.url || '', true);
  
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  // Health check
  if (pathname === '/health' && req.method === 'GET') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ status: 'ok', bundled: !!bundleLocation }));
    return;
  }

  // Render endpoint
  if (pathname === '/render' && req.method === 'POST') {
    let body = '';
    
    req.on('data', (chunk) => {
      body += chunk.toString();
    });
    
    req.on('end', async () => {
      try {
        const { composition = 'SimpleReel', inputProps, userId = 'anon' } = JSON.parse(body);
        
        console.log(`🎬 Starting render: ${composition}`);
        console.log('Props:', JSON.stringify(inputProps, null, 2));
        
        const bundled = await ensureBundle();
        
        const compositionData = await selectComposition({
          serveUrl: bundled,
          id: composition,
          inputProps,
        });

        const outputFile = path.join(
          OUTPUT_DIR,
          `reel-${userId}-${Date.now()}.mp4`
        );

        console.log(`🎥 Rendering to: ${outputFile}`);

        await renderMedia({
          composition: compositionData,
          serveUrl: bundled,
          codec: 'h264',
          outputLocation: outputFile,
          inputProps,
          onProgress: ({ progress }) => {
            console.log(`Progress: ${Math.round(progress * 100)}%`);
          },
        });

        console.log('✅ Render complete!');

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          status: 'completed',
          videoUrl: outputFile,
          videoPath: path.resolve(outputFile),
        }));
        
      } catch (error) {
        console.error('❌ Render error:', error);
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: String(error) }));
      }
    });
    
    return;
  }

  // Serve rendered videos
  if (pathname?.startsWith('/output/') && req.method === 'GET') {
    const filePath = path.join(__dirname, pathname);
    if (fs.existsSync(filePath)) {
      const stat = fs.statSync(filePath);
      res.writeHead(200, {
        'Content-Type': 'video/mp4',
        'Content-Length': stat.size,
      });
      fs.createReadStream(filePath).pipe(res);
      return;
    }
  }

  // 404
  res.writeHead(404, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ error: 'Not found' }));
});

// Pre-bundle on startup
ensureBundle().catch(console.error);

server.listen(PORT, () => {
  console.log(`🚀 Render server running at http://localhost:${PORT}`);
  console.log('');
  console.log('Endpoints:');
  console.log(`  POST http://localhost:${PORT}/render`);
  console.log(`  GET  http://localhost:${PORT}/health`);
});
