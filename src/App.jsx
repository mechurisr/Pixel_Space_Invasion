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
        tutorialStep
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

      if (target.hasSupply) {
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
      }

      setTerritories(prev => prev.map(t => {
        if (t.id === target.id) {
          return { ...t, military: Math.min(100, targetMilitary), isOccupied: false, mutationUnit: null, hasSupply: false, mutationCountdown: null };
        }
        if (t.id === pCountry.id) {
          return {
            ...t,
            military: Math.min(100, sourceMilitary),
            oil: Math.min(100, t.oil + bonusOil),
            tech: Math.min(100, t.tech + bonusTech)
          };
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
      setTerritories(prev => prev.map(t => t.id === pCountry.id ? { ...t, military: Math.max(0, pCountry.military - 30) } : t));
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

    // Reset target to 0 Neutral
    setTerritories(prev => prev.map(terr => {
      if (terr.id === target.id) {
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
      return terr
    }))

    // Check for elimination (Nuke)
    aiData.forEach(faction => {
      if (faction.territoryIds.includes(target.id) && faction.territoryIds.length === 1) {
        const meta = AI_FACTIONS.find(f => f.id === faction.factionId)
        addEvent(t('ELIMINATED_BY_NUKE', { name: meta.name }), 'alert')
      }
    })

    addEvent(t('NUCLEAR_NEUTRALIZED', { name: t(target.name) }), 'alert')
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

  const handleNextTurn = () => {
    if (tutorialStep > -1) {
      if (tutorialStep === 5) setTutorialStep(6);
      else return;
    }

    setTurn(t => t + 1)
    setActedRegions([])
    let updateLogs = []
    let alienExpansionsThisTurn = 0 // Track total expansions per turn

    // Copy states for processing
    let newTerritories = [...territories].map(terr => {
      const passiveOil = terr.trait === 'RESOURCE-RICH'
        ? Math.floor(Math.random() * 11) + 5 // 5-15 oil
        : Math.floor(Math.random() * 10) // 0-9 oil

      // Update Nuke Status: DEVELOPING -> READY
      const nextNukeStatus = terr.nukeStatus === 'DEVELOPING' ? 'READY' : terr.nukeStatus
      if (terr.nukeStatus === 'DEVELOPING') updateLogs.push(t('NUKE_READY', { name: t(terr.name) }))

      let nextHasSupply = terr.hasSupply;
      if (tutorialStep === 5 && terr.id === 26) {
        nextHasSupply = true;
      }

      return { ...terr, oil: Math.min(100, terr.oil + passiveOil), nukeStatus: nextNukeStatus, hasSupply: nextHasSupply }
    })
    let newAiData = JSON.parse(JSON.stringify(aiData))
    let newPlayerIds = [...playerIds]

    // AI logic per faction per territory
    newAiData.forEach(faction => {
      const factionMetadata = AI_FACTIONS.find(f => f.id === faction.factionId)
      const currentTerritoryIds = [...faction.territoryIds] // Copy because it might change during iteration

      currentTerritoryIds.forEach(tId => {
        const tIndex = newTerritories.findIndex(terr => terr.id === tId)
        if (tIndex === -1) return
        let terr = newTerritories[tIndex]

        // FIX: Ensure this faction actually still owns this territory (prevent ghosting)
        const isStillOwned = faction.territoryIds.includes(terr.id)
        const isPlayerOwned = newPlayerIds.includes(terr.id)
        if (isPlayerOwned || terr.isOccupied) {
          // This territory was lost to player or alien, cleanup faction data
          faction.territoryIds = faction.territoryIds.filter(id => id !== terr.id)
          return
        }

        // Decide action: Aggressive expansion prioritized if strong enough
        const validNeighbors = terr.neighbors.filter(nId => !faction.territoryIds.includes(nId))
        let targetAcquired = null

        let currentTForce = getEffectiveMilitary(terr)

        if (validNeighbors.length > 0 && currentTForce > 40) {
          // Find weakest neighbor we can confidently beat
          const vulnerableNeighbors = validNeighbors
            .map(nId => newTerritories.find(x => x.id === nId))
            .filter(n => {
              let nForce = getEffectiveMilitary(n)
              let attackerForce = currentTForce
              if (n.isOccupied && n.mutationUnit === 'PSIONIC ALIEN SPECIALIST') {
                attackerForce -= Math.floor(n.tech * 0.3)
              }
              return attackerForce > (nForce + 10)
            })
            .sort((a, b) => getEffectiveMilitary(a) - getEffectiveMilitary(b))

          if (vulnerableNeighbors.length > 0) {
            targetAcquired = vulnerableNeighbors[0]
          }
        }

        if (targetAcquired) {
          // Attempt Invasion
          const targetIndex = newTerritories.findIndex(x => x.id === targetAcquired.id)
          let target = newTerritories[targetIndex]

          let nForce = getEffectiveMilitary(target)

          // AI Wins - 2:1 Ratio Distribution
          const margin = currentTForce - nForce;
          const totalAvailable = margin + 15;
          const targetMilitary = Math.floor(totalAvailable / 3);
          const sourceMilitary = totalAvailable - targetMilitary;

          newTerritories[targetIndex].military = Math.min(100, targetMilitary);
          newTerritories[targetIndex].isOccupied = false;
          newTerritories[targetIndex].mutationUnit = null;

          newTerritories[tIndex].military = Math.min(100, sourceMilitary);

          // Claim territory
          faction.territoryIds.push(target.id)

          // Remove from previous owner (Player or other AI)
          newPlayerIds = newPlayerIds.filter(id => id !== target.id)
          newAiData.forEach(otherAi => {
            if (otherAi.factionId !== faction.factionId) {
              if (otherAi.territoryIds.includes(target.id) && otherAi.territoryIds.length === 1) {
                const otherMeta = AI_FACTIONS.find(f => f.id === otherAi.factionId)
                updateLogs.push(t('FACTION_ELIMINATED', { name: otherMeta.name }))
              }
              otherAi.territoryIds = otherAi.territoryIds.filter(id => id !== target.id)
            }
          })

          updateLogs.push(t('AI_SECURED', { name: factionMetadata.name, target: t(target.name) }))
        } else if (terr.oil >= 20 && terr.tech < 80) {
          // Upgrade Tech
          const bonus = terr.trait === 'TECH-CENTRIC' ? 25 : 15
          newTerritories[tIndex].oil -= 20
          newTerritories[tIndex].tech = Math.min(100, terr.tech + bonus)
        } else if (terr.tech >= 20) {
          // Upgrade Military
          const bonus = terr.trait === 'MILITARY POWERHOUSE' ? 25 : 15
          newTerritories[tIndex].tech -= 20
          newTerritories[tIndex].military = Math.min(100, terr.military + bonus)
        }

        const weakFriendly = terr.neighbors
          .map(nId => newTerritories.find(x => x.id === nId))
          .filter(n => faction.territoryIds.includes(n.id) && n.military < 50)
          .sort((a, b) => a.military - b.military)

        if (weakFriendly.length > 0 && terr.military > 50) {
          const targetId = weakFriendly[0].id
          newTerritories[tIndex].military -= 25
          const targetIdx = newTerritories.findIndex(x => x.id === targetId)
          newTerritories[targetIdx].military = Math.min(100, newTerritories[targetIdx].military + 25)
          updateLogs.push(t('AI_REDEPLOYED', { name: factionMetadata.name, target: t(weakFriendly[0].name) }))
        }

        // AI Nuclear Strategy
        if (terr.nukeStatus === 'READY') {
          // Find strongest player or alien territory to target
          const potentialTargets = newTerritories.filter(target =>
            !faction.territoryIds.includes(target.id) && (target.military > 60 || target.isOccupied)
          ).sort((a, b) => (b.military + b.tech) - (a.military + a.tech))

          if (potentialTargets.length > 0) {
            const target = potentialTargets[0]
            const targetIdx = newTerritories.findIndex(x => x.id === target.id)
            // WIPE TARGET
            newTerritories[targetIdx] = { ...newTerritories[targetIdx], military: 0, oil: 0, tech: 0, isOccupied: false, mutationUnit: null, nukeStatus: null }
            newTerritories[tIndex].nukeStatus = null
            // Sync owner data
            newPlayerIds = newPlayerIds.filter(id => id !== target.id)
            newAiData.forEach(otherAi => {
              otherAi.territoryIds = otherAi.territoryIds.filter(id => id !== target.id)
            })
            updateLogs.push(t('AI_NUKE', { name: factionMetadata.name, target: t(target.name) }))
          }
        }
      })
    })

    // Alien Logic per territory
    const alienTerritories = newTerritories.filter(terr => terr.isOccupied)

    alienTerritories.forEach(aTerritory => {
      const aIndex = newTerritories.findIndex(terr => terr.id === aTerritory.id)
      let terr = newTerritories[aIndex]

      if (terr.mutationUnit === 'MUTANT_HIVE') {
        if (terr.mutationCountdown > 0) {
          newTerritories[aIndex].mutationCountdown = terr.mutationCountdown - 1;
          if (newTerritories[aIndex].mutationCountdown === 0) {
            updateLogs.push(t('MUTANT_HIVE_ERUPTION', { name: t(terr.name) }));
            terr.neighbors.forEach(nId => {
              const nIdx = newTerritories.findIndex(nt => nt.id === nId);
              if (nIdx !== -1 && !newTerritories[nIdx].isOccupied) {
                newTerritories[nIdx] = {
                  ...newTerritories[nIdx],
                  isOccupied: true,
                  mutationUnit: null,
                  military: 50,
                  oil: 0,
                  tech: 0
                };
                newPlayerIds = newPlayerIds.filter(id => id !== nId);
                newAiData.forEach(otherAi => {
                  otherAi.territoryIds = otherAi.territoryIds.filter(id => id !== nId);
                });
              }
            });
            newTerritories[aIndex].mutationUnit = 'HEAVILY ARMORED MECHA ALIEN';
            newTerritories[aIndex].mutationCountdown = null;
          } else {
            updateLogs.push(t('MUTANT_HIVE_TICK', { name: t(terr.name), count: newTerritories[aIndex].mutationCountdown }));
          }
        }
      } else if (terr.mutationUnit === 'GIANT RESOURCE HARVESTER') {
        // Harvest 10 oil (Reduced from 20)
        newTerritories[aIndex].oil = Math.min(100, terr.oil + 10)
        // Spawn troops if oil >= 80
        if (newTerritories[aIndex].oil >= 80 && newTerritories[aIndex].military < 100) {
          newTerritories[aIndex].oil -= 80
          newTerritories[aIndex].military = Math.min(100, terr.military + 25) // Reduced from 50
          updateLogs.push(t('HIVE_SPAWNED', { name: t(terr.name) }))
        }
      } else {
        // Standard Aliens (Psionic, Mecha) just slowly gain military/tech
        newTerritories[aIndex].military = Math.min(100, terr.military + 5)
        if (terr.mutationUnit === 'PSIONIC ALIEN SPECIALIST') {
          newTerritories[aIndex].tech = Math.min(100, terr.tech + 5)
        }
      }

      // Alien Ultimate Weapon: Singularity Spore
      if (terr.tech === 100 && Math.random() > 0.5) {
        const potentialHumanTargets = terr.neighbors
          .map(nId => newTerritories.find(x => x.id === nId))
          .filter(n => !n.isOccupied)
          .sort((a, b) => b.military - a.military)

        if (potentialHumanTargets.length > 0) {
          const target = potentialHumanTargets[0]
          const tIdx = newTerritories.findIndex(x => x.id === target.id)
          
          let targetMutation = terr.mutationUnit;
          if (targetMutation === 'MUTANT_HIVE') {
            const standardMutations = ['HEAVILY ARMORED MECHA ALIEN', 'PSIONIC ALIEN SPECIALIST', 'GIANT RESOURCE HARVESTER'];
            targetMutation = standardMutations[Math.floor(Math.random() * standardMutations.length)];
          }

          newTerritories[tIdx] = { ...newTerritories[tIdx], isOccupied: true, mutationUnit: targetMutation, military: 50, oil: 0, tech: 0 }

          // Sync owner cleanup
          newPlayerIds = newPlayerIds.filter(id => id !== target.id)
          newAiData.forEach(otherAi => {
            otherAi.territoryIds = otherAi.territoryIds.filter(id => id !== target.id)
          })

          updateLogs.push(t('SINGULARITY_SPORE', { source: t(terr.name), target: t(target.name) }))
          newTerritories[aIndex].tech = 0 // Reset after use
        }
      }

      // Aggressive Alien Expansion!
      // GLOBAL LIMIT: Aliens as a whole can only expand a maximum of 3 times per turn
      if (alienExpansionsThisTurn >= 3) return

      const validNeighbors = terr.neighbors.filter(nId => !newTerritories.find(x => x.id === nId).isOccupied) // Aliens don't attack aliens
      let aForce = getEffectiveMilitary(newTerritories[aIndex]) // recalculate after buff

      // Lowered threshold so aliens attack more frequently (if force > 40)
      if (validNeighbors.length > 0 && aForce > 40) {
        // Find weak neighbor
        const vulnerableNeighbors = validNeighbors
          .map(nId => newTerritories.find(x => x.id === nId))
          .filter(n => {
            let nForce = getEffectiveMilitary(n)
            let attackerForce = aForce
            // Apply Psionic Shockwave (Attack)
            if (terr.mutationUnit === 'PSIONIC ALIEN SPECIALIST') nForce = Math.max(0, nForce - Math.floor(terr.tech * 0.3))
            return attackerForce > (nForce + 30)  // Increased threshold from 10 to 30
          })
          .sort((a, b) => getEffectiveMilitary(a) - getEffectiveMilitary(b))

        if (vulnerableNeighbors.length > 0) {
          const target = vulnerableNeighbors[0]
          const targetIndex = newTerritories.findIndex(x => x.id === target.id)
          let nForce = getEffectiveMilitary(target)
          if (terr.mutationUnit === 'PSIONIC ALIEN SPECIALIST') nForce = Math.max(0, nForce - Math.floor(terr.tech * 0.3))

          // Alien Wins Expansion - Hive Resonance!
          // Newly infected territories start with 20 military + small bonus from attacker
          const leftoverAttacker = Math.max(0, newTerritories[aIndex].military - Math.floor(nForce / 2))
          newTerritories[targetIndex].military = 20 + Math.floor(leftoverAttacker * 0.1)
          newTerritories[targetIndex].isOccupied = true
          
          let targetMutation = terr.mutationUnit;
          if (targetMutation === 'MUTANT_HIVE') {
            const standardMutations = ['HEAVILY ARMORED MECHA ALIEN', 'PSIONIC ALIEN SPECIALIST', 'GIANT RESOURCE HARVESTER'];
            targetMutation = standardMutations[Math.floor(Math.random() * standardMutations.length)];
          }
          newTerritories[targetIndex].mutationUnit = targetMutation; // Prevent Hive cloning

          // HIVE EXHAUSTION: The attacking hive pushes itself to the limit and loses 50% of its remaining force
          newTerritories[aIndex].military = Math.floor(leftoverAttacker * 0.5)
          alienExpansionsThisTurn++

          // HIVE RESONANCE: All existing adjacent alien neighbors gain +2 military
          target.neighbors.forEach(nId => {
            const nIdx = newTerritories.findIndex(nt => nt.id === nId)
            if (nIdx !== -1 && newTerritories[nIdx].isOccupied && nId !== target.id) {
              newTerritories[nIdx].military = Math.min(100, newTerritories[nIdx].military + 2)
            }
          })

          // Remove from previous owner (Player or AI)
          newPlayerIds = newPlayerIds.filter(id => id !== target.id)
          newAiData.forEach(otherAi => {
            if (otherAi.territoryIds.includes(target.id) && otherAi.territoryIds.length === 1) {
              const otherMeta = AI_FACTIONS.find(f => f.id === otherAi.factionId)
              updateLogs.push(t('FACTION_ELIMINATED', { name: otherMeta.name }))
            }
            otherAi.territoryIds = otherAi.territoryIds.filter(id => id !== target.id)
          })

          updateLogs.push(t('INFECTION_CONSUMED', { source: t(terr.name), target: t(target.name) }))
        }
      }
    })

    // Periodic Alien Invasion Event (Every 5 turns starting from Turn 2: 2, 7, 12, 17...)
    const nextTurn = turn + 1
    if (nextTurn >= 2 && (nextTurn - 2) % 5 === 0) {
      const allOwnedIds = [...newPlayerIds, ...newAiData.flatMap(f => f.territoryIds)]
      const unOccupied = newTerritories.filter(node => !node.isOccupied && !allOwnedIds.includes(node.id))

      if (unOccupied.length > 0) {
        // Spawn up to 2 aliens during a wave to be threatening
        const spawnCount = Math.min(2, unOccupied.length)
        for (let i = 0; i < spawnCount; i++) {
          const availableTargets = newTerritories.filter(node => !node.isOccupied && !allOwnedIds.includes(node.id))
          if (availableTargets.length === 0) break;

          const target = availableTargets[Math.floor(Math.random() * availableTargets.length)]
          let mut = target.trait === 'TECH-CENTRIC' ? 'PSIONIC ALIEN SPECIALIST' :
            target.trait === 'RESOURCE-RICH' ? 'GIANT RESOURCE HARVESTER' : 'HEAVILY ARMORED MECHA ALIEN'

          const tIdx = newTerritories.findIndex(node => node.id === target.id)
          // Give them a starting military boost so they don't die instantly
          newTerritories[tIdx] = { ...newTerritories[tIdx], isOccupied: true, mutationUnit: mut, military: Math.max(50, target.military) }
          updateLogs.push(t('ALIEN_SPAWNED', { name: t(target.name), mut: t(mut) }))
        }
      }
    }

    // Mutant Hive Event (Guaranteed on Turn 15, then 15% chance, max 3 hives globally)
    const mutantHiveCount = newTerritories.filter(t => t.mutationUnit === 'MUTANT_HIVE').length;
    if (mutantHiveCount < 3 && nextTurn >= 15) {
      const shouldSpawnHive = (nextTurn === 15) || (Math.random() < 0.15);
      if (shouldSpawnHive) {
        const alienNodes = newTerritories.filter(n => n.isOccupied && n.mutationUnit !== 'MUTANT_HIVE');
        if (alienNodes.length > 0) {
          const target = alienNodes[Math.floor(Math.random() * alienNodes.length)];
          const tIdx = newTerritories.findIndex(n => n.id === target.id);
          newTerritories[tIdx].mutationUnit = 'MUTANT_HIVE';
          newTerritories[tIdx].mutationCountdown = 3;
          newTerritories[tIdx].military = Math.min(100, newTerritories[tIdx].military + 50);
          updateLogs.push(t('MUTANT_HIVE_SPAWNED', { name: t(target.name) }));
        }
      }
    }

    // Supply Drop Event (20% chance, or guaranteed at 10 turns)
    const shouldDropSupply = Math.random() < 0.20 || turnsSinceLastSupply >= 9;

    if (shouldDropSupply) {
      // Find nodes up to 2 hops away from player
      let reachableIds = new Set();
      newPlayerIds.forEach(pId => {
        const pNode = newTerritories.find(n => n.id === pId);
        if (pNode) {
          pNode.neighbors.forEach(nId => {
            reachableIds.add(nId);
            const nNode = newTerritories.find(n => n.id === nId);
            if (nNode) nNode.neighbors.forEach(nnId => reachableIds.add(nnId));
          });
        }
      });

      let supplyTargets = newTerritories.filter(node => 
        !newPlayerIds.includes(node.id) && 
        !node.hasSupply && 
        reachableIds.has(node.id)
      );

      // Fallback to any valid node if nothing within 2 hops
      if (supplyTargets.length === 0) {
        supplyTargets = newTerritories.filter(node => !newPlayerIds.includes(node.id) && !node.hasSupply);
      }

      if (supplyTargets.length > 0) {
        const target = supplyTargets[Math.floor(Math.random() * supplyTargets.length)];
        const tIdx = newTerritories.findIndex(node => node.id === target.id);
        newTerritories[tIdx].hasSupply = true;
        updateLogs.push(t('SUPPLY_DROP_DETECTED', { name: t(target.name) }));
        setTurnsSinceLastSupply(0);
      } else {
        setTurnsSinceLastSupply(t => t + 1);
      }
    } else {
      setTurnsSinceLastSupply(t => t + 1);
    }

    // Solar Flare Event (10% chance after turn 10)
    let sfZones = [...solarFlareZones];
    let sfDuration = solarFlareDuration;

    if (sfDuration > 0) {
      sfDuration -= 1;
      if (sfDuration === 0) {
        sfZones = [];
        updateLogs.push(t('SOLAR_FLARE_ENDED'));
      }
    }

    if (sfDuration === 0 && nextTurn >= 10 && Math.random() < 0.10) {
      // Find frontline regions: player owned, has at least one non-player neighbor
      const frontlines = newTerritories.filter(t => 
        newPlayerIds.includes(t.id) && t.neighbors.some(nId => !newPlayerIds.includes(nId))
      );
      if (frontlines.length > 0) {
        const center = frontlines[Math.floor(Math.random() * frontlines.length)];
        // Pick center + up to 3 random neighbors
        const neighborCandidates = [...center.neighbors].sort(() => 0.5 - Math.random());
        const selectedNeighbors = neighborCandidates.slice(0, 3);
        sfZones = [center.id, ...selectedNeighbors];
        sfDuration = 2; // Lasts 2 turns
        updateLogs.push(t('SOLAR_FLARE_STARTED'));
      }
    }

    setSolarFlareZones(sfZones);
    setSolarFlareDuration(sfDuration);

    setPlayerIds(newPlayerIds)
    setAiData(newAiData)
    setTerritories(newTerritories)

    updateLogs.forEach(log => addEvent(log, 'alert'))
    if (updateLogs.length === 0) addEvent(t('TURN_BEGUN', { turn: turn + 1 }))
  }

  return (
    <div className="h-screen w-full bg-pixel-bg p-4 flex flex-col gap-4 font-pixel select-none relative">
      <TutorialInstructorPanel 
        step={tutorialStep} 
        onNextStep={() => {
          if (tutorialStep === 0) setTutorialStep(1);
          if (tutorialStep === 10) handleRestartGame(); // Ends tutorial and goes back to intro
        }} 
      />

      {gameState === 'INTRO' && (
        <GameIntroModal onStart={() => setGameState('SELECT_START')} onStartTutorial={handleStartTutorial} />
      )}

      {showManual && gameState !== 'INTRO' && (
        <GameIntroModal onStart={() => setShowManual(false)} isManual={true} onStartTutorial={handleStartTutorial} />
      )}
      
      {gameState === 'GAME_OVER_VICTORY' && (
        <GameOverModal result="VICTORY" onRestart={handleRestartGame} />
      )}

      {gameState === 'GAME_OVER_DEFEAT' && (
        <GameOverModal result="DEFEAT" onRestart={handleRestartGame} />
      )}
      
      {showActionModal && selectedCountry && (
        <ActionModal
          country={selectedCountry}
          onAction={handlePlayerAction}
          onClose={() => setShowActionModal(false)}
          freeNukes={freeNukes}
          tutorialStep={tutorialStep}
        />
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b-4 border-pixel-border pb-2 gap-2">
        <div className="flex flex-col w-full md:w-auto">
          <div className="flex flex-col sm:flex-row items-start sm:items-baseline gap-1 md:gap-3">
            <h1 className="text-lg md:text-2xl text-white tracking-widest leading-none">{t('GAME_TITLE')}</h1>
            <span className="text-[7px] md:text-[10px] text-slate-500 uppercase tracking-wider opacity-60">Provided by Reality Is Overrated</span>
          </div>
          <span className="text-[9px] md:text-[10px] text-blue-400 mt-1">
            {gameState === 'SELECT_START' ? t('INITIALIZATION_STATUS') : t('TURN_STATUS', { turn })}
          </span>
        </div>
        <div className="flex flex-wrap gap-2 md:gap-4 items-center w-full md:w-auto justify-start md:justify-end">
          {freeNukes > 0 && (
            <div className="hidden md:flex items-center text-[10px] text-yellow-400 font-bold border-2 border-yellow-500 bg-yellow-900/40 px-3 py-1 shadow-[0_0_10px_rgba(250,204,21,0.5)] animate-pulse">
              ⚠ TACTICAL NUKE READY ({freeNukes})
            </div>
          )}

          {/* Manual Button */}
          {gameState !== 'INTRO' && (
            <button
              onClick={() => setShowManual(true)}
              className="bg-green-700 hover:bg-green-600 border-2 border-pixel-border shadow-pixel px-3 py-1 text-[10px] text-white active:translate-x-1 active:translate-y-1 active:shadow-none transition-all"
            >
              {t('MANUAL_BTN')}
            </button>
          )}

          {/* Language Switcher */}
          <button
            onClick={toggleLanguage}
            className="bg-blue-700 hover:bg-blue-600 border-2 border-pixel-border shadow-pixel px-3 py-1 text-[10px] text-white active:translate-x-1 active:translate-y-1 active:shadow-none transition-all"
          >
            {lang === 'en' ? 'KO' : 'EN'}
          </button>

          {/* Manual Restart Button */}
          {gameState !== 'INTRO' && (
            <button
              onClick={handleManualRestart}
              className="bg-slate-700 hover:bg-slate-600 border-2 border-pixel-border shadow-pixel px-3 py-1 text-[10px] text-white active:translate-x-1 active:translate-y-1 active:shadow-none transition-all"
            >
              {t('RESTART_BTN')}
            </button>
          )}
          
          {gameState !== 'SELECT_START' && gameState !== 'INTRO' && (
            <button
              onClick={handleNextTurn}
              disabled={invasionTargetMode || specialForcesTargetMode}
              className="bg-red-700 hover:bg-red-600 disabled:bg-slate-700 disabled:text-slate-500 border-2 border-pixel-border shadow-pixel px-4 py-2 text-[10px] text-white active:translate-x-1 active:translate-y-1 active:shadow-none transition-all"
            >
              {t('NEXT_TURN')}
            </button>
          )}
        </div>
      </div>

      {/* Main Content Areas */}
      <div className="flex-1 flex flex-col md:flex-row gap-0 md:gap-4 overflow-hidden relative">

        {/* Left: Info Panel (Desktop) / Bottom Sheet (Mobile) */}
        <div className={`w-full md:w-1/5 z-20 transition-all duration-300 order-2 md:order-1 flex flex-col ${selectedCountry ? 'h-[55vh] md:h-full bg-slate-900 border-t-4 border-pixel-border md:border-t-0 md:bg-transparent' : 'hidden md:flex md:h-full'}`}>
          {selectedCountry && (
             <div className="md:hidden flex shrink-0 justify-center items-center py-2 bg-pixel-panel border-b-4 border-pixel-border cursor-pointer active:bg-slate-800" onClick={() => setSelectedCountryId(null)}>
                <div className="w-16 h-1.5 bg-slate-500 rounded-full"></div>
             </div>
          )}
          <div className="flex-1 overflow-hidden">
            <CountryInfoPanel
              country={selectedCountry}
              isPlayerOwned={playerIds.includes(selectedCountry?.id)}
              hasActed={actedRegions.includes(selectedCountry?.id)}
              onExecuteProtocol={executeProtocolClick}
              gameState={gameState}
              isTargetingMode={invasionTargetMode || transferTargetMode || nukeTargetMode || specialForcesTargetMode}
              supplies={supplies}
              solarFlareZones={solarFlareZones}
              onBuyItem={handleBuyItem}
              tutorialStep={tutorialStep}
            />
          </div>
        </div>

        {/* Center: Map (80%) */}
        <div className={`w-full md:w-4/5 flex-1 md:h-full order-1 md:order-2 flex items-center justify-center bg-[#050B14] border-4 border-pixel-border p-4 relative overflow-hidden transition-colors duration-1000 ${solarFlareZones.length > 0 ? 'bg-red-950/20' : ''}`}>
          {/* Subtle grid background for the map container */}
          <div className={`absolute inset-0 opacity-5 pointer-events-none transition-colors duration-1000 ${solarFlareZones.length > 0 ? 'bg-[radial-gradient(#ef4444_1px,transparent_0)]' : 'bg-[radial-gradient(#fff_1px,transparent_0)]'}`}
            style={{ backgroundSize: '30px 30px' }}></div>

          {/* Solar Flare Screen Effect */}
          {solarFlareZones.length > 0 && (
            <div className="absolute inset-0 pointer-events-none z-50 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0IiBoZWlnaHQ9IjQiPgo8cmVjdCB3aWR0aD0iNCIgaGVpZ2h0PSI0IiBmaWxsPSIjZmZmIiBmaWxsLW9wYWNpdHk9IjAuMDUiLz4KPC9zdmc+')] mix-blend-overlay opacity-30 animate-pulse"></div>
          )}

          <div className="w-full h-full max-h-[800px] relative">
            {isMobile ? (
              <TransformWrapper
                initialScale={1}
                minScale={0.5}
                maxScale={4}
                wheel={{ step: 0.1 }}
                pinch={{ step: 5 }}
                doubleClick={{ disabled: true }}
                panning={{ velocityDisabled: false }}
              >
                <TransformComponent 
                  wrapperClass="!w-full !h-full" 
                  contentClass="relative flex items-center justify-center !w-full !h-full"
                >
                  <InteractiveMap
                    territories={territories}
                    onSelect={handleSelect}
                    selectedId={selectedCountry?.id}
                    playerIds={playerIds}
                    aiData={aiData}
                    aiFactions={AI_FACTIONS}
                    invasionTargetMode={invasionTargetMode}
                    transferTargetMode={transferTargetMode}
                    nukeTargetMode={nukeTargetMode}
                    actedRegions={actedRegions}
                    solarFlareZones={solarFlareZones}
                    tutorialStep={tutorialStep}
                  />
                </TransformComponent>
              </TransformWrapper>
            ) : (
              <InteractiveMap
                territories={territories}
                onSelect={handleSelect}
                selectedId={selectedCountry?.id}
                playerIds={playerIds}
                aiData={aiData}
                aiFactions={AI_FACTIONS}
                invasionTargetMode={invasionTargetMode}
                transferTargetMode={transferTargetMode}
                nukeTargetMode={nukeTargetMode}
                actedRegions={actedRegions}
                solarFlareZones={solarFlareZones}
                tutorialStep={tutorialStep}
              />
            )}
          </div>

          {(invasionTargetMode || transferTargetMode || nukeTargetMode || specialForcesTargetMode) && (
            <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-slate-900/80 border-2 border-blue-500 text-blue-100 text-[10px] px-4 py-2 animate-pulse pointer-events-none z-20">
              {invasionTargetMode ? t('TARGET_HINT_INVASION') :
                nukeTargetMode ? t('TARGET_HINT_NUKE') :
                 specialForcesTargetMode ? t('TARGET_HINT_SPECIAL_FORCES') :
                  t('TARGET_HINT_TRANSFER')}
            </div>
          )}
        </div>
      </div>

      {/* Bottom: Event Log */}
      <div className="shrink-0 w-full z-10">
        <EventLogPanel events={events} />
      </div>
    </div>
  )
}

export default App
