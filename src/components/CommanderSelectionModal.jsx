import React from 'react';
import { useLanguage } from '../LanguageContext';
import { COMMANDERS } from '../commandersData';

export const CommanderSelectionModal = ({ onSelect }) => {
  const { t } = useLanguage();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 pixel-font">
      <div className="bg-gray-900 border-4 border-green-500 max-w-4xl w-full flex flex-col shadow-[0_0_20px_rgba(34,197,94,0.3)]">
        {/* Header */}
        <div className="bg-green-500 text-black px-4 py-3 flex justify-between items-center">
          <h2 className="text-xl font-bold tracking-widest">{t('SELECT_COMMANDER_TITLE')}</h2>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {COMMANDERS.map(commander => (
              <div 
                key={commander.id}
                className="bg-black border-2 border-gray-700 hover:border-green-400 p-4 flex flex-col items-center text-center cursor-pointer transition-colors group relative overflow-hidden"
                onClick={() => onSelect(commander.id)}
              >
                <div className="absolute inset-0 bg-green-500/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="w-32 h-32 mb-4 border-2 border-gray-600 bg-gray-800">
                  <img src={commander.portrait} alt={t(commander.nameKey)} className="w-full h-full object-cover pixelated" />
                </div>
                <h3 className="text-lg font-bold text-green-400 mb-2">{t(commander.nameKey)}</h3>
                
                <div className="w-full bg-gray-800 border border-gray-600 p-2 mb-3">
                  <div className="text-yellow-400 font-bold mb-1">{t(commander.skillNameKey)}</div>
                  <div className="flex justify-between text-xs mb-2">
                    <span className="text-blue-300">COST: {commander.skillCost} 📦</span>
                    <span className="text-red-300">CD: {commander.skillCooldown} ⏳</span>
                  </div>
                  <p className="text-gray-300 text-xs text-left leading-relaxed">
                    {t(commander.descriptionKey)}
                  </p>
                </div>
                
                <button className="mt-auto w-full bg-green-900 text-green-100 py-2 border-2 border-green-700 group-hover:bg-green-600 group-hover:text-white transition-colors uppercase text-sm font-bold tracking-wider">
                  Select
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
