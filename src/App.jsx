import React, { useState } from 'react'
import { CountryInfoPanel } from './components/CountryInfoPanel'
import { InteractiveMap } from './components/InteractiveMap'
import { EventLogPanel } from './components/EventLogPanel'
import { ActionModal } from './components/ActionModal'
import { generateWorldMap } from './mapData'

export const AI_FACTIONS = [
  { id: 'AI-1', colorClass: 'text-blue-400', name: 'BLUE CORSAIR' },
  { id: 'AI-2', colorClass: 'text-yellow-400', name: 'YELLOW SWARM' },
  { id: 'AI-3', colorClass: 'text-pink-400', name: 'PINK SYNDICATE' },
  { id: 'AI-4', colorClass: 'text-cyan-400', name: 'CYAN DOMINION' },
  { id: 'AI-5', colorClass: 'text-orange-400', name: 'ORANGE VANGUARD' },
]

const getEffectiveMilitary = (country) => {
  if (country.isOccupied && country.mutationUnit === 'HEAVILY ARMORED MECHA ALIEN') {
    return Math.floor(country.military * 1.5)
  }
  return country.military
}

function App() {
  const [gameState, setGameState] = useState('SELECT_START') // SELECT_START, PLAYING, GAME_OVER
  const [territories, setTerritories] = useState(generateWorldMap())
  const [selectedCountryId, setSelectedCountryId] = useState(null)

  const selectedCountry = territories.find(t => t.id === selectedCountryId) || null

  const [playerIds, setPlayerIds] = useState([])
  const [aiData, setAiData] = useState([]) // Array of { factionId, territoryIds: [] }
  const [actedRegions, setActedRegions] = useState([])
  const [turn, setTurn] = useState(1)
  const [events, setEvents] = useState([
    { timestamp: '00:00', type: 'info', message: 'SYSTEM INITIALIZED. SELECT A COMMAND NODE.' }
  ])

  const [showActionModal, setShowActionModal] = useState(false)
  const [invasionTargetMode, setInvasionTargetMode] = useState(false)
  const [transferTargetMode, setTransferTargetMode] = useState(false)
  const [nukeTargetMode, setNukeTargetMode] = useState(false)

  const addEvent = (message, type = 'info') => {
    const timestamp = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
    setEvents(prev => [...prev, { timestamp, type, message }])
  }

  const handleSelect = (country) => {
    if (gameState === 'SELECT_START') {
      const newTerritories = [...territories]

      // Starter Buff
      const startNodeIdx = newTerritories.findIndex(t => t.id === country.id)
      newTerritories[startNodeIdx] = { ...newTerritories[startNodeIdx], military: 80, tech: 60, oil: 60 }

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
      addEvent(`COMMAND ESTABLISHED AT ${country.name}. 5 HOSTILE FACTIONS DETECTED.`, 'alert')
      addEvent(`[SYSTEM] STARTER RESOURCES ALLOCATED: 80 MIL / 60 OIL / 60 TECH.`)
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

    setSelectedCountryId(country.id)
  }

  const executeProtocolClick = (actionType) => {
    if (playerIds.includes(selectedCountry?.id) && !actedRegions.includes(selectedCountry?.id)) {
      // Cancel targeting mode if active
      if (invasionTargetMode === selectedCountry?.id) { setInvasionTargetMode(false); setShowActionModal(true); return; }
      if (transferTargetMode === selectedCountry?.id) { setTransferTargetMode(false); setShowActionModal(true); return; }
      if (nukeTargetMode === selectedCountry?.id) { setNukeTargetMode(false); setShowActionModal(true); return; }

      if (actionType && typeof actionType === 'string') {
        handlePlayerAction(actionType)
      } else {
        setShowActionModal(true)
      }
    }
  }

  const handlePlayerAction = (actionType) => {
    setShowActionModal(false)
    const pCountry = territories.find(t => t.id === selectedCountry.id)

    if (actionType === 'TECH') {
      if (pCountry.oil >= 20) {
        const bonus = pCountry.trait === 'TECH-CENTRIC' ? 25 : 15
        setTerritories(prev => prev.map(t => t.id === pCountry.id ? { ...t, oil: t.oil - 20, tech: Math.min(100, t.tech + bonus) } : t))
        setActedRegions(prev => [...prev, pCountry.id])
        addEvent(`[${pCountry.name}] TECHNOLOGY UPGRADED. (-20 OIL, +${bonus} TECH)`)
      } else addEvent(`[ERROR] INSUFFICIENT CRUDE OIL IN ${pCountry.name}.`, 'alert')
    }
    else if (actionType === 'MILITARY') {
      if (pCountry.tech >= 20) {
        const bonus = pCountry.trait === 'MILITARY POWERHOUSE' ? 25 : 15
        setTerritories(prev => prev.map(t => t.id === pCountry.id ? { ...t, tech: t.tech - 20, military: Math.min(100, t.military + bonus) } : t))
        setActedRegions(prev => [...prev, pCountry.id])
        addEvent(`[${pCountry.name}] MILITARY REINFORCED. (-20 TECH, +${bonus} MILITARY)`)
      } else addEvent(`[ERROR] INSUFFICIENT TECH ASSETS IN ${pCountry.name}.`, 'alert')
    }
    else if (actionType === 'INVADE') {
      setInvasionTargetMode(selectedCountry.id) // store which country is invading
      addEvent(`[COMBAT PROTOCOL] ${pCountry.name} PREPARING INVASION. SELECT A TARGET.`, 'alert')
    }
    else if (actionType === 'TRANSFER') {
      setTransferTargetMode(selectedCountry.id)
      addEvent(`[LOGISTICS] ${pCountry.name} PREPARING TROOP TRANSFER. SELECT A FRIENDLY TARGET.`, 'info')
    }
    else if (actionType === 'NUKE_DEV') {
      if (pCountry.military >= 70 && pCountry.tech >= 70) {
        setTerritories(prev => prev.map(t => t.id === pCountry.id ? { ...t, military: t.military - 70, tech: t.tech - 70, nukeStatus: 'DEVELOPING' } : t))
        setActedRegions(prev => [...prev, pCountry.id])
        addEvent(`[STRATEGIC] NUCLEAR PROGRAM INITIATED AT ${pCountry.name}. (-70 MIL, -70 TECH)`)
      } else {
        addEvent(`[ERROR] INSUFFICIENT RESOURCES FOR NUCLEAR PROGRAM.`, 'alert')
      }
    }
    else if (actionType === 'NUKE_LAUNCH') {
      setNukeTargetMode(selectedCountry.id)
      addEvent(`[WARNING] NUCLEAR LAUNCH PROTOCOL ACTIVE. SELECT ANY MAP TARGET.`, 'alert')
    }
  }

  const handlePlayerInvasion = (target) => {
    const invadingRegionId = invasionTargetMode
    setInvasionTargetMode(false)

    const pCountry = territories.find(t => t.id === invadingRegionId)

    if (!pCountry.neighbors.includes(target.id)) {
      addEvent(`[ERROR] TARGET OUT OF RANGE FROM ${pCountry.name}.`, 'alert')
      return
    }

    // Mark as acted regardless of win or loss
    setActedRegions(prev => [...prev, invadingRegionId])

    let pForce = getEffectiveMilitary(pCountry)
    let tForce = getEffectiveMilitary(target)

    // Psionic Shockwave (Defense)
    if (target.isOccupied && target.mutationUnit === 'PSIONIC ALIEN SPECIALIST') {
      const shockwavePower = Math.floor(target.tech * 0.3)
      pForce = Math.max(0, pForce - shockwavePower)
      addEvent(`[WARNING] PSIONIC SHOCKWAVE REDUCED YOUR FORCES IN ${target.name} BY ${shockwavePower} (30% of Tech).`, 'alert')
    }

    if (pForce > tForce) {
      // Win - VANGUARD PROTOCOL ACTIVATED
      setTerritories(prev => prev.map(t => {
        if (t.id === target.id) {
          // Supply Lines: The newly captured territory gets an immediate +15 Military reinforcement
          return { ...t, military: Math.min(100, Math.floor(t.military / 2) + 15), isOccupied: false, mutationUnit: null }
        }
        if (t.id === pCountry.id) {
          // Spoils of War: The attacking territory recovers +10 Oil and +10 Tech from the conquest
          return {
            ...t,
            military: Math.max(0, pCountry.military - Math.floor(tForce / 2)),
            oil: Math.min(100, t.oil + 10),
            tech: Math.min(100, t.tech + 10)
          }
        }
        return t
      }))
      setPlayerIds(prev => Array.from(new Set([...prev, target.id])))

      setAiData(prev => {
        return prev.map(faction => ({
          ...faction,
          territoryIds: faction.territoryIds.filter(id => id !== target.id)
        }))
      })

      // Check for elimination separately from state transition to avoid duplicates in StrictMode
      aiData.forEach(faction => {
        if (faction.territoryIds.includes(target.id) && faction.territoryIds.length === 1) {
          const meta = AI_FACTIONS.find(f => f.id === faction.factionId)
          addEvent(`[SYSTEM] ${meta.name} HAS BEEN ELIMINATED.`, 'alert')
        }
      })

      addEvent(`[VANGUARD PROTOCOL] ${target.name} SECURED. (+15 MIL TO TARGET, +10 OIL/TECH SECURED AT ${pCountry.name})`, 'alert')
    } else {
      // Lose
      setTerritories(prev => prev.map(t => t.id === pCountry.id ? { ...t, military: Math.max(0, pCountry.military - 30) } : t))
      addEvent(`[DEFEAT] INVASION DELTA AT ${target.name} FAILED. HEAVY CASUALTIES (-30 MIL).`, 'alert')
    }
  }

  const handlePlayerTransfer = (target) => {
    const sourceId = transferTargetMode
    setTransferTargetMode(false)

    const source = territories.find(t => t.id === sourceId)

    if (!source.neighbors.includes(target.id)) {
      addEvent(`[ERROR] TARGET OUT OF RANGE FROM ${source.name}.`, 'alert')
      return
    }

    if (!playerIds.includes(target.id)) {
      addEvent(`[ERROR] TARGET MUST BE A FRIENDLY SECTOR.`, 'alert')
      return
    }

    if (source.military <= 25) {
      addEvent(`[ERROR] INSUFFICIENT TROOPS IN ${source.name} TO TRANSFER.`, 'alert')
      return
    }

    setActedRegions(prev => [...prev, sourceId])
    setTerritories(prev => prev.map(t => {
      if (t.id === sourceId) return { ...t, military: t.military - 25 }
      if (t.id === target.id) return { ...t, military: Math.min(100, t.military + 25) }
      return t
    }))

    addEvent(`[LOGISTICS] 25 UNITS TRANSFERRED FROM ${source.name} TO ${target.name}.`)
  }

  const handleNukeLaunch = (target) => {
    const sourceId = nukeTargetMode
    setNukeTargetMode(false)

    // Reset target to 0 Neutral
    setTerritories(prev => prev.map(t => {
      if (t.id === target.id) {
        return {
          ...t,
          military: 0,
          oil: 0,
          tech: 0,
          isOccupied: false,
          mutationUnit: null,
          nukeStatus: null
        }
      }
      if (t.id === sourceId) return { ...t, nukeStatus: null }
      return t
    }))

    // Check for elimination (Nuke)
    aiData.forEach(faction => {
      if (faction.territoryIds.includes(target.id) && faction.territoryIds.length === 1) {
        const meta = AI_FACTIONS.find(f => f.id === faction.factionId)
        addEvent(`[SYSTEM] ${meta.name} HAS BEEN ELIMINATED BY NUCLEAR STRIKE.`, 'alert')
      }
    })

    addEvent(`[NUCLEAR STRIKE] ${target.name} HAS BEEN NEUTRALIZED. TOTAL WIPEOUT.`, 'alert')
  }

  const handleNextTurn = () => {
    setTurn(t => t + 1)
    setActedRegions([])
    let updateLogs = []
    let alienExpansionsThisTurn = 0 // Track total expansions per turn

    // Copy states for processing
    let newTerritories = [...territories].map(t => {
      const passiveOil = t.trait === 'RESOURCE-RICH'
        ? Math.floor(Math.random() * 11) + 5 // 5-15 oil
        : Math.floor(Math.random() * 10) // 0-9 oil

      // Update Nuke Status: DEVELOPING -> READY
      const nextNukeStatus = t.nukeStatus === 'DEVELOPING' ? 'READY' : t.nukeStatus
      if (t.nukeStatus === 'DEVELOPING') updateLogs.push(`[SYSTEM] NUCLEAR ARSENAL READY AT ${t.name}.`)

      return { ...t, oil: Math.min(100, t.oil + passiveOil), nukeStatus: nextNukeStatus }
    })
    let newAiData = JSON.parse(JSON.stringify(aiData))
    let newPlayerIds = [...playerIds]

    // AI logic per faction per territory
    newAiData.forEach(faction => {
      const factionMetadata = AI_FACTIONS.find(f => f.id === faction.factionId)
      const currentTerritoryIds = [...faction.territoryIds] // Copy because it might change during iteration

      currentTerritoryIds.forEach(tId => {
        const tIndex = newTerritories.findIndex(t => t.id === tId)
        if (tIndex === -1) return
        let t = newTerritories[tIndex]

        // FIX: Ensure this faction actually still owns this territory (prevent ghosting)
        const isStillOwned = faction.territoryIds.includes(t.id)
        const isPlayerOwned = newPlayerIds.includes(t.id)
        if (isPlayerOwned || t.isOccupied) {
          // This territory was lost to player or alien, cleanup faction data
          faction.territoryIds = faction.territoryIds.filter(id => id !== t.id)
          return
        }

        // Decide action: Aggressive expansion prioritized if strong enough
        const validNeighbors = t.neighbors.filter(nId => !faction.territoryIds.includes(nId))
        let targetAcquired = null

        let currentTForce = getEffectiveMilitary(t)

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

          // AI Wins
          newTerritories[targetIndex].military = Math.floor(target.military / 2)
          newTerritories[targetIndex].isOccupied = false
          newTerritories[targetIndex].mutationUnit = null

          newTerritories[tIndex].military = Math.max(0, t.military - Math.floor(nForce / 2))

          // Claim territory
          faction.territoryIds.push(target.id)

          // Remove from previous owner (Player or other AI)
          newPlayerIds = newPlayerIds.filter(id => id !== target.id)
          newAiData.forEach(otherAi => {
            if (otherAi.factionId !== faction.factionId) {
              if (otherAi.territoryIds.includes(target.id) && otherAi.territoryIds.length === 1) {
                const otherMeta = AI_FACTIONS.find(f => f.id === otherAi.factionId)
                updateLogs.push(`[SYSTEM] ${otherMeta.name} HAS BEEN ELIMINATED.`)
              }
              otherAi.territoryIds = otherAi.territoryIds.filter(id => id !== target.id)
            }
          })

          updateLogs.push(`[${factionMetadata.name}] SECURED ${target.name}.`)
        } else if (t.oil >= 20 && t.tech < 80) {
          // Upgrade Tech
          const bonus = t.trait === 'TECH-CENTRIC' ? 25 : 15
          newTerritories[tIndex].oil -= 20
          newTerritories[tIndex].tech = Math.min(100, t.tech + bonus)
        } else if (t.tech >= 20) {
          // Upgrade Military
          const bonus = t.trait === 'MILITARY POWERHOUSE' ? 25 : 15
          newTerritories[tIndex].tech -= 20
          newTerritories[tIndex].military = Math.min(100, t.military + bonus)
        }

        const weakFriendly = t.neighbors
          .map(nId => newTerritories.find(x => x.id === nId))
          .filter(n => faction.territoryIds.includes(n.id) && n.military < 50)
          .sort((a, b) => a.military - b.military)

        if (weakFriendly.length > 0 && t.military > 50) {
          const targetId = weakFriendly[0].id
          newTerritories[tIndex].military -= 25
          const targetIdx = newTerritories.findIndex(x => x.id === targetId)
          newTerritories[targetIdx].military = Math.min(100, newTerritories[targetIdx].military + 25)
          updateLogs.push(`[${factionMetadata.name}] REDEPLOYED TROOPS TO ${weakFriendly[0].name}.`)
        }

        // AI Nuclear Strategy
        if (t.nukeStatus === 'READY') {
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
            updateLogs.push(`[STRATEGIC STRIKE] ${factionMetadata.name} LAUNCHED A NUKE AT ${target.name}.`)
          }
        }
      })
    })

    // Alien Logic per territory
    const alienTerritories = newTerritories.filter(t => t.isOccupied)

    alienTerritories.forEach(aTerritory => {
      const aIndex = newTerritories.findIndex(t => t.id === aTerritory.id)
      let t = newTerritories[aIndex]

      if (t.mutationUnit === 'GIANT RESOURCE HARVESTER') {
        // Harvest 10 oil (Reduced from 20)
        newTerritories[aIndex].oil = Math.min(100, t.oil + 10)
        // Spawn troops if oil >= 80
        if (newTerritories[aIndex].oil >= 80 && newTerritories[aIndex].military < 100) {
          newTerritories[aIndex].oil -= 80
          newTerritories[aIndex].military = Math.min(100, t.military + 25) // Reduced from 50
          updateLogs.push(`[ALIEN] GIANT HARVESTER AT ${t.name} SPAWNED REINFORCEMENTS.`)
        }
      } else {
        // Standard Aliens (Psionic, Mecha) just slowly gain military/tech
        newTerritories[aIndex].military = Math.min(100, t.military + 10)
        if (t.mutationUnit === 'PSIONIC ALIEN SPECIALIST') {
          newTerritories[aIndex].tech = Math.min(100, t.tech + 10)
        }
      }

      // Alien Ultimate Weapon: Singularity Spore
      if (t.tech === 100 && Math.random() > 0.5) {
        const potentialHumanTargets = t.neighbors
          .map(nId => newTerritories.find(x => x.id === nId))
          .filter(n => !n.isOccupied)
          .sort((a, b) => b.military - a.military)

        if (potentialHumanTargets.length > 0) {
          const target = potentialHumanTargets[0]
          const tIdx = newTerritories.findIndex(x => x.id === target.id)
          newTerritories[tIdx] = { ...newTerritories[tIdx], isOccupied: true, mutationUnit: t.mutationUnit, military: 50, oil: 0, tech: 0 }

          // Sync owner cleanup
          newPlayerIds = newPlayerIds.filter(id => id !== target.id)
          newAiData.forEach(otherAi => {
            otherAi.territoryIds = otherAi.territoryIds.filter(id => id !== target.id)
          })

          updateLogs.push(`[SINGULARITY SPORE] ${t.name} INFECTED ${target.name} COMPLETELY.`)
          newTerritories[aIndex].tech = 0 // Reset after use
        }
      }

      // Aggressive Alien Expansion!
      // GLOBAL LIMIT: Aliens as a whole can only expand a maximum of 3 times per turn
      if (alienExpansionsThisTurn >= 3) return

      const validNeighbors = t.neighbors.filter(nId => !newTerritories.find(x => x.id === nId).isOccupied) // Aliens don't attack aliens
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
            if (t.mutationUnit === 'PSIONIC ALIEN SPECIALIST') nForce = Math.max(0, nForce - Math.floor(t.tech * 0.3))
            return attackerForce > (nForce + 30)  // Increased threshold from 10 to 30
          })
          .sort((a, b) => getEffectiveMilitary(a) - getEffectiveMilitary(b))

        if (vulnerableNeighbors.length > 0) {
          const target = vulnerableNeighbors[0]
          const targetIndex = newTerritories.findIndex(x => x.id === target.id)
          let nForce = getEffectiveMilitary(target)
          if (t.mutationUnit === 'PSIONIC ALIEN SPECIALIST') nForce = Math.max(0, nForce - Math.floor(t.tech * 0.3))

          // Alien Wins Expansion - Hive Resonance!
          // Newly infected territories start with 20 military + small bonus from attacker
          const leftoverAttacker = Math.max(0, newTerritories[aIndex].military - Math.floor(nForce / 2))
          newTerritories[targetIndex].military = 20 + Math.floor(leftoverAttacker * 0.1)
          newTerritories[targetIndex].isOccupied = true
          newTerritories[targetIndex].mutationUnit = t.mutationUnit // Clone itself

          // HIVE EXHAUSTION: The attacking hive pushes itself to the limit and loses 50% of its remaining force
          newTerritories[aIndex].military = Math.floor(leftoverAttacker * 0.5)
          alienExpansionsThisTurn++

          // HIVE RESONANCE: All existing adjacent alien neighbors gain +5 military
          target.neighbors.forEach(nId => {
            const nIdx = newTerritories.findIndex(nt => nt.id === nId)
            if (nIdx !== -1 && newTerritories[nIdx].isOccupied && nId !== target.id) {
              newTerritories[nIdx].military = Math.min(100, newTerritories[nIdx].military + 5)
            }
          })

          // Remove from previous owner (Player or AI)
          newPlayerIds = newPlayerIds.filter(id => id !== target.id)
          newAiData.forEach(otherAi => {
            if (otherAi.territoryIds.includes(target.id) && otherAi.territoryIds.length === 1) {
              const otherMeta = AI_FACTIONS.find(f => f.id === otherAi.factionId)
              updateLogs.push(`[SYSTEM] ${otherMeta.name} HAS BEEN ELIMINATED.`)
            }
            otherAi.territoryIds = otherAi.territoryIds.filter(id => id !== target.id)
          })

          updateLogs.push(`[MUTATION SPREADS] INFECTION FROM ${t.name} CONSUMED ${target.name}!`)
        }
      }
    })

    // Periodic Alien Invasion Event (Every 5 turns starting from Turn 2: 2, 7, 12, 17...)
    const nextTurn = turn + 1
    if (nextTurn >= 2 && (nextTurn - 2) % 5 === 0) {
      const allOwnedIds = [...newPlayerIds, ...newAiData.flatMap(f => f.territoryIds)]
      const unOccupied = newTerritories.filter(t => !t.isOccupied && !allOwnedIds.includes(t.id))

      if (unOccupied.length > 0) {
        // Spawn up to 2 aliens during a wave to be threatening
        const spawnCount = Math.min(2, unOccupied.length)
        for (let i = 0; i < spawnCount; i++) {
          const availableTargets = newTerritories.filter(t => !t.isOccupied && !allOwnedIds.includes(t.id))
          if (availableTargets.length === 0) break;

          const target = availableTargets[Math.floor(Math.random() * availableTargets.length)]
          let mut = target.trait === 'TECH-CENTRIC' ? 'PSIONIC ALIEN SPECIALIST' :
            target.trait === 'RESOURCE-RICH' ? 'GIANT RESOURCE HARVESTER' : 'HEAVILY ARMORED MECHA ALIEN'

          const tIdx = newTerritories.findIndex(t => t.id === target.id)
          // Give them a starting military boost so they don't die instantly
          newTerritories[tIdx] = { ...newTerritories[tIdx], isOccupied: true, mutationUnit: mut, military: Math.max(50, target.military) }
          updateLogs.push(`[ALIEN THREAT] ${target.name}: OCCUPIED BY NEW MUTANTS. ${mut} SPAWNED.`)
        }
      }
    }

    setPlayerIds(newPlayerIds)
    setAiData(newAiData)
    setTerritories(newTerritories)

    updateLogs.forEach(log => addEvent(log, 'alert'))
    if (updateLogs.length === 0) addEvent(`TURN ${turn + 1} BEGUN. FORCES DEPLOYED.`)
  }

  return (
    <div className="h-screen w-full bg-pixel-bg p-4 flex flex-col gap-4 font-pixel select-none relative">
      {showActionModal && selectedCountry && (
        <ActionModal
          country={selectedCountry}
          onAction={handlePlayerAction}
          onClose={() => setShowActionModal(false)}
        />
      )}

      {/* Header */}
      <div className="flex justify-between items-center border-b-4 border-pixel-border pb-2">
        <div className="flex flex-col">
          <h1 className="text-xl md:text-2xl text-white tracking-widest leading-none">NEURAL STRATAGEM</h1>
          <span className="text-[10px] text-blue-400 mt-1">
            {gameState === 'SELECT_START' ? 'INITIALIZATION: CHOOSE YOUR COMMAND NODE' : `TURN: ${turn} | STATUS: OPERATIONAL`}
          </span>
        </div>
        <div className="flex gap-4 items-center">
          {gameState !== 'SELECT_START' && (
            <button
              onClick={handleNextTurn}
              disabled={invasionTargetMode}
              className="bg-red-700 hover:bg-red-600 disabled:bg-slate-700 disabled:text-slate-500 border-2 border-pixel-border shadow-pixel px-4 py-2 text-[10px] text-white active:translate-x-1 active:translate-y-1 active:shadow-none transition-all"
            >
              NEXT TURN
            </button>
          )}
        </div>
      </div>

      {/* Main Content Areas */}
      <div className="flex-1 flex flex-col md:flex-row gap-4 overflow-hidden relative">

        {/* Left: Info Panel (20%) */}
        <div className="w-full md:w-1/5 h-1/3 md:h-full z-10">
          <CountryInfoPanel
            country={selectedCountry}
            isPlayerOwned={playerIds.includes(selectedCountry?.id)}
            hasActed={actedRegions.includes(selectedCountry?.id)}
            onExecuteProtocol={executeProtocolClick}
            gameState={gameState}
            isTargetingMode={invasionTargetMode || transferTargetMode || nukeTargetMode}
          />
        </div>

        {/* Center: Map (80%) */}
        <div className="w-full md:w-4/5 h-2/3 md:h-full flex items-center justify-center bg-[#050B14] border-4 border-pixel-border p-4 relative overflow-hidden">
          {/* Subtle grid background for the map container */}
          <div className="absolute inset-0 opacity-5 pointer-events-none"
            style={{ backgroundImage: 'radial-gradient(#fff 1px, transparent 0)', backgroundSize: '30px 30px' }}></div>

          <div className="w-full h-full max-h-[800px] relative">
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
            />
          </div>

          {(invasionTargetMode || transferTargetMode || nukeTargetMode) && (
            <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-slate-900/80 border-2 border-blue-500 text-blue-100 text-[10px] px-4 py-2 animate-pulse pointer-events-none z-20">
              {invasionTargetMode ? 'TARGET NEIGHBORING SECTOR FOR INVASION' :
                nukeTargetMode ? 'SELECT ANY TARGET FOR NUCLEAR STRIKE' :
                  'SELECT FRIENDLY NEIGHBOR FOR TRANSFER'}
            </div>
          )}
        </div>
      </div>

      {/* Bottom: Event Log (20%) */}
      <div className="h-1/5 w-full z-10">
        <EventLogPanel events={events} />
      </div>
    </div>
  )
}

export default App
