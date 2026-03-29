import React from 'react'
import { PixelPanel } from './PixelPanel'
import { OilIcon, TechIcon, MilitaryIcon } from './Icons'
import { useLanguage } from '../LanguageContext'

export const CountryInfoPanel = ({ country, isPlayerOwned, hasActed, onExecuteProtocol, gameState, isTargetingMode, supplies = 0, onBuyItem, solarFlareZones = [], tutorialStep = 0 }) => {
    const { t } = useLanguage()
    const [isShopOpen, setIsShopOpen] = React.useState(false)

    if (!country) return (
        <PixelPanel title={t('COMMAND_CENTER')} className="h-full">
            <div className="flex flex-col items-center justify-center h-full space-y-4">
                {gameState === 'SELECT_START' ? (
                    <p className="text-[10px] text-yellow-400 animate-pulse text-center">{t('SELECT_START_NODE')}</p>
                ) : (
                    <>
                        <div className="w-12 h-12 border-4 border-pixel-border/20 flex items-center justify-center">
                            <div className="w-4 h-4 bg-pixel-border/20 animate-ping"></div>
                        </div>
                        <p className="text-[8px] text-slate-500 text-center tracking-widest">{t('AWAITING_UPLINK')}</p>
                    </>
                )}
            </div>
        </PixelPanel>
    )

    const getTraitLabel = (trait) => {
        if (trait === 'MILITARY POWERHOUSE') return t('MILITARY_POWERHOUSE')
        if (trait === 'TECH-CENTRIC') return t('TECH_CENTRIC')
        if (trait === 'RESOURCE-RICH') return t('RESOURCE_RICH')
        return t('STANDARD')
    }

    const getMutationLabel = (unit) => {
        if (unit === 'HEAVILY ARMORED MECHA ALIEN') return t('HEAVILY_ARMORED_MECHA_ALIEN')
        if (unit === 'PSIONIC ALIEN SPECIALIST') return t('PSIONIC_ALIEN_SPECIALIST')
        if (unit === 'GIANT RESOURCE HARVESTER') return t('GIANT_RESOURCE_HARVESTER')
        if (unit === 'MUTANT_HIVE') return t('MUTANT_HIVE')
        return unit
    }

    const isFlareActive = solarFlareZones.includes(country.id);
    const obf = isFlareActive && !isPlayerOwned; // Obfuscate stats if enemy

    return (
        <PixelPanel title={isFlareActive ? t('SOLAR_FLARE_WARNING') : t('SECTOR_ANALYSIS')} className={`h-full ${isFlareActive ? 'border-red-600 shadow-[0_0_15px_rgba(220,38,38,0.5)]' : ''}`}>
            <div className="space-y-6">
                <div>
                    <h2 className={`text-lg mb-1 leading-tight ${country.isOccupied ? 'text-purple-500' : 'text-yellow-400'}`}>
                        {t(country.name)}
                    </h2>
                    <div className={`inline-block px-2 py-1 border-2 text-[7px] mb-2 ${country.isOccupied
                        ? 'bg-purple-900/50 border-purple-500 text-purple-300'
                        : 'bg-blue-900/50 border-blue-500/50 text-blue-300'
                        }`}>
                        {country.isOccupied ? t('ALIEN_COLONY') : getTraitLabel(country.trait)}
                    </div>
                    <p className="text-[7px] text-slate-500 font-mono">{t('ID_LABEL')}: {country.id} | {t('LOC_LABEL')}: {country.code}</p>
                </div>

                {country.isOccupied && (
                    <div className={`p-3 bg-purple-900/30 border-2 ${country.mutationUnit === 'MUTANT_HIVE' ? 'border-red-600 bg-red-950/40 animate-pulse shadow-[0_0_10px_rgba(220,38,38,0.3)]' : 'border-purple-600 animate-pulse'}`}>
                        <p className={`text-[8px] font-bold mb-2 ${country.mutationUnit === 'MUTANT_HIVE' ? 'text-red-400' : 'text-purple-400'}`}>{t('MUTATION_DETECTED')}</p>
                        <p className={`text-[10px] leading-tight ${country.mutationUnit === 'MUTANT_HIVE' ? 'text-red-200' : 'text-white'}`}>
                            {obf ? t('UNKNOWN_MUTATION') : getMutationLabel(country.mutationUnit)}
                            {(!obf && country.mutationUnit === 'MUTANT_HIVE') && ` - [${country.mutationCountdown}]`}
                        </p>
                    </div>
                )}

                <div className="space-y-5">
                    {/* Oil */}
                    <div className="space-y-1">
                        <div className={`flex justify-between items-center text-[8px] ${country.isOccupied && country.mutationUnit === 'GIANT RESOURCE HARVESTER' ? 'text-purple-400' : 'text-yellow-500'}`}>
                            <div className="flex items-center gap-1">
                                <OilIcon /> <span>{t('CRUDE_OIL')}</span>
                            </div>
                            <span>{obf ? '???' : `${country.oil}%`}</span>
                        </div>
                        <div className="w-full h-3 bg-black/50 border-2 border-pixel-border p-[1px]">
                            <div
                                className={`h-full shadow-[inset_-2px_0_0_rgba(0,0,0,0.3)] transition-all duration-500 ${obf ? 'bg-red-900/50' : (country.isOccupied && country.mutationUnit === 'GIANT RESOURCE HARVESTER' ? 'bg-purple-600' : 'bg-yellow-600')}`}
                                style={{ width: obf ? '100%' : `${country.oil}%` }}
                            ></div>
                        </div>
                    </div>

                    {/* Tech */}
                    <div className="space-y-1">
                        <div className={`flex justify-between items-center text-[8px] ${country.isOccupied && country.mutationUnit === 'PSIONIC ALIEN SPECIALIST' ? 'text-purple-400' : 'text-blue-400'}`}>
                            <div className="flex items-center gap-1">
                                <TechIcon /> <span>{t('TECH_ASSETS')}</span>
                            </div>
                            <span>{obf ? '???' : `${country.tech}%`}</span>
                        </div>
                        <div className="w-full h-3 bg-black/50 border-2 border-pixel-border p-[1px]">
                            <div
                                className={`h-full shadow-[inset_-2px_0_0_rgba(0,0,0,0.3)] transition-all duration-500 ${obf ? 'bg-red-900/50' : (country.isOccupied && country.mutationUnit === 'PSIONIC ALIEN SPECIALIST' ? 'bg-purple-600' : 'bg-blue-600')}`}
                                style={{ width: obf ? '100%' : `${country.tech}%` }}
                            ></div>
                        </div>
                    </div>

                    {/* Military */}
                    <div className="space-y-1">
                        <div className={`flex justify-between items-center text-[8px] ${country.isOccupied && country.mutationUnit === 'HEAVILY ARMORED MECHA ALIEN' ? 'text-purple-400' : 'text-red-400'}`}>
                            <div className="flex items-center gap-1">
                                <MilitaryIcon /> <span>{t('MILITARY_FORCE')}</span>
                            </div>
                            <span>{obf ? '???' : `${country.military}%`}</span>
                        </div>
                        <div className="w-full h-3 bg-black/50 border-2 border-pixel-border p-[1px]">
                            <div
                                className={`h-full shadow-[inset_-2px_0_0_rgba(0,0,0,0.3)] transition-all duration-500 ${obf ? 'bg-red-900/50' : (country.isOccupied && country.mutationUnit === 'HEAVILY ARMORED MECHA ALIEN' ? 'bg-purple-600' : 'bg-red-600')}`}
                                style={{ width: obf ? '100%' : `${country.military}%` }}
                            ></div>
                        </div>
                    </div>
                </div>

                <div className="pt-4 border-t-2 border-pixel-border/20">
                    {isPlayerOwned && country.nukeStatus === 'READY' && !hasActed && (
                        <button
                            onClick={() => onExecuteProtocol('NUKE_LAUNCH')}
                            className="w-full mb-3 bg-red-950 hover:bg-red-900 border-2 border-red-500 text-red-100 py-3 text-[10px] animate-pulse shadow-[0_0_15px_rgba(239,68,68,0.5)]"
                        >
                            {t('LAUNCH_NUKES')}
                        </button>
                    )}

                    <button
                        onClick={onExecuteProtocol}
                        disabled={!isPlayerOwned || country.isOccupied || hasActed || isFlareActive}
                        className={`w-full border-2 shadow-pixel px-2 py-3 text-[8px] transition-all
              ${tutorialStep === 2 || tutorialStep === 4 || tutorialStep === 6 || tutorialStep === 9
                                ? 'bg-yellow-600 hover:bg-yellow-500 border-yellow-400 text-white animate-pulse ring-4 ring-yellow-400 shadow-[0_0_15px_rgba(250,204,21,0.8)]'
                                : isPlayerOwned && !country.isOccupied && !hasActed && !isFlareActive
                                ? isTargetingMode
                                    ? 'bg-red-800 hover:bg-red-700 border-red-400 text-white active:translate-x-1 active:translate-y-1 active:shadow-none'
                                    : 'bg-blue-800 hover:bg-blue-700 border-blue-400 text-white active:translate-x-1 active:translate-y-1 active:shadow-none'
                                : 'bg-slate-800 border-slate-700 text-slate-600 cursor-not-allowed'}
            `}
                    >
                        {isFlareActive && isPlayerOwned ? t('COMMUNICATION_LOST') : 
                         !isPlayerOwned ? t('RESTRICTED_ACCESS') : 
                         hasActed ? t('ACTION_ALREADY_TAKEN') : 
                         isTargetingMode ? t('CANCEL_TARGETING') : 
                         t('EXECUTE_PROTOCOL')}
                    </button>

                    {gameState !== 'INTRO' && gameState !== 'SELECT_START' && (
                        <div className="mt-4 border-t-2 border-pixel-border/20 pt-4">
                            <button 
                                onClick={() => setIsShopOpen(!isShopOpen)}
                                className={`w-full flex justify-between items-center mb-2 px-1 hover:bg-white/5 cursor-pointer rounded transition-colors ${
                                    tutorialStep === 8 && !isShopOpen 
                                    ? 'bg-yellow-900/60 border-2 border-yellow-400 animate-pulse shadow-[0_0_10px_rgba(250,204,21,0.5)]' 
                                    : ''
                                }`}
                            >
                                <span className="text-[10px] text-yellow-400 font-bold tracking-widest flex items-center gap-2">
                                    {t('SUPPLIES_LABEL')}
                                    <span className="text-[8px] text-slate-400">{isShopOpen ? '▼' : '▶'}</span>
                                </span>
                                <span className="text-sm text-yellow-300 font-mono tracking-wider">{supplies}</span>
                            </button>
                            
                            {isShopOpen && (
                                <div className="space-y-2 mt-2">
                                    <button
                                        onClick={() => onBuyItem('NUKE')}
                                        disabled={supplies < 30 || isFlareActive}
                                        className={`w-full flex justify-between items-center p-2 text-[8px] border-2 transition-all ${supplies >= 30 && !isFlareActive ? 'bg-purple-900/40 border-purple-500 hover:bg-purple-800/60 text-purple-200 cursor-pointer shadow-[0_0_8px_rgba(168,85,247,0.3)]' : 'bg-slate-900 border-slate-700 text-slate-600 cursor-not-allowed'}`}
                                    >
                                        <span>{t('SHOP_NUKE')}</span>
                                        <span className="font-bold">30</span>
                                    </button>
                                    
                                    <button
                                        onClick={() => onBuyItem('MILITARY')}
                                        disabled={supplies < 10 || (!isPlayerOwned || country.isOccupied) || isFlareActive}
                                        className={`w-full flex justify-between items-center p-2 text-[8px] border-2 transition-all ${supplies >= 10 && (isPlayerOwned && !country.isOccupied) && !isFlareActive ? 'bg-red-900/40 border-red-500 hover:bg-red-800/60 text-red-200 cursor-pointer' : 'bg-slate-900 border-slate-700 text-slate-600 cursor-not-allowed'}`}
                                    >
                                        <span>{t('SHOP_MILITARY')}</span>
                                        <span className="font-bold">10</span>
                                    </button>

                                     <button
                                         onClick={() => onBuyItem('RESOURCE')}
                                         disabled={supplies < 10 || (!isPlayerOwned || country.isOccupied) || isFlareActive}
                                         className={`w-full flex justify-between items-center p-2 text-[8px] border-2 transition-all ${
                                             tutorialStep === 8 
                                             ? 'bg-yellow-900/60 border-yellow-400 text-yellow-200 cursor-pointer animate-pulse ring-4 ring-yellow-400 shadow-[0_0_15px_rgba(250,204,21,0.8)]'
                                             : supplies >= 10 && (isPlayerOwned && !country.isOccupied) && !isFlareActive 
                                             ? 'bg-blue-900/40 border-blue-500 hover:bg-blue-800/60 text-blue-200 cursor-pointer' 
                                             : 'bg-slate-900 border-slate-700 text-slate-600 cursor-not-allowed'
                                         }`}
                                     >
                                        <span>{t('SHOP_RESOURCE')}</span>
                                        <span className="font-bold">10</span>
                                    </button>

                                    <button
                                        onClick={() => onBuyItem('SPECIAL_FORCES')}
                                        disabled={supplies < 15 || isFlareActive}
                                        className={`w-full flex justify-between items-center p-2 text-[8px] border-2 transition-all ${supplies >= 15 && !isFlareActive ? 'bg-orange-900/40 border-orange-500 hover:bg-orange-800/60 text-orange-200 cursor-pointer shadow-[0_0_8px_rgba(249,115,22,0.3)]' : 'bg-slate-900 border-slate-700 text-slate-600 cursor-not-allowed'}`}
                                    >
                                        <span>{t('SHOP_SPECIAL_FORCES')}</span>
                                        <span className="font-bold">15</span>
                                    </button>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </PixelPanel>
    )
}
