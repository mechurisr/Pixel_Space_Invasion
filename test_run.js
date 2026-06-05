
const t = (str, vars) => str;
const addEvent = () => {};
let turn = 1;
let tutorialStep = -1;
let territories = Array.from({length: 60}, (_, i) => ({ id: i+1, neighbors: [], military: 30, oil: 30, tech: 30, isOccupied: false, mutationUnit: null, nukeStatus: null }));
let aiData = [{ factionId: 'f1', territoryIds: [2] }];
let playerIds = [1];
let updateLogs = [];
let alienExpansionsThisTurn = 0;
let commanderCooldown = 0;
let solarFlareZones = [];
let solarFlareDuration = 0;
let turnsSinceLastSupply = 0;
let offeredQuest = null;
let activeQuest = null;
let mothershipDefeated = false;

const AI_FACTIONS = [{ id: 'f1', name: 'Faction 1' }];
const QUESTS = [];

const setTurn = (cb) => { turn = cb(turn); };
const setActedRegions = () => {};
const setCommanderCooldown = () => {};
const setSolarFlareZones = () => {};
const setSolarFlareDuration = () => {};
const setTurnsSinceLastSupply = () => {};
const setOfferedQuest = () => {};
const setActiveQuest = () => {};
const setPlayerIds = () => {};
const setAiData = () => {};
const setTerritories = () => {};

const getEffectiveMilitary = (node) => {
  if (node.isOccupied) return Math.floor(node.military * 1.5)
  return node.military
}

import React, { useState } from 'react'
import { TransformWrapper, TransformComponent } from 'react-zoom-pan-pinch'
import { CountryInfoPanel } from './components/CountryInfoPanel'
import { InteractiveMap } from './components/InteractiveMap'
import { EventLogPanel } from './components/EventLogPanel'
import { ActionModal } from './components/ActionModal'
import { GameIntroModal } from './components/GameIntroModal'
import { GameOverModal } from './components/GameOverModal'
import { TutorialInstructorPanel } from './components/TutorialInstructorPanel'
import { generateWorldMap } from './mapData'
import { useLanguage } from './LanguageContext'
import { CommanderSelectionModal } from './components/CommanderSelectionModal'
import { CommanderSkillPanel } from './components/CommanderSkillPanel'
import { QuestPanel } from './components/QuestPanel'
import { COMMANDERS } from './commandersData'
import { QUESTS } from './questsData'

const getAiFactions = (t) => [
  { id: 'AI-1', colorClass: 'text-blue-400', name: t('BLUE_CORSAIR') },
  { id: 'AI-2', colorClass: 'text-yellow-400', name: t('YELLOW_SWARM') },
  { id: 'AI-3', colorClass: 'text-pink-400', name: t('PINK_SYNDICATE') },
  { id: 'AI-4', colorClass: 'text-cyan-400', name: t('CYAN_DOMINION') },
  { id: 'AI-5', colorClass: 'text-orange-400', name: t('ORANGE_VANGUARD') },
]

const SAVE_KEY = 'pixel_space_invasion_save'

