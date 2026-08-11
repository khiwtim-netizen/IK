import React from 'react';
import { Achievement, Language } from '../types';
import { soundEngine } from '../utils/sound';
import { X, Award, CheckCircle2, Gift } from 'lucide-react';

interface AchievementsModalProps {
  isOpen: boolean;
  onClose: () => void;
  achievements: Achievement[];
  onClaimReward: (achievementId: string, rewardCheese: number) => void;
  language: Language;
}

export const AchievementsModal: React.FC<AchievementsModalProps> = ({
  isOpen,
  onClose,
  achievements,
  onClaimReward,
  language,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-md z-50 flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="bg-amber-950 text-amber-50 border-4 border-amber-700 rounded-3xl max-w-xl w-full p-5 sm:p-7 shadow-2xl relative">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-amber-800">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-800 flex items-center justify-center text-2xl border border-amber-600">
              🏆
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-amber-200">
                {language === 'th' ? 'ภารกิจ & ความสำเร็จ' : 'Quests & Achievements'}
              </h2>
              <p className="text-xs text-amber-300">
                {language === 'th' ? 'พิชิตเป้าหมายเพื่อรับรางวัลเนยแข็งพิเศษ!' : 'Complete targets to earn bonus cheese!'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-2xl bg-amber-900 hover:bg-amber-800 text-amber-300 hover:text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* List */}
        <div className="space-y-3 my-5 max-h-[60vh] overflow-y-auto pr-1">
          {achievements.map(ach => {
            const isDone = ach.progress >= ach.maxProgress;
            const percentage = Math.min(100, Math.round((ach.progress / ach.maxProgress) * 100));

            return (
              <div
                key={ach.id}
                className={`p-4 rounded-2xl border-2 transition flex items-center justify-between ${
                  ach.completed
                    ? 'bg-amber-900/40 border-amber-800/60 text-amber-300'
                    : isDone
                    ? 'bg-gradient-to-r from-amber-900 to-orange-950 border-amber-400 text-white shadow-md'
                    : 'bg-amber-950/70 border-amber-900 text-amber-100'
                }`}
              >
                <div className="flex items-center space-x-3.5">
                  <div className="text-3xl bg-amber-900/60 p-2.5 rounded-2xl border border-amber-700/60">
                    {ach.icon}
                  </div>
                  <div>
                    <h3 className="font-black text-sm sm:text-base text-amber-100">
                      {language === 'th' ? ach.titleTh : ach.titleEn}
                    </h3>
                    <p className="text-xs text-amber-300/80">
                      {language === 'th' ? ach.descTh : ach.descEn}
                    </p>

                    {/* Progress Bar */}
                    <div className="w-36 sm:w-48 bg-amber-950 h-2 rounded-full overflow-hidden mt-2 border border-amber-800">
                      <div
                        className="bg-amber-400 h-full transition-all duration-300"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                    <div className="text-[10px] text-amber-400 font-mono mt-0.5">
                      {ach.progress} / {ach.maxProgress} ({percentage}%)
                    </div>
                  </div>
                </div>

                {/* Claim / Status Button */}
                <div>
                  {ach.completed ? (
                    <div className="flex items-center space-x-1 text-xs font-bold text-emerald-400 bg-emerald-950/80 px-3 py-1.5 rounded-xl border border-emerald-800">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>{language === 'th' ? 'รับแล้ว' : 'Claimed'}</span>
                    </div>
                  ) : isDone ? (
                    <button
                      onClick={() => {
                        soundEngine.playPowerUp();
                        onClaimReward(ach.id, ach.rewardCheese);
                      }}
                      className="px-3.5 py-1.5 bg-gradient-to-r from-amber-400 to-orange-500 hover:from-amber-300 hover:to-orange-400 text-amber-950 font-black text-xs rounded-xl shadow-lg flex items-center space-x-1 animate-bounce"
                    >
                      <Gift className="w-4 h-4" />
                      <span>+ {ach.rewardCheese} 🧀</span>
                    </button>
                  ) : (
                    <div className="text-xs font-bold text-amber-400/80 bg-amber-950 px-2.5 py-1 rounded-xl border border-amber-900">
                      + {ach.rewardCheese} 🧀
                    </div>
                  )}
                </div>

              </div>
            );
          })}
        </div>

      </div>
    </div>
  );
};
