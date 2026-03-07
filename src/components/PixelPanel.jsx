import React from 'react'

export const PixelPanel = ({ children, title, className = '' }) => {
    return (
        <div className={`relative bg-pixel-panel border-[4px] border-pixel-border shadow-pixel p-4 ${className} flex flex-col`}>
            {title && (
                <div className="mb-4 text-sm font-bold border-b-2 border-pixel-border/30 pb-2 text-blue-400">
                    {`> ${title}`}
                </div>
            )}
            <div className="flex-1 overflow-auto">
                {children}
            </div>
        </div>
    )
}
