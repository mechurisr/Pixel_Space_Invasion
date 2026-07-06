export const QUESTS = [
  {
    id: 'frostbite',
    title: 'Operation Frostbite',
    scenario: '외계 세력이 기후 무기 연구 시설이 있는 최전선 극지방을 노리고 있습니다. 방어선을 구축하세요.',
    image: '/assets/quests/quest_frostbite.png',
    duration: 5,
    evaluateTrigger: (playerIds, territories) => {
      // Find TECH-CENTRIC regions owned by player
      const techRegions = playerIds.map(id => territories.find(t => t.id === id)).filter(t => t.trait === 'TECH-CENTRIC');
      // Filter for Frontline (has unowned neighbor)
      const frontLineTech = techRegions.filter(t => t.neighbors.some(nId => !playerIds.includes(nId)));
      
      if (frontLineTech.length > 0) {
        const target = frontLineTech[Math.floor(Math.random() * frontLineTech.length)];
        return { targetId: target.id, targetName: target.name };
      }
      return null;
    },
    getConditionText: (targetName) => `최전선 ${targetName} 지역을 5턴 동안 방어 (함락 금지)`,
    getRewardText: () => `대량의 Tech 자원 및 타겟 지역 5턴 지속 방어막(Shield)`,
    checkProgress: (quest, playerIds, territories) => {
      if (!playerIds.includes(quest.targetId)) return 'FAILED';
      if (quest.remainingTurns <= 1) return 'COMPLETED';
      return 'ONGOING';
    },
    applyReward: (quest, territories, addSupplies, addFreeNukes, playerIds) => {
      const t = territories.find(t => t.id === quest.targetId);
      if (t) {
        t.tech = Math.min(100, t.tech + 50);
        t.shieldTurns += 5;
      }
    },
    applyPenalty: (quest, territories, playerIds) => {
      const t = territories.find(t => t.id === quest.targetId);
      if (t) {
        t.isOccupied = true;
        t.military = Math.min(100, t.military + 50);
        t.mutationUnit = 'ALIEN_SURGE';
        if (playerIds) {
          const index = playerIds.indexOf(quest.targetId);
          if (index > -1) playerIds.splice(index, 1);
        }
      }
    }
  },
  {
    id: 'convoy',
    title: 'The Black Gold Convoy',
    scenario: '핵심 자원 지대와 그 인접 보급로가 적의 위협을 받고 있습니다. 사수해야 합니다.',
    image: '/assets/quests/quest_convoy.png',
    duration: 10,
    evaluateTrigger: (playerIds, territories) => {
      // Find RESOURCE-RICH regions owned by player
      const resRegions = playerIds.map(id => territories.find(t => t.id === id)).filter(t => t.trait === 'RESOURCE-RICH');
      // Prioritize frontline resource regions
      let candidates = resRegions.filter(t => t.neighbors.some(nId => !playerIds.includes(nId)));
      if (candidates.length === 0) candidates = resRegions; // Fallback to any resource region
      
      if (candidates.length > 0) {
        const target = candidates[Math.floor(Math.random() * candidates.length)];
        // Just pick 2 random neighbors of this target to form a "supply chain" cluster
        if (target.neighbors.length >= 2) {
          const neighborsToHold = target.neighbors.slice(0, 2);
          return { targetIds: [target.id, ...neighborsToHold], targetName: `${target.name} 및 인접 거점 2곳` };
        }
      }
      return null;
    },
    getConditionText: (targetName, quest) => `(진행: ${quest?.heldTurns || 0}/4턴) ${targetName}을 동시에 4턴간 방어 및 점유`,
    getRewardText: () => `대량의 Supplies 및 타겟 거점에 5턴간 막대한 Oil 생산 버프 부여`,
    checkProgress: (quest, playerIds, territories) => {
      const hasAll = quest.targetIds.every(id => playerIds.includes(id));
      
      if (hasAll) {
        quest.heldTurns = (quest.heldTurns || 0) + 1;
      } else {
        quest.heldTurns = 0;
      }

      if (quest.heldTurns >= 4) return 'COMPLETED';
      if (quest.remainingTurns <= 1) return 'FAILED';
      
      return 'ONGOING';
    },
    applyReward: (quest, territories, addSupplies, addFreeNukes, playerIds) => {
      addSupplies(100);
      quest.targetIds.forEach(id => {
        const t = territories.find(t => t.id === id);
        if (t) t.oilBuffTurns = 5;
      });
    },
    applyPenalty: (quest, territories, playerIds) => {
      quest.targetIds.forEach(id => {
        const t = territories.find(t => t.id === id);
        if (t) {
          t.isOccupied = true;
          t.military = Math.min(100, t.military + 30);
          t.mutationUnit = 'ALIEN_SURGE';
          if (playerIds) {
            const index = playerIds.indexOf(id);
            if (index > -1) playerIds.splice(index, 1);
          }
        }
      });
    }
  },
  {
    id: 'silicon',
    title: 'Silicon Rescue',
    scenario: '핵심 AI 데이터가 보관된 인근 지역이 점령당했습니다. 데이터가 파기되기 전에 신속히 탈환하세요.',
    image: '/assets/quests/quest_silicon.png',
    duration: 3,
    evaluateTrigger: (playerIds, territories) => {
      // Find unowned TECH-CENTRIC regions within 2 hops of the player
      let reachableIds = new Set();
      playerIds.forEach(id => {
        const node = territories.find(t => t.id === id);
        if(node) {
          node.neighbors.forEach(nId => {
            reachableIds.add(nId);
            const neighborNode = territories.find(t => t.id === nId);
            if(neighborNode) {
              neighborNode.neighbors.forEach(nnId => reachableIds.add(nnId));
            }
          });
        }
      });
      const validTargets = Array.from(reachableIds)
        .filter(nId => !playerIds.includes(nId))
        .map(nId => territories.find(t => t.id === nId))
        .filter(t => t && t.trait === 'TECH-CENTRIC');
      
      if (validTargets.length > 0) {
        const target = validTargets[Math.floor(Math.random() * validTargets.length)];
        return { targetId: target.id, targetName: target.name };
      }
      return null;
    },
    getConditionText: (targetName) => `적진 ${targetName} 지역을 3턴 내에 점령 성공`,
    getRewardText: () => `대량의 Tech 및 Free Nuke 1기`,
    checkProgress: (quest, playerIds, territories) => {
      if (playerIds.includes(quest.targetId)) return 'COMPLETED';
      if (quest.remainingTurns <= 1) return 'FAILED';
      return 'ONGOING';
    },
    applyReward: (quest, territories, addSupplies, addFreeNukes, playerIds) => {
      addFreeNukes(1);
      const t = territories.find(t => t.id === quest.targetId);
      if (t) t.tech = Math.min(100, t.tech + 80);
    },
    applyPenalty: (quest, territories, playerIds) => {
      const t = territories.find(t => t.id === quest.targetId);
      if (t) {
        t.isOccupied = true;
        t.military = Math.min(100, t.military + 50);
        t.mutationUnit = 'ALIEN_SURGE';
        if (playerIds) {
          const index = playerIds.indexOf(quest.targetId);
          if (index > -1) playerIds.splice(index, 1);
        }
      }
    }
  },
  {
    id: 'last_stand',
    title: 'Last Stand at the Pentagon',
    scenario: '외계 강습 부대가 최전선 군사 기지로 쏟아집니다. 화력을 집중해 방어선을 굳건히 지키세요.',
    image: '/assets/quests/quest_last_stand.png',
    duration: 4,
    evaluateTrigger: (playerIds, territories) => {
      // Find MILITARY POWERHOUSE regions on the frontline
      const milRegions = playerIds.map(id => territories.find(t => t.id === id)).filter(t => t.trait === 'MILITARY POWERHOUSE');
      const frontLineMil = milRegions.filter(t => t.neighbors.some(nId => !playerIds.includes(nId)));
      if (frontLineMil.length > 0) {
        const target = frontLineMil[Math.floor(Math.random() * frontLineMil.length)];
        return { targetId: target.id, targetName: target.name };
      }
      return null;
    },
    getConditionText: (targetName) => `최전선 ${targetName} 지역을 4턴 동안 방어 (함락 금지)`,
    getRewardText: () => `방어한 타겟 거점에 5턴간 매 턴 Military 자동 회복 버프 부여`,
    checkProgress: (quest, playerIds, territories) => {
      if (!playerIds.includes(quest.targetId)) return 'FAILED';
      if (quest.remainingTurns <= 1) return 'COMPLETED';
      return 'ONGOING';
    },
    applyReward: (quest, territories, addSupplies, addFreeNukes, playerIds) => {
      const t = territories.find(t => t.id === quest.targetId);
      if (t) t.militaryBuffTurns = 5;
    },
    applyPenalty: (quest, territories, playerIds) => {
      const t = territories.find(t => t.id === quest.targetId);
      if (t) {
        t.isOccupied = true;
        t.military = Math.min(100, t.military + 50);
        t.mutationUnit = 'ALIEN_SURGE';
        if (playerIds) {
          const index = playerIds.indexOf(quest.targetId);
          if (index > -1) playerIds.splice(index, 1);
        }
      }
    }
  },
  {
    id: 'eurasian',
    title: 'Eurasian Link',
    scenario: '대륙을 잇는 안전지대를 확보해야 합니다. 끊어지지 않는 영토망을 끝까지 사수하세요.',
    image: '/assets/quests/quest_eurasian.png',
    duration: 3,
    evaluateTrigger: (playerIds, territories) => {
      if (playerIds.length >= 4) {
        return { targetName: `4개 이상의 지역` };
      }
      return null;
    },
    getConditionText: (targetName) => `끊기지 않는 영토망 4개 이상 연결 상태로 3턴 유지`,
    getRewardText: () => `점유 지역 군사/자원 스탯 전체 상승`,
    checkProgress: (quest, playerIds, territories) => {
      const visited = new Set();
      let maxLen = 0;

      const dfs = (nodeId, currentLen, currentVisited) => {
        currentVisited.add(nodeId);
        maxLen = Math.max(maxLen, currentLen);
        const node = territories.find(t => t.id === nodeId);
        node.neighbors.forEach(nId => {
          if (playerIds.includes(nId) && !currentVisited.has(nId)) {
            dfs(nId, currentLen + 1, new Set(currentVisited));
          }
        });
      };

      playerIds.forEach(id => {
        dfs(id, 1, new Set());
      });

      // Failed if the longest chain drops below 4 at any point during the 3 turns
      if (maxLen < 4) return 'FAILED';
      // Only complete when time is up
      if (quest.remainingTurns <= 1) return 'COMPLETED';
      
      return 'ONGOING';
    },
    applyReward: (quest, territories, addSupplies, addFreeNukes, playerIds) => {
      playerIds.forEach(id => {
        const t = territories.find(t => t.id === id);
        if (t) {
          t.military = Math.min(100, t.military + 20);
          t.oil = Math.min(100, t.oil + 20);
          t.tech = Math.min(100, t.tech + 20);
        }
      });
    },
    applyPenalty: (quest, territories, playerIds) => {
      // Pick a random player territory and surge it
      if (playerIds && playerIds.length > 0) {
        const randomId = playerIds[Math.floor(Math.random() * playerIds.length)];
        const t = territories.find(x => x.id === randomId);
        if (t) {
          t.isOccupied = true;
          t.military = Math.min(100, t.military + 50);
          t.mutationUnit = 'ALIEN_SURGE';
          const index = playerIds.indexOf(randomId);
          if (index > -1) playerIds.splice(index, 1);
        }
      }
    }
  }
];
