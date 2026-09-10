import fs from 'fs';
import path from 'path';

const srcDir = path.resolve(process.cwd(), 'data');
const destDir = path.resolve(process.cwd(), 'dist', 'data');
const invoicesDir = path.join(srcDir, 'invoices');

try {
  if (fs.existsSync(srcDir)) {
    fs.cpSync(srcDir, destDir, { recursive: true });
    console.log(`[BUILD] Successfully copied ${srcDir} to ${destDir}`);
  }
} catch (err) {
  console.warn('[BUILD] Warning: Could not copy data folder to dist:', err);
}

// Compile all invoices into a single static JSON file for GitHub Pages / static hosting
try {
  if (fs.existsSync(invoicesDir)) {
    const files = fs.readdirSync(invoicesDir).filter(f => f.startsWith('invoice_') && f.endsWith('.json'));
    const allInvoices = [];

    for (const f of files) {
      try {
        const fullPath = path.join(invoicesDir, f);
        const raw = fs.readFileSync(fullPath, 'utf-8');
        const parsed = JSON.parse(raw);
        if (parsed) {
          if (!parsed.id) {
            parsed.id = f.replace('invoice_', '').replace('.json', '');
          }
          allInvoices.push(parsed);
        }
      } catch (fileErr) {
        console.warn(`[BUILD] Could not parse invoice ${f}:`, fileErr.message);
      }
    }

    // Sort descending by date or id
    allInvoices.sort((a, b) => {
      const timeA = a.createdAt ? new Date(a.createdAt).getTime() : (parseInt(String(a.id).replace(/\D/g, '')) || 0);
      const timeB = b.createdAt ? new Date(b.createdAt).getTime() : (parseInt(String(b.id).replace(/\D/g, '')) || 0);
      return timeB - timeA;
    });

    const jsonStr = JSON.stringify(allInvoices, null, 2);
    
    // Save to data/invoices.json
    fs.writeFileSync(path.join(srcDir, 'invoices.json'), jsonStr);
    
    // Ensure destDir exists and save to dist/data/invoices.json
    if (!fs.existsSync(destDir)) {
      fs.mkdirSync(destDir, { recursive: true });
    }
    fs.writeFileSync(path.join(destDir, 'invoices.json'), jsonStr);

    // Also write an index.json inside invoices folder in dist
    const distInvoicesDir = path.join(destDir, 'invoices');
    if (fs.existsSync(distInvoicesDir)) {
      fs.writeFileSync(path.join(distInvoicesDir, 'index.json'), JSON.stringify(files, null, 2));
    }

    console.log(`[BUILD] Successfully compiled ${allInvoices.length} invoices into static data/invoices.json and dist/data/invoices.json`);
  }
} catch (compileErr) {
  console.warn('[BUILD] Warning: Could not compile invoices.json:', compileErr);
}
