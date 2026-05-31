export const QUESTS = [
  {
    id: 'frostbite',
    title: 'Operation Frostbite',
    scenario: '외계 세력이 기후 무기 연구 시설이 있는 극지방을 노리고 있습니다. 방어선을 구축하세요.',
    image: '/assets/quests/quest_frostbite.png',
    duration: 5,
    evaluateTrigger: (playerIds, territories) => {
      const techRegions = playerIds.map(id => territories.find(t => t.id === id)).filter(t => t.trait === 'TECH-CENTRIC');
      if (techRegions.length > 0) {
        const target = techRegions[Math.floor(Math.random() * techRegions.length)];
        return { targetId: target.id, targetName: target.name };
      }
      return null;
    },
    getConditionText: (targetName) => `${targetName} 지역을 5턴 동안 방어 (점유 유지)`,
    getRewardText: () => `대량의 Tech 자원 및 5턴 지속 방어막(Shield)`,
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
    }
  },
  {
    id: 'convoy',
    title: 'The Black Gold Convoy',
    scenario: '핵심 송유관이 끊길 위기에 처했습니다. 보급로를 사수해야 합니다.',
    image: '/assets/quests/quest_convoy.png',
    duration: 4,
    evaluateTrigger: (playerIds, territories) => {
      const resRegions = playerIds.map(id => territories.find(t => t.id === id)).filter(t => t.trait === 'RESOURCE-RICH');
      if (resRegions.length > 0) {
        for (const base of resRegions) {
          const neighbors = base.neighbors.map(nId => territories.find(t => t.id === nId)).filter(t => t.trait === 'RESOURCE-RICH');
          if (neighbors.length >= 2) {
             const targetIds = [base.id, neighbors[0].id, neighbors[1].id];
             return { targetIds, targetName: `${base.name} 인접 자원 지대` };
          }
        }
      }
      return null;
    },
    getConditionText: (targetName) => `${targetName} 3곳을 동시에 4턴간 점유`,
    getRewardText: () => `대량의 Supplies 및 타겟 지역 Oil 생산량 증가`,
    checkProgress: (quest, playerIds, territories) => {
      const hasAll = quest.targetIds.every(id => playerIds.includes(id));
      if (!hasAll) return 'FAILED';
      if (quest.remainingTurns <= 1) return 'COMPLETED';
      return 'ONGOING';
    },
    applyReward: (quest, territories, addSupplies, addFreeNukes, playerIds) => {
      addSupplies(100);
      quest.targetIds.forEach(id => {
        const t = territories.find(t => t.id === id);
        if (t) t.oil = Math.min(100, t.oil + 50);
      });
    }
  },
  {
    id: 'silicon',
    title: 'Silicon Rescue',
    scenario: '핵심 AI 데이터가 보관된 메갈로폴리스가 점령당했습니다. 신속히 탈환하세요.',
    image: '/assets/quests/quest_silicon.png',
    duration: 3,
    evaluateTrigger: (playerIds, territories) => {
      const playerNeighbors = Array.from(new Set(playerIds.flatMap(id => territories.find(t => t.id === id).neighbors)));
      const validTargets = playerNeighbors
        .filter(nId => !playerIds.includes(nId))
        .map(nId => territories.find(t => t.id === nId))
        .filter(t => t.trait === 'TECH-CENTRIC');
      
      if (validTargets.length > 0) {
        const target = validTargets[Math.floor(Math.random() * validTargets.length)];
        return { targetId: target.id, targetName: target.name };
      }
      return null;
    },
    getConditionText: (targetName) => `${targetName} 지역을 3턴 내에 점령 성공`,
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
    }
  },
  {
    id: 'last_stand',
    title: 'Last Stand at the Pentagon',
    scenario: '외계 강습 부대가 군사 기지로 쏟아집니다. 화력을 집중해 방어선을 유지하세요.',
    image: '/assets/quests/quest_last_stand.png',
    duration: 4,
    evaluateTrigger: (playerIds, territories) => {
      const milRegions = playerIds.map(id => territories.find(t => t.id === id)).filter(t => t.trait === 'MILITARY POWERHOUSE');
      if (milRegions.length > 0) {
        return { targetName: `군사 요충지` };
      }
      return null;
    },
    getConditionText: (targetName) => `점유 중인 MILITARY POWERHOUSE 지역들의 합산 군사력 150 이상 4턴 유지`,
    getRewardText: () => `모든 점유 지역의 Military 영구 상승`,
    checkProgress: (quest, playerIds, territories) => {
      const currentMilRegions = playerIds.map(id => territories.find(t => t.id === id)).filter(t => t.trait === 'MILITARY POWERHOUSE');
      const totalMilitary = currentMilRegions.reduce((sum, r) => sum + r.military, 0);
      
      if (totalMilitary < 150) return 'FAILED';
      if (quest.remainingTurns <= 1) return 'COMPLETED';
      return 'ONGOING';
    },
    applyReward: (quest, territories, addSupplies, addFreeNukes, playerIds) => {
      playerIds.forEach(id => {
        const t = territories.find(t => t.id === id);
        if (t) t.military = Math.min(100, t.military + 20);
      });
    }
  },
  {
    id: 'eurasian',
    title: 'Eurasian Link',
    scenario: '대륙을 잇는 안전지대를 확보해야 합니다. 끊어지지 않는 영토망을 연결하세요.',
    image: '/assets/quests/quest_eurasian.png',
    duration: 3,
    evaluateTrigger: (playerIds, territories) => {
      if (playerIds.length >= 2) {
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

      if (maxLen >= 4) return 'COMPLETED';
      if (quest.remainingTurns <= 1) return 'FAILED';
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
    }
  }
];
