const fs = require('fs');
const path = require('path');

// Create assets directory if it doesn't exist
if (!fs.existsSync('src/assets')) {
  fs.mkdirSync('src/assets', { recursive: true });
}

// Copy sql-wasm.wasm file
const sourceFile = path.join('node_modules', 'sql.js', 'dist', 'sql-wasm.wasm');
const targetFile = path.join('src', 'assets', 'sql-wasm.wasm');

fs.copyFileSync(sourceFile, targetFile);
console.log('Copied sql-wasm.wasm to assets directory');
