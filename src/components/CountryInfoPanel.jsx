import React from 'react'
import { PixelPanel } from './PixelPanel'
import { OilIcon, TechIcon, MilitaryIcon } from './Icons'

export const CountryInfoPanel = ({ country, isPlayerOwned, hasActed, onExecuteProtocol, gameState, isTargetingMode }) => {
    if (!country) return (
        <PixelPanel title="COMMAND CENTER" className="h-full">
            <div className="flex flex-col items-center justify-center h-full space-y-4">
                {gameState === 'SELECT_START' ? (
                    <p className="text-[10px] text-yellow-400 animate-pulse text-center">SELECT A NODE ON THE MAP TO ESTABLISH YOUR BASE.</p>
                ) : (
                    <>
                        <div className="w-12 h-12 border-4 border-pixel-border/20 flex items-center justify-center">
                            <div className="w-4 h-4 bg-pixel-border/20 animate-ping"></div>
                        </div>
                        <p className="text-[8px] text-slate-500 text-center tracking-widest">AWAITING SECTOR UPLINK...</p>
                    </>
                )}
            </div>
        </PixelPanel>
    )

    return (
        <PixelPanel title="SECTOR ANALYSIS" className="h-full">
            <div className="space-y-6">
                <div>
                    <h2 className={`text-lg mb-1 leading-tight ${country.isOccupied ? 'text-purple-500' : 'text-yellow-400'}`}>
                        {country.name}
                    </h2>
                    <div className={`inline-block px-2 py-1 border-2 text-[7px] mb-2 ${country.isOccupied
                        ? 'bg-purple-900/50 border-purple-500 text-purple-300'
                        : 'bg-blue-900/50 border-blue-500/50 text-blue-300'
                        }`}>
                        {country.isOccupied ? '☣ ALIEN COLONY' : (
                            country.trait === 'MILITARY POWERHOUSE' ? '⚔ MILITARY POWERHOUSE (+25 MIL)' :
                                country.trait === 'TECH-CENTRIC' ? '🧬 TECH-CENTRIC (+25 TECH)' :
                                    country.trait === 'RESOURCE-RICH' ? '⛽ RESOURCE-RICH (+OIL)' : country.trait
                        )}
                    </div>
                    <p className="text-[7px] text-slate-500 font-mono">ID: {country.id} | LOC: {country.code}</p>
                </div>

                {country.isOccupied && (
                    <div className="p-3 bg-purple-900/30 border-2 border-purple-600 animate-pulse">
                        <p className="text-[8px] text-purple-400 font-bold mb-2">⚠ MUTATION DETECTED:</p>
                        <p className="text-[10px] text-white leading-tight">{country.mutationUnit}</p>
                    </div>
                )}

                <div className="space-y-5">
                    {/* Military */}
                    <div className="space-y-1">
                        <div className={`flex justify-between items-center text-[8px] ${country.isOccupied && country.mutationUnit === 'HEAVILY ARMORED MECHA ALIEN' ? 'text-purple-400' : 'text-red-400'}`}>
                            <div className="flex items-center gap-1">
                                <MilitaryIcon /> <span>MILITARY FORCE</span>
                            </div>
                            <span>{country.military}%</span>
                        </div>
                        <div className="w-full h-3 bg-black/50 border-2 border-pixel-border p-[1px]">
                            <div
                                className={`h-full shadow-[inset_-2px_0_0_rgba(0,0,0,0.3)] transition-all duration-500 ${country.isOccupied && country.mutationUnit === 'HEAVILY ARMORED MECHA ALIEN' ? 'bg-purple-600' : 'bg-red-600'}`}
                                style={{ width: `${country.military}%` }}
                            ></div>
                        </div>
                    </div>

                    {/* Oil */}
                    <div className="space-y-1">
                        <div className={`flex justify-between items-center text-[8px] ${country.isOccupied && country.mutationUnit === 'GIANT RESOURCE HARVESTER' ? 'text-purple-400' : 'text-yellow-500'}`}>
                            <div className="flex items-center gap-1">
                                <OilIcon /> <span>CRUDE OIL</span>
                            </div>
                            <span>{country.oil}%</span>
                        </div>
                        <div className="w-full h-3 bg-black/50 border-2 border-pixel-border p-[1px]">
                            <div
                                className={`h-full shadow-[inset_-2px_0_0_rgba(0,0,0,0.3)] transition-all duration-500 ${country.isOccupied && country.mutationUnit === 'GIANT RESOURCE HARVESTER' ? 'bg-purple-600' : 'bg-yellow-600'}`}
                                style={{ width: `${country.oil}%` }}
                            ></div>
                        </div>
                    </div>

                    {/* Tech */}
                    <div className="space-y-1">
                        <div className={`flex justify-between items-center text-[8px] ${country.isOccupied && country.mutationUnit === 'PSIONIC ALIEN SPECIALIST' ? 'text-purple-400' : 'text-blue-400'}`}>
                            <div className="flex items-center gap-1">
                                <TechIcon /> <span>TECH ASSETS</span>
                            </div>
                            <span>{country.tech}%</span>
                        </div>
                        <div className="w-full h-3 bg-black/50 border-2 border-pixel-border p-[1px]">
                            <div
                                className={`h-full shadow-[inset_-2px_0_0_rgba(0,0,0,0.3)] transition-all duration-500 ${country.isOccupied && country.mutationUnit === 'PSIONIC ALIEN SPECIALIST' ? 'bg-purple-600' : 'bg-blue-600'}`}
                                style={{ width: `${country.tech}%` }}
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
                            ☢ LAUNCH NUCLEAR STRIKE ☢
                        </button>
                    )}

                    <button
                        onClick={onExecuteProtocol}
                        disabled={!isPlayerOwned || country.isOccupied || hasActed}
                        className={`w-full border-2 shadow-pixel px-2 py-3 text-[8px] transition-all
              ${isPlayerOwned && !country.isOccupied && !hasActed
                                ? isTargetingMode
                                    ? 'bg-red-800 hover:bg-red-700 border-red-400 text-white active:translate-x-1 active:translate-y-1 active:shadow-none'
                                    : 'bg-blue-800 hover:bg-blue-700 border-blue-400 text-white active:translate-x-1 active:translate-y-1 active:shadow-none'
                                : 'bg-slate-800 border-slate-700 text-slate-600 cursor-not-allowed'}
            `}
                    >
                        {!isPlayerOwned ? 'RESTRICTED ACCESS' : hasActed ? 'ACTION ALREADY TAKEN' : isTargetingMode ? 'CANCEL TARGETING' : 'EXECUTE PROTOCOL'}
                    </button>
                </div>
            </div>
        </PixelPanel>
    )
}
