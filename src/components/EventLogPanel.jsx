import React, { useEffect, useRef, useState } from 'react'
import { useLanguage } from '../LanguageContext'

export const EventLogPanel = ({ events }) => {
    const { t } = useLanguage()
    const endRef = useRef(null)
    const [isExpanded, setIsExpanded] = useState(window.innerWidth >= 768)

    useEffect(() => {
        if (isExpanded) {
            endRef.current?.scrollIntoView({ behavior: 'smooth' })
        }
    }, [events, isExpanded])

    // Update state on orientation/resize change so it defaults correctly on desktop
    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth >= 768) {
                setIsExpanded(true)
            }
        }
        window.addEventListener('resize', handleResize)
        return () => window.removeEventListener('resize', handleResize)
    }, [])

    const recentEvent = events.length > 0 ? events[events.length - 1] : null;

    return (
        <div className={`relative bg-pixel-panel border-[4px] border-pixel-border shadow-pixel flex flex-col transition-all duration-300 ${isExpanded ? 'h-[150px] md:h-[200px] p-4' : 'p-2 md:p-3'}`}>
            <div 
                className={`flex justify-between items-center w-full cursor-pointer text-blue-400 font-bold ${isExpanded ? 'mb-2 border-b-2 border-pixel-border/30 pb-2 text-xs md:text-sm' : 'text-[10px] md:text-xs'}`}
                onClick={() => setIsExpanded(!isExpanded)}
            >
                <div className="flex items-center gap-2 overflow-hidden flex-1">
                    <span className="shrink-0">{`> ${t('GLOBAL_EVENT_LOG')}`}</span>
                    {!isExpanded && recentEvent && (
                        <span className={`text-slate-400 font-normal truncate font-pixel ml-4 flex-1 ${recentEvent.type === 'alert' ? 'text-red-400' : 'text-slate-400'}`}>
                            {recentEvent.message}
                        </span>
                    )}
                </div>
                <button className="text-yellow-400 hover:text-white px-2 shrink-0 animate-pulse">
                    {isExpanded ? '▼' : '▲'}
                </button>
            </div>
            
            {isExpanded && (
                <div className="flex-1 flex flex-col h-full space-y-2 overflow-y-auto pr-2 custom-scrollbar text-[8px] md:text-sm">
                    {events.map((event, i) => (
                        <div key={i} className={`flex items-start font-pixel ${event.type === 'alert' ? 'text-red-400' : 'text-slate-400'}`}>
                            <span className="opacity-50 min-w-[50px] md:min-w-[70px] inline-block font-mono text-[8px] md:text-[10px]">
                                {event.timestamp}
                            </span>
                            <span className="flex-1 leading-relaxed">{event.message}</span>
                        </div>
                    ))}
                    <div ref={endRef} />
                    {events.length === 0 && (
                        <p className="text-[10px] text-slate-600">{t('WAITING_FOR_INTEL')}</p>
                    )}
                </div>
            )}
        </div>
    )
}