const getEffectiveMilitary = (country) => {
  if (country.isOccupied && country.mutationUnit === 'HEAVILY ARMORED MECHA ALIEN') {
    return Math.floor(country.military * 1.5)
  }
  return country.military
}
function App() {
  const { t, lang, toggleLanguage } = useLanguage()
  const AI_FACTIONS = getAiFactions(t)

  const initialSave = React.useMemo(() => {
    try {
      const saved = localStorage.getItem(SAVE_KEY)
      if (saved) return JSON.parse(saved)
    } catch (e) { console.error('Error loading save game', e) }
    return null
  }, [])

  const [gameState, setGameState] = useState(initialSave?.gameState || 'INTRO') // INTRO, SELECT_START, PLAYING, GAME_OVER
  const [territories, setTerritories] = useState(initialSave?.territories || generateWorldMap())
  const [selectedCountryId, setSelectedCountryId] = useState(null)

  const selectedCountry = territories.find(t => t.id === selectedCountryId) || null

  const [playerIds, setPlayerIds] = useState(initialSave?.playerIds || [])
  const [aiData, setAiData] = useState(initialSave?.aiData || []) // Array of { factionId, territoryIds: [] }
  const [actedRegions, setActedRegions] = useState(initialSave?.actedRegions || [])
  const [turn, setTurn] = useState(initialSave?.turn || 1)
  const [freeNukes, setFreeNukes] = useState(initialSave?.freeNukes || 0)
  const [supplies, setSupplies] = useState(initialSave?.supplies || 0)
  const [solarFlareZones, setSolarFlareZones] = useState(initialSave?.solarFlareZones || [])
  const [solarFlareDuration, setSolarFlareDuration] = useState(initialSave?.solarFlareDuration || 0)
  const [turnsSinceLastSupply, setTurnsSinceLastSupply] = useState(initialSave?.turnsSinceLastSupply || 0)
  const [tutorialStep, setTutorialStep] = useState(initialSave?.tutorialStep !== undefined ? initialSave.tutorialStep : -1) // -1 means not in tutorial
  const [selectedCommander, setSelectedCommander] = useState(initialSave?.selectedCommander || null)
  const [commanderCooldown, setCommanderCooldown] = useState(initialSave?.commanderCooldown || 0)
  const [commanderTargetMode, setCommanderTargetMode] = useState(false)
  const [offeredQuest, setOfferedQuest] = useState(initialSave?.offeredQuest || null)
  const [activeQuest, setActiveQuest] = useState(initialSave?.activeQuest || null)
  const [mothershipDefeated, setMothershipDefeated] = useState(initialSave?.mothershipDefeated || false)
  const [events, setEvents] = useState(() => {
    return initialSave?.events || [{ timestamp: '00:00', type: 'info', message: t('SYSTEM_INITIALIZED') }]
  })

  const [showActionModal, setShowActionModal] = useState(false)
  const [invasionTargetMode, setInvasionTargetMode] = useState(false)
  const [transferTargetMode, setTransferTargetMode] = useState(false)
  const [nukeTargetMode, setNukeTargetMode] = useState(false)
  const [specialForcesTargetMode, setSpecialForcesTargetMode] = useState(false)
  const [showManual, setShowManual] = useState(false)
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768)

  React.useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768)
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  // Win/Loss Condition Check
  React.useEffect(() => {
    if (gameState === 'PLAYING') {
      if (playerIds.length === 0) {
        setGameState('GAME_OVER_DEFEAT')
        addEvent(t('DEFEAT_DESC'), 'alert')
      } else if (playerIds.length === territories.length) {
        setGameState('GAME_OVER_VICTORY')
        addEvent(t('VICTORY_DESC'), 'alert')
      }
    }
  }, [playerIds, territories, gameState, t])

  // Auto-Save Effect
  React.useEffect(() => {
    if (gameState === 'PLAYING') {
      const saveData = {
        gameState,
        territories,
        playerIds,
        aiData,
        actedRegions,
        turn,
        events,
        freeNukes,
        supplies,
        solarFlareZones,
        solarFlareDuration,
        turnsSinceLastSupply,
        tutorialStep,
        selectedCommander,
        commanderCooldown,
        offeredQuest,
        activeQuest,
        mothershipDefeated
      }
      localStorage.setItem(SAVE_KEY, JSON.stringify(saveData))
    } else if (gameState === 'GAME_OVER_VICTORY' || gameState === 'GAME_OVER_DEFEAT') {
      localStorage.removeItem(SAVE_KEY)
    }
  }, [gameState, territories, playerIds, aiData, actedRegions, turn, events])

  const handleRestartGame = () => {
    localStorage.removeItem(SAVE_KEY)
    setTerritories(generateWorldMap())
    setPlayerIds([])
    setAiData([])
    setActedRegions([])
    setTurn(1)
    setFreeNukes(0)
    setSupplies(0)
    setSolarFlareZones([])
    setSolarFlareDuration(0)
    setTurnsSinceLastSupply(0)
    setSelectedCommander(null)
    setCommanderCooldown(0)
    setCommanderTargetMode(false)
    setOfferedQuest(null)
    setActiveQuest(null)
    setMothershipDefeated(false)
    setEvents([{ timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }), type: 'info', message: t('SYSTEM_INITIALIZED') }])
    setSelectedCountryId(null)
    setInvasionTargetMode(false)
    setTransferTargetMode(false)
    setNukeTargetMode(false)
    setSpecialForcesTargetMode(false)
    setShowActionModal(false)
    setTutorialStep(-1)
    setGameState('INTRO')
  }

  const handleStartTutorial = () => {
    handleRestartGame()
    setShowManual(false)
    setGameState('SELECT_START') // Skip Intro Modal
    setTutorialStep(0) // Step 0 is the welcome dialog before doing anything
  }

  const handleManualRestart = () => {
    if (window.confirm(t('CONFIRM_RESTART'))) {
      handleRestartGame()
    }
  }

  const addEvent = (message, type = 'info') => {
    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
    setEvents(prev => [...prev, { timestamp, type, message }])
  }

  const handleSelect = (country) => {
    if (tutorialStep > -1) {
      if (tutorialStep === 1 && gameState === 'SELECT_START') {
        if (country.id !== 23) return; // London
        setTutorialStep(2);
      }
      else if (tutorialStep === 3 && invasionTargetMode) {
        if (country.id !== 24) return; // Paris
      }
      else if (tutorialStep === 7 && invasionTargetMode) {
        if (country.id !== 26) return; // Madrid
      }
      else if (tutorialStep === 9 && transferTargetMode) {
        if (country.id !== 23) return; // London
      }
      else {
        // Block other selections
        if (tutorialStep === 2 && country.id !== 23) return;
        if (tutorialStep === 4 && country.id !== 24) return;
        if (tutorialStep === 6 && country.id !== 23) return; // Force London
        if (tutorialStep === 8 && country.id !== 26) return;
        if (tutorialStep === 9 && !transferTargetMode && country.id !== 26) return;
      }
    }

    if (commanderTargetMode) {
      if (commanderTargetMode === country.id) {
        setCommanderTargetMode(false)
        return
      }
      handleCommanderSkillTarget(country)
      return
    }

    if (gameState === 'SELECT_START') {
      const newTerritories = [...territories]

      // Starter Buff
      const startNodeIdx = newTerritories.findIndex(node => node.id === country.id)
      newTerritories[startNodeIdx] = { ...newTerritories[startNodeIdx], military: 60, tech: 40, oil: 40 }

      setPlayerIds([country.id])

      const getDistance = (n1, n2) => Math.sqrt(Math.pow(n1.x - n2.x, 2) + Math.pow(n1.y - n2.y, 2))

      let capitals = [country] // Track placed capitals to maintain distance
      let availableNodes = newTerritories.filter(t => t.id !== country.id)

      const aiInitData = AI_FACTIONS.map((faction) => {
        let buffer = 22 // Desired minimum distance units
        let selectedNode = null

        // Iteratively try to find a node that respects the buffer from all existing capitals
        while (buffer > 5 && !selectedNode) {
          const candidates = availableNodes.filter(n =>
            capitals.every(cap => getDistance(n, cap) >= buffer)
          )
          if (candidates.length > 0) {
            selectedNode = candidates[Math.floor(Math.random() * candidates.length)]
          } else {
            buffer -= 3 // Relax constraints
          }
        }

        // Fallback to random if strict spacing fails
        if (!selectedNode) selectedNode = availableNodes[Math.floor(Math.random() * availableNodes.length)]

        // Mark as capital and remove from pool
        capitals.push(selectedNode)
        availableNodes = availableNodes.filter(n => n.id !== selectedNode.id)

        const targetNodeIdx = newTerritories.findIndex(t => t.id === selectedNode.id)
        newTerritories[targetNodeIdx] = { ...newTerritories[targetNodeIdx], military: 60, tech: 40, oil: 40 }

        return {
          factionId: faction.id,
          territoryIds: [selectedNode.id]
        }
      })

      setTerritories(newTerritories)
      setAiData(aiInitData)
      setGameState('PLAYING')
      setSelectedCountryId(country.id)
      addEvent(t('COMMAND_ESTABLISHED', { name: t(country.name) }), 'alert')
      addEvent(t('RESOURCES_ALLOCATED'))
      return
    }

    if (invasionTargetMode) {
      if (invasionTargetMode === country.id) {
        setInvasionTargetMode(false)
        setShowActionModal(true)
        return
      }
      handlePlayerInvasion(country)
      return
    }

    if (transferTargetMode) {
      if (transferTargetMode === country.id) {
        setTransferTargetMode(false)
        setShowActionModal(true)
        return
      }
      handlePlayerTransfer(country)
      return
    }

    if (nukeTargetMode) {
      if (nukeTargetMode === country.id) {
        setNukeTargetMode(false)
        setShowActionModal(true)
        return
      }
      handleNukeLaunch(country)
      return
    }

    if (specialForcesTargetMode) {
      if (playerIds.includes(country.id)) {
        addEvent(t('TARGET_MUST_BE_ENEMY'), 'alert')
        return
      }
      if (supplies < 15) {
        addEvent(t('INSUFFICIENT_SUPPLIES'), 'alert')
        setSpecialForcesTargetMode(false)
        return
      }
      setSupplies(prev => prev - 15)
      setTerritories(prev => prev.map(t => 
        t.id === country.id ? { ...t, military: Math.floor(t.military / 2) } : t
      ))
      setSpecialForcesTargetMode(false)
      addEvent(t('SPECIAL_FORCES_SUCCESS', { name: t(country.name) }), 'alert')
      return
    }

    setSelectedCountryId(country.id)
  }

  const executeProtocolClick = (actionType) => {
    if (tutorialStep === 5 || tutorialStep === 8 || tutorialStep === 10) return;

    if (playerIds.includes(selectedCountry?.id) && !actedRegions.includes(selectedCountry?.id)) {
      // Cancel targeting mode if active
      if (invasionTargetMode === selectedCountry?.id) { setInvasionTargetMode(false); setShowActionModal(true); return; }
      if (transferTargetMode === selectedCountry?.id) { setTransferTargetMode(false); setShowActionModal(true); return; }
      if (nukeTargetMode === selectedCountry?.id) { setNukeTargetMode(false); setShowActionModal(true); return; }
      if (specialForcesTargetMode) { setSpecialForcesTargetMode(false); return; }

      if (actionType && typeof actionType === 'string') {
        handlePlayerAction(actionType)
      } else {
        setShowActionModal(true)
      }
    }
  }

  const handlePlayerAction = (actionType) => {
    if (tutorialStep > -1) {
      if (tutorialStep === 2 && actionType === 'INVADE') setTutorialStep(3);
      else if (tutorialStep === 4 && actionType === 'TECH') setTutorialStep(5);
      else if (tutorialStep === 6 && actionType === 'MILITARY') setTutorialStep(7);
      else if (tutorialStep === 7 && actionType === 'INVADE') {} // allowed
      else if (tutorialStep === 9 && actionType === 'TRANSFER') {} // allowed
      else return; // block others
    }

    setShowActionModal(false)
    const pCountry = territories.find(t => t.id === selectedCountry.id)

    if (actionType === 'TECH') {
      if (pCountry.oil >= 20) {
        const bonus = pCountry.trait === 'TECH-CENTRIC' ? 25 : 15
        setTerritories(prev => prev.map(t => t.id === pCountry.id ? { ...t, oil: t.oil - 20, tech: Math.min(100, t.tech + bonus) } : t))
        setActedRegions(prev => [...prev, pCountry.id])
        addEvent(t('TECH_UPGRADED', { name: t(pCountry.name), bonus }))
      } else addEvent(t('INSUFFICIENT_OIL', { name: t(pCountry.name) }), 'alert')
    }
    else if (actionType === 'MILITARY') {
      if (pCountry.tech >= 20) {
        const bonus = pCountry.trait === 'MILITARY POWERHOUSE' ? 25 : 15
        setTerritories(prev => prev.map(t => t.id === pCountry.id ? { ...t, tech: t.tech - 20, military: Math.min(100, t.military + bonus) } : t))
        setActedRegions(prev => [...prev, pCountry.id])
        addEvent(t('MIL_REINFORCED', { name: t(pCountry.name), bonus }))
      } else addEvent(t('INSUFFICIENT_TECH', { name: t(pCountry.name) }), 'alert')
    }
      else if (actionType === 'INVADE') {
        setInvasionTargetMode(selectedCountry.id) // store which country is invading
        addEvent(t('INVASION_PREP', { name: t(pCountry.name) }), 'alert')
      }
      else if (actionType === 'TRANSFER') {
        setTransferTargetMode(selectedCountry.id)
        addEvent(t('TRANSFER_PREP', { name: t(pCountry.name) }), 'info')
      }
      else if (actionType === 'NUKE_DEV') {
        if (pCountry.military >= 70 && pCountry.tech >= 70) {
          setTerritories(prev => prev.map(t => t.id === pCountry.id ? { ...t, military: t.military - 70, tech: t.tech - 70, nukeStatus: 'DEVELOPING' } : t))
          setActedRegions(prev => [...prev, pCountry.id])
          addEvent(t('NUKE_INIT', { name: t(pCountry.name) }))
        } else {
          addEvent(t('INSUFFICIENT_NUKE'), 'alert')
        }
      }
      else if (actionType === 'NUKE_LAUNCH') {
        setNukeTargetMode(selectedCountry.id)
        addEvent(t('NUKE_PREP'), 'alert')
      }
      else if (actionType === 'FREE_NUKE_LAUNCH') {
        if (freeNukes > 0) {
          setNukeTargetMode(selectedCountry.id)
          addEvent(t('NUKE_PREP'), 'alert')
        }
      }
  }

  const handleCommanderSkillTarget = (target) => {
    const commander = COMMANDERS.find(c => c.id === selectedCommander)
    if (!commander) return

    if (supplies < commander.skillCost) {
      addEvent(t('INSUFFICIENT_SUPPLIES'), 'alert')
      setCommanderTargetMode(false)
      return
    }

    if (selectedCommander === 'skyfall') {
      if (playerIds.includes(target.id)) {
        addEvent(t('TARGET_MUST_BE_ENEMY'), 'alert')
        return
      }
      const playerNeighbors = playerIds.flatMap(id => territories.find(t => t.id === id).neighbors)
      if (playerNeighbors.includes(target.id)) {
        addEvent('MUST BE NON-ADJACENT REGION.', 'alert')
        return
      }
      setSupplies(prev => prev - commander.skillCost)
      setCommanderCooldown(commander.skillCooldown)
      setTerritories(prev => prev.map(t => {
        if (t.id === target.id) {
          if (t.military <= 20) return { ...t, isOccupied: false, military: 20, oilStunTurns: 1 }
          return { ...t, military: Math.floor(t.military / 2), oilStunTurns: 1 }
        }
        return t
      }))
      if (target.military <= 20) {
        setPlayerIds(prev => [...prev, target.id])
        setAiData(prev => prev.map(ai => ({ ...ai, territoryIds: ai.territoryIds.filter(id => id !== target.id) })))
      }
      addEvent(`Commander Skyfall infiltrated ${t(target.name)}!`, 'alert')
      setCommanderTargetMode(false)
    } 
    else if (selectedCommander === 'boom') {
      if (playerIds.includes(target.id)) {
        addEvent(t('TARGET_MUST_BE_ENEMY'), 'alert')
        return
      }
      setSupplies(prev => prev - commander.skillCost)
      setCommanderCooldown(commander.skillCooldown)
      const targets = [target.id, ...target.neighbors]
      setTerritories(prev => prev.map(t => {
        if (targets.includes(t.id) && !playerIds.includes(t.id)) {
          return { ...t, military: Math.max(0, t.military - 40), tech: Math.floor(t.tech * 0.7) }
        }
        return t
      }))
      addEvent(`Dr. Boom struck ${t(target.name)} with an Orbital Strike!`, 'alert')
      setCommanderTargetMode(false)
    }
    else if (selectedCommander === 'iron_wall') {
      if (!playerIds.includes(target.id)) {
        addEvent(t('FRIENDLY_TARGET'), 'alert')
        return
      }
      setSupplies(prev => prev - commander.skillCost)
      setCommanderCooldown(commander.skillCooldown)
      setTerritories(prev => prev.map(t => {
        if (t.id === target.id) return { ...t, shieldTurns: 2 }
        return t
      }))
      addEvent(`General Iron Wall deployed shield at ${t(target.name)}!`, 'alert')
      setCommanderTargetMode(false)
    }
  }

  const handlePlayerInvasion = (target) => {
    const sourceId = invasionTargetMode;
    const source = territories.find(t => t.id === sourceId);

    if (!source) return;

    // 1. Validation Checks
    if (!source.neighbors.includes(target.id)) {
      addEvent(t('OUT_OF_RANGE', { name: t(source.name) }), 'error');
      setInvasionTargetMode(false);
      return;
    }
    
    // 2. Tutorial Progression Check (Only if target is validly adjacent)
    if (tutorialStep > -1) {
      if (tutorialStep === 3 && target.id === 24) {
        setTutorialStep(4);
        setSelectedCountryId(24); // Auto-select for Step 4
      }
      else if (tutorialStep === 7 && target.id === 26) {
        setTutorialStep(8);
        setSelectedCountryId(26); // Auto-select for Step 8/9
      }
      else {
        setInvasionTargetMode(false);
        return; // block incorrect tutorial targets
      }
    }

    setInvasionTargetMode(false);
    const pCountry = source;

    // Mark as acted regardless of win or loss
    setActedRegions(prev => [...prev, sourceId]);

    let pForce = getEffectiveMilitary(pCountry);
    let tForce = getEffectiveMilitary(target);

    // Guaranteed win for tutorial steps to prevent soft-locks
    if (tutorialStep === 3 || tutorialStep === 7) {
      pForce = 100;
      tForce = 0;
    }

    // Psionic Shockwave (Defense)
    if (target.isOccupied && target.mutationUnit === 'PSIONIC ALIEN SPECIALIST') {
      const shockwavePower = Math.floor(target.tech * 0.3);
      pForce = Math.max(0, pForce - shockwavePower);
      addEvent(t('PSIONIC_SHOCKWAVE', { name: t(target.name), power: shockwavePower }), 'alert');
    }

    if (pForce > tForce) {
      // Win - MARGIN OF VICTORY (Proposal 1 refined: 2:1 Ratio Distribution)
      const margin = pForce - tForce;
      const totalAvailable = margin + 15;
      const targetMilitary = Math.floor(totalAvailable / 3);
      const sourceMilitary = totalAvailable - targetMilitary; // Remainder goes to source (approx 2/3)

      setSupplies(prev => prev + 1); // Reward for capturing region

      if (target.hasSupply || (tutorialStep === 7 && target.id === 26)) {
        setSupplies(prev => prev + 15);
        addEvent(t('SUPPLY_RECOVERED'), 'alert');
      }

      let bonusOil = 10;
      let bonusTech = 10;
      if (target.mutationUnit === 'MUTANT_HIVE') {
        setFreeNukes(prev => prev + 1);
        addEvent(t('MUTANT_HIVE_DESTROYED'), 'alert');
        bonusOil = 50;
        bonusTech = 50;
      } else if (target.hasMothership) {
        setFreeNukes(prev => prev + 5);
        addEvent('MOTHERSHIP DESTROYED! ALL ALIEN FORCES CRIPPLED!', 'alert');
        setMothershipDefeated(true);
      }

      setTerritories(prev => prev.map(t => {
        if (t.id === target.id) {
          return { ...t, military: Math.min(100, targetMilitary), isOccupied: false, mutationUnit: null, hasSupply: false, mutationCountdown: null, hasMothership: false };
        }
        if (t.id === pCountry.id) {
          return {
            ...t,
            military: Math.min(100, sourceMilitary),
            oil: Math.min(100, t.oil + bonusOil),
            tech: Math.min(100, t.tech + bonusTech)
          };
        }
        if (target.hasMothership && t.isOccupied) {
          return { ...t, military: 10 };
        }
        return t;
      }));

      setPlayerIds(prev => Array.from(new Set([...prev, target.id])));

      setAiData(prev => prev.map(faction => ({
        ...faction,
        territoryIds: faction.territoryIds.filter(id => id !== target.id)
      })));

      // Check for elimination
      aiData.forEach(faction => {
        if (faction.territoryIds.includes(target.id) && faction.territoryIds.length === 1) {
          const meta = AI_FACTIONS.find(f => f.id === faction.factionId);
          if (meta) addEvent(t('FACTION_ELIMINATED', { name: meta.name }), 'alert');
        }
      });

      addEvent(t('VANGUARD_SECURED', { name: t(target.name), source: t(pCountry.name) }), 'alert');
    } else {
      // Lose
      setTerritories(prev => prev.map(t => {
        if (t.id === pCountry.id) {
          return { ...t, military: Math.max(0, pCountry.military - 30) }
        }
        if (t.id === target.id && target.hasMothership) {
          const newMil = Math.max(0, t.military - pForce);
          if (newMil === 0) {
             setMothershipDefeated(true);
             return { ...t, military: 0, isOccupied: false, mutationUnit: null, hasMothership: false };
          }
          return { ...t, military: newMil };
        }
        if (target.hasMothership && t.isOccupied && target.military - pForce <= 0) {
           return { ...t, military: 10 };
        }
        return t
      }));
      
      if (target.hasMothership) {
        if (target.military - pForce <= 0) {
           addEvent('MOTHERSHIP DESTROYED! ALL ALIEN FORCES CRIPPLED!', 'alert');
        } else {
           addEvent(`모선 장갑 타격 성공! (군사력 -${pForce})`, 'info');
        }
      }
      addEvent(t('INVASION_FAILED', { name: t(target.name) }), 'alert');
    }
  };

  const handlePlayerTransfer = (target) => {
    if (tutorialStep > -1) {
      if (tutorialStep === 9 && target.id === 23) setTutorialStep(10);
      else return;
    }

    const sourceId = transferTargetMode
    setTransferTargetMode(false)

    const source = territories.find(t => t.id === sourceId)

    if (!source.neighbors.includes(target.id)) {
      addEvent(t('OUT_OF_RANGE', { name: t(source.name) }), 'alert')
      return
    }

    if (!playerIds.includes(target.id)) {
      addEvent(t('FRIENDLY_TARGET'), 'alert')
      return
    }

    if (source.military <= 25) {
      addEvent(t('INSUFFICIENT_TROOPS', { name: t(source.name) }), 'alert')
      return
    }

    setActedRegions(prev => [...prev, sourceId])
    setTerritories(prev => prev.map(terr => {
      if (terr.id === sourceId) return { ...terr, military: terr.military - 25 }
      if (terr.id === target.id) return { ...terr, military: Math.min(100, terr.military + 25) }
      return terr
    }))

    addEvent(t('TROOPS_TRANSFERRED', { source: t(source.name), target: t(target.name) }))
  }

  const handleNukeLaunch = (target) => {
    const sourceId = nukeTargetMode
    setNukeTargetMode(false)

    // Deduct free nuke if the source node didn't have a built nuke ready
    const sourceNode = territories.find(t => t.id === sourceId);
    if (sourceNode && sourceNode.nukeStatus !== 'READY') {
      setFreeNukes(prev => prev - 1);
    }

    // Reset target to 0 Neutral (or damage Mothership)
    setTerritories(prev => prev.map(terr => {
      if (terr.id === target.id) {
        if (terr.hasMothership) {
           const newMil = Math.max(0, terr.military - 100);
           if (newMil === 0) {
              setMothershipDefeated(true);
              return { ...terr, military: 0, isOccupied: false, mutationUnit: null, nukeStatus: null, hasMothership: false };
           }
           return { ...terr, military: newMil, nukeStatus: null };
        }
        return {
          ...terr,
          military: 0,
          oil: 0,
          tech: 0,
          isOccupied: false,
          mutationUnit: null,
          nukeStatus: null
        }
      }
      if (terr.id === sourceId) return { ...terr, nukeStatus: null }
      if (target.hasMothership && terr.isOccupied && target.military - 100 <= 0) {
         return { ...terr, military: 10 };
      }
      return terr
    }))

    if (target.hasMothership) {
      if (target.military - 100 <= 0) {
         addEvent('MOTHERSHIP DESTROYED BY NUKE! ALL ALIEN FORCES CRIPPLED!', 'alert');
      } else {
         addEvent(`모선 장갑 핵 타격 성공! (군사력 -100)`, 'info');
      }
    } else {
      addEvent(t('NUCLEAR_NEUTRALIZED', { name: t(target.name) }), 'alert')
    }

    // Check for elimination (Nuke)
    aiData.forEach(faction => {
      if (faction.territoryIds.includes(target.id) && faction.territoryIds.length === 1) {
        const meta = AI_FACTIONS.find(f => f.id === faction.factionId)
        addEvent(t('ELIMINATED_BY_NUKE', { name: meta.name }), 'alert')
      }
    })

    // Event logged above
  }

  const handleBuyItem = (itemType) => {
    if (tutorialStep > -1) {
      if (tutorialStep === 8 && itemType === 'RESOURCE') setTutorialStep(9);
      else return; // block
    }

    if (!selectedCountry) return;
    
    // Nuke doesn't strictly need a player-owned region selected to buy, but to be consistent or just allow it:
    if (itemType === 'NUKE') {
      if (supplies >= 30) {
        setSupplies(prev => prev - 30)
        setFreeNukes(prev => prev + 1)
        addEvent(t('ITEM_BOUGHT_NUKE'), 'info')
      } else {
        addEvent(t('INSUFFICIENT_SUPPLIES'), 'alert')
      }
      return;
    }

    if (itemType === 'SPECIAL_FORCES') {
      if (supplies >= 15) {
        setSpecialForcesTargetMode(true)
        addEvent(t('SPECIAL_FORCES_PREP'), 'info')
      } else {
        addEvent(t('INSUFFICIENT_SUPPLIES'), 'alert')
      }
      return;
    }

    if (!playerIds.includes(selectedCountry.id) || selectedCountry.isOccupied) {
      addEvent(t('MUST_SELECT_OWNED_REGION'), 'alert')
      return;
    }

    if (itemType === 'MILITARY') {
      if (supplies >= 10) {
        setSupplies(prev => prev - 10)
        setTerritories(prev => prev.map(t => 
          t.id === selectedCountry.id 
            ? { ...t, military: Math.min(100, t.military + 30) } 
            : t
        ))
        addEvent(t('ITEM_BOUGHT_MILITARY', { name: t(selectedCountry.name) }), 'info')
      } else {
        addEvent(t('INSUFFICIENT_SUPPLIES'), 'alert')
      }
    } else if (itemType === 'RESOURCE') {
      if (supplies >= 10) {
        setSupplies(prev => prev - 10)
        setTerritories(prev => prev.map(t => 
          t.id === selectedCountry.id 
            ? { ...t, oil: Math.min(100, t.oil + 30), tech: Math.min(100, t.tech + 30) } 
            : t
        ))
        addEvent(t('ITEM_BOUGHT_RESOURCE', { name: t(selectedCountry.name) }), 'info')
      } else {
        addEvent(t('INSUFFICIENT_SUPPLIES'), 'alert')
      }
    }
  }

  

console.log("Running handleNextTurn...");
try {
  handleNextTurn();
  console.log("Success! No crash.");
} catch(e) {
  console.log("CRASHED:", e);
}
