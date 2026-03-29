import React from 'react';
import { useLanguage } from '../LanguageContext';
import steelPortrait from '../assets/captain_steel.png';

export const TutorialInstructorPanel = ({ step, onNextStep }) => {
    const { t } = useLanguage();

    if (step < 0) return null;

    const dialogText = t(`TUTORIAL.STEP_${step}`);

    return (
        <div className="fixed bottom-0 left-0 w-full z-50 p-4 pointer-events-none flex justify-center">
            <div className="w-full max-w-2xl bg-slate-900 border-4 border-blue-600 shadow-[0_0_20px_rgba(37,99,235,0.5)] p-4 flex gap-4 pointer-events-auto relative mt-auto">
                {/* Instructor Portrait */}
                <div className="w-16 h-16 md:w-24 md:h-24 bg-slate-800 border-2 border-blue-400 flex-shrink-0 flex items-center justify-center overflow-hidden relative shadow-[0_0_10px_rgba(37,99,235,0.3)]">
                    <img 
                        src={steelPortrait} 
                        alt="Captain Steel" 
                        className="w-full h-full object-cover pixelated"
                    />
                </div>

                {/* Dialog Content */}
                <div className="flex-1 flex flex-col justify-between">
                    <div>
                        <div className="text-yellow-400 text-[10px] md:text-xs mb-1 tracking-wider uppercase">
                            Captain Steel
                        </div>
                        <div className="text-white text-xs md:text-sm leading-relaxed typing-effect">
                            {dialogText}
                        </div>
                    </div>

                    {/* Next step prompt if wait for manual click (step 0 and 10) */}
                    {(step === 0 || step === 10) && (
                        <div className="mt-4 flex justify-end">
                            <button
                                onClick={onNextStep}
                                className="bg-blue-600 hover:bg-blue-500 text-white text-[10px] px-4 py-2 border-2 border-blue-400 active:translate-y-1"
                            >
                                {step === 10 ? t('TUTORIAL.FINISH_BTN') : "CLICK TO CONTINUE"}
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
