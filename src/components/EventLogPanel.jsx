import React, { useEffect, useRef } from 'react'
import { PixelPanel } from './PixelPanel'
import { useLanguage } from '../LanguageContext'

export const EventLogPanel = ({ events }) => {
    const { t } = useLanguage()
    const endRef = useRef(null)

    useEffect(() => {
        endRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, [events])

    return (
        <PixelPanel title={t('GLOBAL_EVENT_LOG')} className="h-[150px] overflow-hidden">
            <div className="flex flex-col h-full space-y-2 overflow-y-auto pr-2 custom-scrollbar text-[8px] md:text-sm">
                {events.map((event, i) => (
                    <div key={i} className={`flex items-start font-pixel ${event.type === 'alert' ? 'text-red-400' : 'text-slate-400'}`}>
                        <span className="opacity-50 min-w-[50px] md:min-w-[60px] inline-block font-mono text-[8px]">
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
        </PixelPanel>
    )
}
