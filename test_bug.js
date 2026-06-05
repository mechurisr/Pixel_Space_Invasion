import fs from 'fs';
const code = fs.readFileSync('src/App.jsx', 'utf8');

const handleNextTurnStr = code.substring(code.indexOf('const handleNextTurn = () => {'), code.indexOf('const handlePlayerAction = (target) => {'));
console.log("Extracted handleNextTurn length:", handleNextTurnStr.length);
