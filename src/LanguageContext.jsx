import React, { createContext, useContext, useState, useEffect } from 'react'
import { translations } from './translations'

const LanguageContext = createContext()

export const LanguageProvider = ({ children }) => {
    // Try to get saved language from localStorage or default to 'en'
    const [lang, setLang] = useState(() => {
        const saved = localStorage.getItem('pixel_space_invasion_lang')
        return saved || 'en'
    })

    useEffect(() => {
        localStorage.setItem('pixel_space_invasion_lang', lang)
    }, [lang])

    const t = (key, params = {}) => {
        let text = translations[lang][key] || translations['en'][key] || key

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
