import React from 'react'

export const InteractiveMap = ({ territories, onSelect, selectedId, playerIds, aiData, aiFactions, invasionTargetMode, transferTargetMode, nukeTargetMode }) => {
    return (
        <div className="relative w-full h-full bg-black/40 border-4 border-pixel-border overflow-auto">
            <div className="min-w-[1200px] min-h-[600px] w-full h-full relative">
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
                {territories.map((t) => {
                    const isPlayer = playerIds?.includes(t.id)
                    const isSelected = selectedId === t.id

                    // Check AI Owner
                    const owningAi = aiData?.find(f => f.territoryIds.includes(t.id))
                    const aiMeta = owningAi ? aiFactions?.find(f => f.id === owningAi.factionId) : null

                    // Targetable if it's a neighbor of the CURRENTLY invading region
                    const isTargetable = invasionTargetMode && territories.find(pt => pt.id === invasionTargetMode)?.neighbors.includes(t.id)

                    // Transfer targetable if it's a neighbor of the source region AND is player owned
                    const isTransferTargetable = transferTargetMode && territories.find(st => st.id === transferTargetMode)?.neighbors.includes(t.id) && isPlayer

                    // Nuke targetable is ANY region
                    const isNukeTarget = nukeTargetMode && t.id !== nukeTargetMode

                    let nodeClass = 'bg-slate-800/80 border-slate-600 focus:bg-slate-700'
                    let textClass = 'text-slate-300'
                    let label = null

                    if (t.isOccupied) {
                        nodeClass = 'bg-purple-950/90 border-purple-800 text-purple-400 animate-pulse'
                        textClass = 'text-purple-300'
                    }
                    else if (isPlayer) {
                        nodeClass = 'bg-green-600/80 border-green-400 shadow-[0_0_15px_rgba(74,222,128,0.5)]'
                        textClass = 'text-white'
                        label = <span className="absolute -top-4 text-[6px] text-green-400 drop-shadow-md">OWNED</span>
                    }
                    else if (aiMeta) {
                        nodeClass = `bg-gray-900/90 border-2 ${aiMeta.borderClass} ${aiMeta.bgClass?.replace('900', '800')} shadow-lg`
                        textClass = aiMeta.colorClass
                        label = <span className={`absolute -top-4 text-[5px] ${aiMeta.colorClass} drop-shadow-md`}>{aiMeta.id}</span>
                    }

                    if (isTargetable && !isPlayer) {
                        nodeClass += ' ring-4 ring-red-500 ring-offset-2 ring-offset-black animate-pulse cursor-crosshair z-20'
                    } else if (isTransferTargetable) {
                        nodeClass += ' ring-4 ring-green-400 ring-offset-2 ring-offset-black animate-pulse cursor-pointer z-20'
                    } else if (isNukeTarget) {
                        nodeClass += ' ring-[6px] ring-red-600 ring-offset-4 ring-offset-black animate-[ping_1s_infinite] cursor-crosshair z-30'
                    } else if (isSelected) {
                        nodeClass += ' ring-2 ring-blue-400'
                    }

                    return (
                        <button
                            key={t.id}
                            onClick={() => onSelect(t)}
                            style={{ left: `${t.x}%`, top: `${t.y}%`, transform: 'translate(-50%, -50%)' }}
                            className={`
                  absolute w-8 h-8 md:w-12 md:h-12 border-2 shadow-pixel transition-all duration-200
                  ${nodeClass}
                  active:scale-95 flex flex-col items-center justify-center group z-10
                `}
                        >
                            {label}
                            <span className={`text-[5px] md:text-[6px] font-bold ${textClass} transition-colors text-center leading-none px-1`}>
                                {t.isOccupied ? '☣' : t.code}
                            </span>
                            {t.hasEvent && !t.isOccupied && (
                                <div className="absolute top-0 right-0 w-2 h-2 bg-red-500 animate-ping rounded-full -mt-1 -mr-1"></div>
                            )}
                        </button>
                    )
                })}
            </div>
        </div>
    )
}
