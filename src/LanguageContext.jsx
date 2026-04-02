import React, { createContext, useContext, useState, useEffect } from 'react'
import { translations } from './translations'

const LanguageContext = createContext()

export const LanguageProvider = ({ children }) => {
    // Try to get saved language from localStorage or default based on region
    const [lang, setLang] = useState(() => {
        const saved = localStorage.getItem('pixel_space_invasion_lang')
        if (saved) return saved
        
        try {
            const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone
            if (timeZone === 'Asia/Seoul') {
                return 'ko'
            }
            if (navigator.language && navigator.language.startsWith('ko')) {
                return 'ko'
            }
        } catch (e) {
            // fallback
        }
        return 'en'
    })

    useEffect(() => {
        localStorage.setItem('pixel_space_invasion_lang', lang)
    }, [lang])

    const t = (key, params = {}) => {
        const keys = key.split('.');
        let text = keys.reduce((obj, k) => (obj || {})[k], translations[lang]) 
                   || keys.reduce((obj, k) => (obj || {})[k], translations['en']) 
                   || key;

        // Replace parameters like {turn} or {name}
        Object.keys(params).forEach(p => {
            text = text.replace(`{${p}}`, params[p])
        })

        return text
    }

    const toggleLanguage = () => {
        setLang(prev => (prev === 'en' ? 'ko' : 'en'))
    }

    return (
        <LanguageContext.Provider value={{ lang, setLang, t, toggleLanguage }}>
            {children}
        </LanguageContext.Provider>
    )
}

export const useLanguage = () => {
    const context = useContext(LanguageContext)
    if (!context) {
        throw new Error('useLanguage must be used within a LanguageProvider')
    }
    return context
}
