/* Confirm the existing production URL serves this commit's exact static files. */
const fs = require('node:fs/promises');
const path = require('node:path');
const crypto = require('node:crypto');
const origin = 'https://siftagent-five.vercel.app';
const files = ['index.html', 'styles.css', 'hero.css', 'app.js', 'app/index.html', 'app/workspace.js', 'app/workspace.css', 'app/mascot.js', 'app/manifest.webmanifest', 'app/icons/sift-32.png', 'app/icons/sift-180.png', 'app/icons/sift-192.png', 'app/icons/sift-512.png', 'app/icons/sift-maskable-512.png'];
const hash = bytes => crypto.createHash('sha256').update(bytes).digest('hex');
(async () => {
  const expected = new Map(await Promise.all(files.map(async file => [file, hash(await fs.readFile(path.resolve(__dirname, '../dist', file)))])));
  for (let attempt = 1; attempt <= 6; attempt++) {
    try {
      for (const file of files) {
        const url = new URL(file === 'index.html' ? '/' : '/' + file, origin);
        const response = await fetch(url, { headers: { 'Cache-Control': 'no-cache' }, signal: AbortSignal.timeout(10000) });
        if (!response.ok) throw new Error(`${file}: HTTP ${response.status}`);
        if (hash(Buffer.from(await response.arrayBuffer())) !== expected.get(file)) throw new Error(`${file}: deployment still serves different content`);
      }
      console.log(`PASS production serves the exact pages, scripts, styles, install manifest and icons from this commit: ${origin}`);
      return;
    } catch (error) {
      console.log(`Deployment attempt ${attempt}/6: ${error.message}`);
      if (attempt === 6) throw error;
      await new Promise(resolve => setTimeout(resolve, 15000));
    }
  }
})().catch(error => { console.error(error.message); process.exitCode = 1; });
