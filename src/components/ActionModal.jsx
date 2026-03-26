import React from 'react'
import { PixelPanel } from './PixelPanel'
import { useLanguage } from '../LanguageContext'

export const ActionModal = ({ country, onAction, onClose, freeNukes = 0 }) => {
    const { t } = useLanguage()

    return (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <div className="w-full max-w-sm">
                <PixelPanel title={t('PROTOCOL_TITLE', { name: t(country.name) })}>
                    <div className="space-y-4">
                        <button
                            onClick={() => onAction('TECH')}
                            className="w-full text-left p-3 border-2 border-blue-500/50 bg-blue-900/30 hover:bg-blue-800/50 flex flex-col gap-1 transition-colors"
                        >
                            <span className="text-[10px] text-blue-300 font-bold">{t('TECH_ADVANCEMENT')}</span>
                            <span className="text-[7px] text-slate-400">{t('TECH_DESC')}</span>
                        </button>

                        <button
                            onClick={() => onAction('MILITARY')}
                            className="w-full text-left p-3 border-2 border-red-500/50 bg-red-900/30 hover:bg-red-800/50 flex flex-col gap-1 transition-colors"
                        >
                            <span className="text-[10px] text-red-300 font-bold">{t('MILITARY_REINFORCEMENT')}</span>
                            <span className="text-[7px] text-slate-400">{t('MIL_DESC')}</span>
                        </button>

                        <button
                            onClick={() => onAction('TRANSFER')}
                            className="w-full text-left p-3 border-2 border-green-500/50 bg-green-900/30 hover:bg-green-800/50 flex flex-col gap-1 transition-colors"
                        >
                            <span className="text-[10px] text-green-300 font-bold">{t('TRANSFER_TROOPS')}</span>
                            <span className="text-[7px] text-slate-400">{t('TRANSFER_DESC')}</span>
                        </button>

                        {country.military >= 70 && country.tech >= 70 && !country.nukeStatus && (
                            <button
                                onClick={() => onAction('NUKE_DEV')}
                                className="w-full text-left p-3 border-2 border-red-600 bg-red-950/40 hover:bg-red-900/60 flex flex-col gap-1 transition-colors animate-pulse"
                            >
                                <span className="text-[10px] text-red-400 font-bold">{t('INITIATE_NUKE')}</span>
                                <span className="text-[7px] text-slate-400">{t('NUKE_DESC')}</span>
                            </button>
                        )}

                        {freeNukes > 0 && (
                            <button
                                onClick={() => onAction('FREE_NUKE_LAUNCH')}
                                className="w-full text-left p-3 border-2 border-purple-500 bg-purple-900/40 hover:bg-purple-800/60 flex flex-col gap-1 transition-colors shadow-[0_0_10px_rgba(168,85,247,0.5)] animate-pulse"
                            >
                                <span className="text-[10px] text-purple-300 font-bold">{t('LAUNCH_TACTICAL_NUKE')} ({freeNukes})</span>
                                <span className="text-[7px] text-purple-200/70">{t('TACTICAL_NUKE_DESC')}</span>
                            </button>
                        )}

                        <button
                            onClick={() => onAction('INVADE')}
                            className="w-full text-left p-3 border-2 border-yellow-500/50 bg-yellow-900/30 hover:bg-yellow-800/50 flex flex-col gap-1 transition-colors"
                        >
                            <span className="text-[10px] text-yellow-300 font-bold">{t('COMMENCE_INVASION')}</span>
                            <span className="text-[7px] text-slate-400">{t('INVASION_DESC')}</span>
                        </button>

                        <button
                            onClick={onClose}
                            className="w-full p-2 mt-4 text-center border-2 border-slate-600 hover:bg-slate-800 text-[8px]"
                        >
                            {t('CANCEL_PROTOCOL')}
                        </button>
                    </div>
                </PixelPanel>
            </div>
        </div>
    )
}
