import React from 'react'
import { PixelPanel } from './PixelPanel'

export const ActionModal = ({ country, onAction, onClose }) => {
    return (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <div className="w-full max-w-sm">
                <PixelPanel title={`EXECUTE PROTOCOL: ${country.name}`}>
                    <div className="space-y-4">
                        <button
                            onClick={() => onAction('TECH')}
                            className="w-full text-left p-3 border-2 border-blue-500/50 bg-blue-900/30 hover:bg-blue-800/50 flex flex-col gap-1 transition-colors"
                        >
                            <span className="text-[10px] text-blue-300 font-bold">▶ TECHNOLOGY ADVANCEMENT</span>
                            <span className="text-[7px] text-slate-400">COST: 20 CRUDE OIL | GAIN: +15 TECH ASSETS</span>
                        </button>

                        <button
                            onClick={() => onAction('MILITARY')}
                            className="w-full text-left p-3 border-2 border-red-500/50 bg-red-900/30 hover:bg-red-800/50 flex flex-col gap-1 transition-colors"
                        >
                            <span className="text-[10px] text-red-300 font-bold">▶ MILITARY REINFORCEMENT</span>
                            <span className="text-[7px] text-slate-400">COST: 20 TECH ASSETS | GAIN: +15 MILITARY FORCE</span>
                        </button>

                        <button
                            onClick={() => onAction('INVADE')}
                            className="w-full text-left p-3 border-2 border-yellow-500/50 bg-yellow-900/30 hover:bg-yellow-800/50 flex flex-col gap-1 transition-colors"
                        >
                            <span className="text-[10px] text-yellow-300 font-bold">▶ COMMENCE INVASION</span>
                            <span className="text-[7px] text-slate-400">TARGET A NEIGHBORING SECTOR. COMPARES MILITARY.</span>
                        </button>

                        <button
                            onClick={onClose}
                            className="w-full p-2 mt-4 text-center border-2 border-slate-600 hover:bg-slate-800 text-[8px]"
                        >
                            [ CANCEL PROTOCOL ]
                        </button>
                    </div>
                </PixelPanel>
            </div>
        </div>
    )
}
