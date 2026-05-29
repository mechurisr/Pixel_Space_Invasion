import React from 'react';
import { useLanguage } from '../LanguageContext';
import { COMMANDERS } from '../commandersData';

export const CommanderSkillPanel = ({ 
  commanderId, 
  cooldown, 
  supplies, 
  onUseSkill, 
  isTargeting 
}) => {
  const { t } = useLanguage();
  
  if (!commanderId) return null;
  const commander = COMMANDERS.find(c => c.id === commanderId);
  if (!commander) return null;

  const isReady = cooldown === 0;
  const canAfford = supplies >= commander.skillCost;
  const canUse = isReady && canAfford;

  return (
    <div className="fixed bottom-4 left-4 z-40 bg-gray-900 border-2 border-green-500 shadow-lg p-3 pixel-font w-72 flex flex-col pointer-events-auto">
      <div className="flex gap-3 mb-2">
        <div className="w-16 h-16 border border-gray-600 bg-gray-800 shrink-0">
          <img src={commander.portrait} alt={t(commander.nameKey)} className="w-full h-full object-cover pixelated" />
        </div>
        <div className="flex-1 flex flex-col justify-between">
          <div className="text-green-400 font-bold text-sm leading-tight">
            {t(commander.nameKey)}
          </div>
          <div className="text-yellow-400 text-xs font-bold">
            {t(commander.skillNameKey)}
          </div>
          <div className="flex justify-between text-[10px] mt-1">
            <span className={canAfford ? "text-blue-300" : "text-red-500"}>
              COST: {commander.skillCost} 📦
            </span>
            <span className={isReady ? "text-green-400" : "text-red-400"}>
              CD: {cooldown > 0 ? cooldown : 0} ⏳
            </span>
          </div>
        </div>
      </div>
      
      <button 
        onClick={onUseSkill}
        disabled={!canUse && !isTargeting}
        className={`w-full py-2 border-2 text-sm font-bold tracking-wider transition-colors uppercase ${
          isTargeting
            ? 'bg-red-900 border-red-500 text-white hover:bg-red-800'
            : canUse
              ? 'bg-green-900 border-green-500 text-green-100 hover:bg-green-700 hover:text-white cursor-pointer'
              : 'bg-gray-800 border-gray-600 text-gray-500 cursor-not-allowed'
        }`}
      >
        {isTargeting ? t('CANCEL_TARGETING') : isReady ? t('USE_SKILL') : t('SKILL_COOLDOWN', { turns: cooldown })}
      </button>
    </div>
  );
};
