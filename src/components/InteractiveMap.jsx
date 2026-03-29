import React from 'react'
import { useLanguage } from '../LanguageContext'

export const InteractiveMap = ({ territories, onSelect, selectedId, playerIds, aiData, aiFactions, invasionTargetMode, transferTargetMode, nukeTargetMode, actedRegions = [], solarFlareZones = [], tutorialStep = 0 }) => {
    const { t } = useLanguage()
    return (
        <div className="relative w-full h-full bg-black/40 border-4 border-pixel-border md:overflow-auto overflow-hidden md:block flex items-center justify-center">
            <div className="md:min-w-[1200px] md:min-h-[600px] w-full h-full relative aspect-video md:aspect-auto">
                {/* SVG layer for connection lines */}
                <svg className="absolute inset-0 w-full h-full pointer-events-none stroke-slate-700/50" strokeWidth="2" strokeDasharray="4 4">
                    {territories.map(t1 =>
                        t1.neighbors?.map(nId => {
                            const t2 = territories.find(t => t.id === nId)
                            if (!t2 || t1.id > t2.id) return null // Draw only once per pair
                            return (
                                <line
                                    key={`${t1.id}-${t2.id}`}
                                    x1={`${t1.x}%`} y1={`${t1.y}%`}
                                    x2={`${t2.x}%`} y2={`${t2.y}%`}
                                />
                            )
                        })
                    )}
                </svg>

                {/* Nodes */}
                {territories.map((node) => {
                    const isPlayer = playerIds?.includes(node.id)
                    const isSelected = selectedId === node.id
                    const canAct = isPlayer && !actedRegions.includes(node.id)

                    // Check AI Owner
                    const owningAi = aiData?.find(f => f.territoryIds.includes(node.id))
                    const aiMeta = owningAi ? aiFactions?.find(f => f.id === owningAi.factionId) : null

                    // Targetable if it's a neighbor of the CURRENTLY invading region
                    const isTargetable = invasionTargetMode && territories.find(pt => pt.id === invasionTargetMode)?.neighbors.includes(node.id)

                    // Transfer targetable if it's a neighbor of the source region AND is player owned
                    const isTransferTargetable = transferTargetMode && territories.find(st => st.id === transferTargetMode)?.neighbors.includes(node.id) && isPlayer

                    // Nuke targetable is ANY region
                    const isNukeTarget = nukeTargetMode && node.id !== nukeTargetMode

                    let nodeClass = 'bg-slate-800/80 border-slate-600 focus:bg-slate-700'
                    let textClass = 'text-slate-300'
                    let label = null

                    if (node.isOccupied) {
                        nodeClass = 'bg-purple-950/90 border-purple-800 text-purple-400 animate-pulse'
                        textClass = 'text-purple-300'
                        if (node.mutationUnit === 'MUTANT_HIVE') {
                            nodeClass = 'bg-red-950/90 border-red-600 text-red-500 animate-pulse shadow-[0_0_20px_rgba(220,38,38,0.8)] z-20 ring-4 ring-red-500/50'
                            textClass = 'text-red-200'
                        }
                    }
                    else if (isPlayer) {
                        nodeClass = 'bg-green-600/80 border-green-400 shadow-[0_0_15px_rgba(74,222,128,0.5)]'
                        textClass = 'text-white'
                        label = <span className="absolute -top-4 text-[6px] text-green-400 drop-shadow-md">{t('OWNED_LABEL')}</span>
                    }
                    else if (aiMeta) {
                        nodeClass = `bg-gray-900/90 border-2 ${aiMeta.borderClass} ${aiMeta.bgClass?.replace('900', '800')} shadow-lg`
                        textClass = aiMeta.colorClass
                        label = <span className={`absolute -top-4 text-[5px] ${aiMeta.colorClass} drop-shadow-md`}>{aiMeta.id}</span>
                    }

                    const isFlareActive = solarFlareZones.includes(node.id);
                    if (isFlareActive) {
                        nodeClass += ' solar-flare-node';
                        if (!isPlayer) {
                            label = <span className="absolute -top-4 text-[5px] text-red-400 drop-shadow-md">???</span>;
                        }
                    }

                    const isTutorialTarget = 
                        (tutorialStep === 1 && node.id === 23) ||
                        (tutorialStep === 3 && node.id === 24) ||
                        (tutorialStep === 7 && node.id === 26) ||
                        (tutorialStep === 9 && node.id === 23);

                    if (isTutorialTarget) {
                        nodeClass += ' ring-[6px] ring-yellow-400 ring-offset-2 ring-offset-black animate-pulse shadow-[0_0_20px_rgba(250,204,21,0.8)] z-40 cursor-pointer'
                    } else if (isTargetable && !isPlayer) {
                        nodeClass += ' ring-4 ring-red-500 ring-offset-2 ring-offset-black animate-pulse cursor-crosshair z-20'
                    } else if (isTransferTargetable) {
                        nodeClass += ' ring-4 ring-green-400 ring-offset-2 ring-offset-black animate-pulse cursor-pointer z-20'
                    } else if (isNukeTarget) {
                        nodeClass += ' ring-[6px] ring-red-600 ring-offset-4 ring-offset-black animate-pulse shadow-[0_0_20px_rgba(220,38,38,0.8)] cursor-crosshair z-30'
                    } else if (isSelected) {
                        nodeClass += ' ring-2 ring-blue-400'
                    }

                    return (
                        <button
                            key={node.id}
                            onClick={() => onSelect(node)}
                            style={{ left: `${node.x}%`, top: `${node.y}%`, transform: 'translate(-50%, -50%)' }}
                            className={`
                  absolute w-8 h-8 md:w-12 md:h-12 border-2 shadow-pixel transition-all duration-200
                  ${nodeClass}
                  active:scale-95 flex flex-col items-center justify-center group z-10
                `}
                        >
                            {label}
                            <span className={`text-[5px] md:text-[6px] font-bold ${textClass} transition-colors text-center leading-none px-1`}>
                                {(isFlareActive && !isPlayer) ? '???' : (node.isOccupied ? (node.mutationUnit === 'MUTANT_HIVE' ? `☣ ${node.mutationCountdown}` : '☣') : node.code)}
                            </span>
                            {node.hasEvent && !node.isOccupied && (
                                <div className="absolute top-0 right-0 w-2 h-2 bg-red-500 animate-ping rounded-full -mt-1 -mr-1"></div>
                            )}
                            {node.hasSupply && (
                                <div className="absolute top-0 right-0 w-3 h-3 bg-yellow-400 animate-bounce shadow-[0_0_10px_rgba(250,204,21,0.8)] border border-yellow-200 z-30 -mt-1 -mr-1" title="Supply Drop"></div>
                            )}
                            {canAct && (
                                <div className="absolute -bottom-1 -right-1 w-2.5 h-2.5 md:w-3.5 md:h-3.5 bg-blue-500 rounded-sm border-[1px] border-blue-200 flex items-center justify-center shadow-[0_0_5px_rgba(59,130,246,0.8)] z-20">
                                    <span className="text-[7px] md:text-[9px] font-bold text-white leading-none mt-[1px]">!</span>
                                </div>
                            )}
                        </button>
                    )
                })}
            </div>
        </div>
    )
}
