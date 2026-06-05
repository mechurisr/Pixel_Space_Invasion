import fs from 'fs';
const code = fs.readFileSync('src/App.jsx', 'utf8');

console.log("Parsing App.jsx to find any syntax or runtime logic issues...");
