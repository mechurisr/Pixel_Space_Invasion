import React, { useState } from 'react';
import { useLanguage } from '../LanguageContext';
import { QUESTS } from '../questsData';

export const QuestPanel = ({ offeredQuest, activeQuest, onAccept, onDecline, onClaimReward, onDismiss }) => {
    const { t } = useLanguage();
    const [isMinimized, setIsMinimized] = useState(false);

    if (!offeredQuest && !activeQuest) return null;

    const quest = offeredQuest || activeQuest;
    const isOffered = !!offeredQuest;
    const qData = QUESTS.find(q => q.id === quest.questId) || quest.questData;

    if (isMinimized) {
        return (
            <div className="fixed bottom-40 left-4 z-50 w-72 flex items-center justify-between bg-black/80 border-2 border-yellow-500 p-2 cursor-pointer hover:bg-gray-800 pointer-events-auto"
                 onClick={() => setIsMinimized(false)}>
                <span className={`font-pixel text-sm font-bold truncate pr-2 ${quest.status === 'COMPLETED' ? 'text-green-400' : quest.status === 'FAILED' ? 'text-red-400' : 'text-yellow-400'}`}>
                    {isOffered ? "NEW QUEST!" : quest.status === 'COMPLETED' ? `SUCCESS: ${qData.title}` : quest.status === 'FAILED' ? `FAILED: ${qData.title}` : `ACTIVE: ${qData.title}`}
                </span>
                <button className="ml-4 text-gray-400 hover:text-white px-2">
                    [+]
                </button>
            </div>
        );
    }

    return (
        <div className="fixed bottom-40 left-4 z-50 w-80 bg-black/80 border-2 border-yellow-500 shadow-[0_0_15px_rgba(234,179,8,0.5)] font-pixel text-white pointer-events-auto">
            {/* Header / Minimize Button */}
            <div className="absolute top-2 right-2 z-10">
                <button 
                    onClick={() => setIsMinimized(true)}
                    className="text-white/70 hover:text-white bg-black/50 px-2 py-1 rounded text-xs border border-white/20"
                >
                    [-]
                </button>
            </div>

            {/* Header Image */}
            <div className="w-full h-32 overflow-hidden border-b-2 border-yellow-500/50">
                <img src={qData.image} alt="Quest" className="w-full h-full object-cover" />
            </div>

            <div className="p-4 space-y-4">
                <div className="text-center">
                    <h3 className={`text-xl mb-1 ${quest.status === 'COMPLETED' ? 'text-green-400' : quest.status === 'FAILED' ? 'text-red-500' : 'text-yellow-400'}`}>
                        {isOffered ? "NEW QUEST" : quest.status === 'COMPLETED' ? "QUEST COMPLETED" : quest.status === 'FAILED' ? "QUEST FAILED" : "ACTIVE QUEST"}
                    </h3>
                    <div className="text-sm font-bold text-gray-300">
                        {qData.title}
                    </div>
                </div>

                {isOffered ? (
                    <>
                        <div className="text-xs text-gray-400 leading-relaxed">
                            {qData.scenario}
                        </div>
                        <div className="bg-blue-900/40 p-2 border border-blue-500/30 rounded text-xs">
                            <span className="text-blue-400 block mb-1">목표:</span>
                            {qData.getConditionText(quest.targetName)}
                        </div>
                        <div className="bg-green-900/40 p-2 border border-green-500/30 rounded text-xs">
                            <span className="text-green-400 block mb-1">보상:</span>
                            {qData.getRewardText()}
                        </div>

                        <div className="flex gap-2 pt-2">
                            <button
                                onClick={onAccept}
                                className="flex-1 bg-green-600 hover:bg-green-500 text-white py-2 border-b-4 border-green-800 active:border-b-0 active:mt-1 transition-all"
                            >
                                수락
                            </button>
                            <button
                                onClick={onDecline}
                                className="flex-1 bg-red-600 hover:bg-red-500 text-white py-2 border-b-4 border-red-800 active:border-b-0 active:mt-1 transition-all"
                            >
                                거절
                            </button>
                        </div>
                    </>
                ) : (
                    <>
                        {quest.status === 'FAILED' ? (
                            <div className="bg-red-900/40 p-2 border border-red-500/30 rounded text-sm text-red-200 text-center leading-relaxed">
                                작전이 실패했습니다.<br />목표를 달성하지 못했습니다.
                            </div>
                        ) : (
                            <div className="bg-blue-900/40 p-2 border border-blue-500/30 rounded text-xs">
                                <span className="text-blue-400 block mb-1">목표:</span>
                                {qData.getConditionText(quest.targetName)}
                            </div>
                        )}
                        
                        {quest.status === 'COMPLETED' ? (
                            <div className="flex gap-2 pt-2">
                                <button
                                    onClick={onClaimReward}
                                    className="flex-1 bg-yellow-600 hover:bg-yellow-500 text-white py-2 border-b-4 border-yellow-800 active:border-b-0 active:mt-1 transition-all"
                                >
                                    보상 수령
                                </button>
                            </div>
                        ) : quest.status === 'FAILED' ? (
                            <div className="flex gap-2 pt-2">
                                <button
                                    onClick={onDismiss}
                                    className="flex-1 bg-gray-600 hover:bg-gray-500 text-white py-2 border-b-4 border-gray-800 active:border-b-0 active:mt-1 transition-all"
                                >
                                    확인
                                </button>
                            </div>
                        ) : (
                            <div className="flex justify-between items-center text-xs bg-gray-800/50 p-2 border border-gray-600">
                                <span>남은 시간:</span>
                                <span className="text-yellow-400 text-lg font-bold">
                                    {quest.remainingTurns} Turn
                                </span>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};
