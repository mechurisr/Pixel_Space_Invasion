import React from 'react'
import { PixelPanel } from './PixelPanel'
import { OilIcon, TechIcon, MilitaryIcon } from './Icons'
import { useLanguage } from '../LanguageContext'

// Simple SVG Icons for the intro
const ArrowIcon = () => (
    <svg className="w-4 h-4 text-slate-500 animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
    </svg>
)

const TransferIcon = () => (
    <svg className="w-5 h-5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
    </svg>
)

const NukeIcon = () => (
    <svg className="w-5 h-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
    </svg>
)

const InvadeIcon = () => (
    <svg className="w-5 h-5 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12h3m12 0h3M12 3v3m0 12v3M12 9a3 3 0 100 6 3 3 0 000-6z" />
    </svg>
)

const AlienIcon = () => (
    <span className="text-purple-400 text-lg">☣</span>
)

const AiIcon = () => (
    <svg className="w-5 h-5 text-orange-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
    </svg>
)

export const GameIntroModal = ({ onStart }) => {
    const { t, lang, toggleLanguage } = useLanguage()

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-500">
            <div className="w-full max-w-2xl max-h-[90vh] flex flex-col">
                <PixelPanel title={t('INTRO_TITLE')} className="shadow-2xl shadow-blue-900/20 border-blue-500 flex-1 overflow-hidden">
                    <div className="p-4 space-y-8">
                        
                        {/* Resource Flow Section */}
                        <div className="bg-slate-900/50 p-4 border border-slate-700">
                            <h3 className="text-xs text-slate-400 mb-4">{t('INTRO_RESOURCE_FLOW')}</h3>
                            <div className="flex flex-col md:flex-row items-center justify-center gap-4 md:gap-8">
                                <div className="flex flex-col items-center gap-2">
                                    <div className="w-12 h-12 bg-yellow-900/30 border-2 border-yellow-600 flex items-center justify-center rounded-sm">
                                        <OilIcon />
                                    </div>
                                    <span className="text-[10px] text-yellow-500">{t('INTRO_EXTRACT')}</span>
                                </div>
                                <ArrowIcon />
                                <div className="flex flex-col items-center gap-2">
                                    <div className="w-12 h-12 bg-blue-900/30 border-2 border-blue-600 flex items-center justify-center rounded-sm">
                                        <TechIcon />
                                    </div>
                                    <span className="text-[10px] text-blue-400">{t('INTRO_RESEARCH')}</span>
                                </div>
                                <ArrowIcon />
                                <div className="flex flex-col items-center gap-2">
                                    <div className="w-12 h-12 bg-red-900/30 border-2 border-red-600 flex items-center justify-center rounded-sm">
                                        <MilitaryIcon />
                                    </div>
                                    <span className="text-[10px] text-red-500">{t('INTRO_CONQUER')}</span>
                                </div>
                            </div>
                        </div>

                        {/* Protocols & Mechanics */}
                        <div className="bg-slate-900/50 p-4 border border-slate-700">
                            <h3 className="text-xs text-slate-400 mb-4">{t('INTRO_PROTOCOLS')}</h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                {/* Tech */}
                                <div className="flex items-center gap-3 bg-slate-800/40 p-2 border border-slate-700/50 hover:bg-slate-800 transition-colors">
                                    <div className="w-8 h-8 shrink-0 bg-blue-900/30 border border-blue-500 flex items-center justify-center"><TechIcon /></div>
                                    <div className="flex flex-col min-w-0">
                                        <span className="text-[10px] text-slate-200 font-bold break-words whitespace-normal leading-tight">{t('TECH_ADVANCEMENT')}</span>
                                        <span className="text-[8px] text-blue-300 mt-1 uppercase leading-tight">{t('TECH_DESC')}</span>
                                    </div>
                                </div>
                                {/* Military */}
                                <div className="flex items-center gap-3 bg-slate-800/40 p-2 border border-slate-700/50 hover:bg-slate-800 transition-colors">
                                    <div className="w-8 h-8 shrink-0 bg-red-900/30 border border-red-500 flex items-center justify-center"><MilitaryIcon /></div>
                                    <div className="flex flex-col min-w-0">
                                        <span className="text-[10px] text-slate-200 font-bold break-words whitespace-normal leading-tight">{t('MILITARY_REINFORCEMENT')}</span>
                                        <span className="text-[8px] text-red-300 mt-1 uppercase leading-tight">{t('MIL_DESC')}</span>
                                    </div>
                                </div>
                                {/* Transfer */}
                                <div className="flex items-center gap-3 bg-slate-800/40 p-2 border border-slate-700/50 hover:bg-slate-800 transition-colors">
                                    <div className="w-8 h-8 shrink-0 bg-slate-800 border border-slate-600 flex items-center justify-center"><TransferIcon /></div>
                                    <div className="flex flex-col min-w-0">
                                        <span className="text-[10px] text-slate-200 font-bold break-words whitespace-normal leading-tight">{t('TRANSFER_TROOPS')}</span>
                                        <span className="text-[8px] text-slate-400 mt-1 uppercase leading-tight">{t('TRANSFER_DESC')}</span>
                                    </div>
                                </div>
                                {/* Invade */}
                                <div className="flex items-center gap-3 bg-slate-800/40 p-2 border border-slate-700/50 hover:bg-slate-800 transition-colors">
                                    <div className="w-8 h-8 shrink-0 bg-yellow-900/30 border border-yellow-500 flex items-center justify-center"><InvadeIcon /></div>
                                    <div className="flex flex-col min-w-0">
                                        <span className="text-[10px] text-slate-200 font-bold break-words whitespace-normal leading-tight">{t('COMMENCE_INVASION')}</span>
                                        <span className="text-[8px] text-yellow-300 mt-1 uppercase leading-tight">{t('INVASION_DESC')}</span>
                                    </div>
                                </div>
                                {/* Nuke */}
                                <div className="flex items-center gap-3 bg-slate-800/40 p-2 border border-slate-700/50 hover:bg-slate-800 transition-colors sm:col-span-2">
                                    <div className="w-8 h-8 shrink-0 bg-red-950 border border-red-600 flex items-center justify-center animate-pulse"><NukeIcon /></div>
                                    <div className="flex flex-col min-w-0">
                                        <span className="text-[10px] text-slate-200 font-bold break-words whitespace-normal leading-tight">{t('INITIATE_NUKE')}</span>
                                        <span className="text-[8px] text-red-400 mt-1 uppercase leading-tight">{t('NUKE_DESC')}</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Turn Mechanics */}
                        <div className="bg-slate-900/50 p-4 border border-slate-700 flex flex-col gap-2">
                            <h3 className="text-xs text-blue-400 font-bold">{t('INTRO_TURN_RULES')}</h3>
                            <div className="flex items-start gap-3">
                                <span className="text-blue-400 font-bold mt-0.5">!</span>
                                <p className="text-[10px] text-slate-300 leading-tight">
                                    {t('INTRO_TURN_DESC_1')}
                                </p>
                            </div>
                            <div className="flex items-start gap-3">
                                <span className="text-red-400 font-bold mt-0.5">⏭</span>
                                <p className="text-[10px] text-slate-300 leading-tight">
                                    {t('INTRO_TURN_DESC_2')}
                                </p>
                            </div>
                        </div>

                        {/* Threats Section */}
                        <div className="bg-slate-900/50 p-4 border border-slate-700">
                            <h3 className="text-xs text-slate-400 mb-4">{t('INTRO_THREATS')}</h3>
                            <div className="space-y-4">
                                <div className="flex flex-col gap-2">
                                    <div className="flex items-start gap-4">
                                        <div className="w-10 h-10 shrink-0 bg-purple-900/30 border-2 border-purple-500 flex items-center justify-center animate-pulse">
                                            <AlienIcon />
                                        </div>
                                        <p className="text-[11px] text-purple-300 leading-relaxed pt-1">
                                            {t('INTRO_ALIEN_THREAT')}
                                        </p>
                                    </div>
                                    {/* Alien Sub-types */}
                                    <div className="pl-14 flex flex-col gap-1 text-[9px] text-purple-200/70 uppercase">
                                        <span>• {t('INTRO_ALIEN_MECHA')}</span>
                                        <span>• {t('INTRO_ALIEN_PSIONIC')}</span>
                                        <span>• {t('INTRO_ALIEN_HARVESTER')}</span>
                                    </div>
                                </div>
                                <div className="flex items-start gap-4 pt-2">
                                    <div className="w-10 h-10 shrink-0 bg-orange-900/30 border-2 border-orange-500 flex items-center justify-center">
                                        <AiIcon />
                                    </div>
                                    <p className="text-[11px] text-orange-300 leading-relaxed pt-1">
                                        {t('INTRO_AI_THREAT')}
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Start Button & Lang Toggle */}
                        <div className="pt-4 flex flex-col items-center gap-4">
                            <button
                                onClick={onStart}
                                className="bg-blue-600 hover:bg-blue-500 text-white border-2 border-blue-400 px-12 py-4 text-sm tracking-widest shadow-[0_0_15px_rgba(37,99,235,0.5)] active:translate-y-1 active:shadow-none transition-all Group relative overflow-hidden"
                            >
                                {/* Glitch/Scanline effect on hover */}
                                <div className="absolute inset-0 bg-white/20 translate-y-[-100%] group-hover:translate-y-[100%] transition-transform duration-500"></div>
                                {t('START_GAME')}
                            </button>
                            
                            <button
                                onClick={toggleLanguage}
                                className="text-slate-400 hover:text-white text-[10px] underline decoration-slate-600 hover:decoration-slate-400 underline-offset-4 transition-colors"
                            >
                                {lang === 'en' ? '한국어로 전환 (KO)' : 'SWITCH TO ENGLISH (EN)'}
                            </button>
                        </div>

                    </div>
                </PixelPanel>
            </div>
        </div>
    )
}
