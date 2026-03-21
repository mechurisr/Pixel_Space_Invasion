import React from 'react'
import { PixelPanel } from './PixelPanel'
import { useLanguage } from '../LanguageContext'

const SkullIcon = () => (
    <svg className="w-16 h-16 text-red-500 animate-pulse drop-shadow-[0_0_10px_rgba(239,68,68,0.8)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4a3 3 0 00-3 3v2a3 3 0 00-3 3v3a3 3 0 001.3 2.5A3.003 3.003 0 0012 21a3.003 3.003 0 004.7-3.5A3 3 0 0018 15v-3a3 3 0 00-3-3V7a3 3 0 00-3-3z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 11h.01M15 11h.01M10 16h4" />
    </svg>
)

const TrophyIcon = () => (
    <svg className="w-16 h-16 text-yellow-400 drop-shadow-[0_0_15px_rgba(250,204,21,0.8)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 3v4M19 3v4M5 7a4 4 0 004 4h6a4 4 0 004-4M9 11v8M15 11v8M8 21h8" />
    </svg>
)

export const GameOverModal = ({ result, onRestart }) => {
    const { t } = useLanguage()
    const isVictory = result === 'VICTORY'
    
    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-md p-4 animate-in fade-in zoom-in duration-500">
            <div className="w-full max-w-lg">
                <PixelPanel 
                    title={isVictory ? t('VICTORY_TITLE') : t('DEFEAT_TITLE')} 
                    className={`shadow-2xl ${isVictory ? 'border-yellow-500 shadow-yellow-900/30' : 'border-red-600 shadow-red-900/40'}`}
                >
                    <div className="p-8 flex flex-col items-center text-center space-y-6">
                        
                        <div className="animate-bounce">
                            {isVictory ? <TrophyIcon /> : <SkullIcon />}
                        </div>

                        <h2 className={`text-2xl font-bold tracking-widest ${isVictory ? 'text-yellow-400' : 'text-red-500'}`}>
                            {isVictory ? t('VICTORY_TITLE') : t('DEFEAT_TITLE')}
                        </h2>

                        <p className={`text-sm leading-relaxed ${isVictory ? 'text-yellow-100/80' : 'text-red-200/80'}`}>
                            {isVictory ? t('VICTORY_DESC') : t('DEFEAT_DESC')}
                        </p>

                        <div className="pt-6 w-full">
                            <button
                                onClick={onRestart}
                                className={`w-full py-4 text-sm tracking-widest border-2 transition-all group relative overflow-hidden ${
                                    isVictory 
                                    ? 'bg-yellow-600 hover:bg-yellow-500 border-yellow-400 text-white shadow-[0_0_15px_rgba(202,138,4,0.5)]' 
                                    : 'bg-red-700 hover:bg-red-600 border-red-500 text-white shadow-[0_0_15px_rgba(220,38,38,0.5)]'
                                }`}
                            >
                                <div className="absolute inset-0 bg-white/20 translate-y-[-100%] group-hover:translate-y-[100%] transition-transform duration-500"></div>
                                {t('PLAY_AGAIN')}
                            </button>
                        </div>
                    </div>
                </PixelPanel>
            </div>
        </div>
    )
}
