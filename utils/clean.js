const path = require('path');
const fs = require('fs');

const outPath = path.join(__dirname, '../out');

if (fs.existsSync(outPath)) {
    fs.rmSync(outPath, { recursive: true, force: true });
}

const listPath = path.join(__dirname, '../plugins.json');

if (fs.existsSync(listPath)) {
    fs.rmSync(listPath);
}
