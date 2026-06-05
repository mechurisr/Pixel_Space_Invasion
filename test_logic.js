import fs from 'fs';
const code = fs.readFileSync('src/App.jsx', 'utf8');
const start = code.indexOf('const handleNextTurn = () => {');
const end = code.indexOf('const handlePlayerAction = (target) => {');
const funcBody = code.substring(start, end);

const wrapper = `
const t = (str) => str;
let turn = 1;
let tutorialStep = -1;
let selectedCommander = 'test';
let territories = Array.from({length: 60}, (_, i) => ({ id: i+1, name: 'T'+i, trait: 'TECH-CENTRIC', neighbors: [i+2], military: 30, oil: 30, tech: 30, isOccupied: false, mutationUnit: null, nukeStatus: null, hasMothership: false }));
territories[0].military = 60; // AI node
territories[0].neighbors = [2, 3];
territories[1].neighbors = [1];
territories[2].neighbors = [1];

let aiData = [{ factionId: 'f1', territoryIds: [1] }];
let playerIds = [60];
let updateLogs = [];
let alienExpansionsThisTurn = 0;
let commanderCooldown = 0;
let solarFlareZones = [];
let solarFlareDuration = 0;
let turnsSinceLastSupply = 0;
let offeredQuest = null;
let activeQuest = null;
let mothershipDefeated = false;

const AI_FACTIONS = [{ id: 'f1', name: 'Faction 1', colorClass: 'text-amber-500', bgClass: 'bg-amber-900', borderClass: 'border-amber-500' }];
const QUESTS = [];
const getEffectiveMilitary = (country) => country.military;
const setTurn = (cb) => { turn = cb(turn); };
const setActedRegions = () => {};
const setCommanderCooldown = () => {};
const setSolarFlareZones = () => {};
const setSolarFlareDuration = () => {};
const setTurnsSinceLastSupply = () => {};
const setOfferedQuest = () => {};
const setActiveQuest = () => {};
const setPlayerIds = (val) => { playerIds = val; };
const setAiData = (val) => { aiData = val; };
const setTerritories = (val) => { territories = val; };
const setTutorialStep = (val) => { tutorialStep = val; };
const setEvents = (val) => {};
const addEvent = (msg) => updateLogs.push(msg);
const tLog = (key, val) => key;

${funcBody}

try {
  handleNextTurn();
  console.log("Success! Turn is now:", turn);
  console.log("Logs:", updateLogs);
  console.log("AI territory count:", aiData[0].territoryIds.length);
  console.log("Alien nodes:", territories.filter(t => t.isOccupied).length);
} catch(e) {
  console.log("CRASH:", e);
}
`;
fs.writeFileSync('test_run.cjs', wrapper);
