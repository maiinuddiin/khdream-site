import fs from 'fs';
import path from 'path';

const srcDir = path.resolve(process.cwd(), 'data');
const destDir = path.resolve(process.cwd(), 'dist', 'data');

try {
  if (fs.existsSync(srcDir)) {
    fs.cpSync(srcDir, destDir, { recursive: true });
    console.log(`[BUILD] Successfully copied ${srcDir} to ${destDir}`);
  }
} catch (err) {
  console.warn('[BUILD] Warning: Could not copy data folder to dist:', err);
}
